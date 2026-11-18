package com.cg.placementmanagement.service.impl;

import com.cg.placementmanagement.dto.SkillGapDto;
import com.cg.placementmanagement.entity.JobPosting;
import com.cg.placementmanagement.entity.Skill;
import com.cg.placementmanagement.entity.StudentProfile;
import com.cg.placementmanagement.exception.StudentNotFoundException;
import com.cg.placementmanagement.repository.JobPostingRepository;
import com.cg.placementmanagement.repository.StudentProfileRepository;
import com.cg.placementmanagement.service.SkillGapService;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Compares a student's skills with the required skills of a job.
 *
 * Matching is case-insensitive.
 *
 * For each missing skill a simple rule-based recommendation is generated.
 * The recommendation map can be extended at any time without changing the architecture.
 */
@Service
public class SkillGapServiceImpl implements SkillGapService {

    private final JobPostingRepository jobPostingRepository;
    private final StudentProfileRepository studentProfileRepository;

    // Rule-based recommendation map: skill keyword → learning tip
    private static final Map<String, String> RECOMMENDATIONS = new LinkedHashMap<>();

    static {
        RECOMMENDATIONS.put("java",          "Learn Java fundamentals: OOP, Collections, Exception Handling.");
        RECOMMENDATIONS.put("spring",        "Learn Spring / Spring Boot: dependency injection, REST APIs, JPA.");
        RECOMMENDATIONS.put("spring boot",   "Learn Spring Boot: auto-configuration, REST controllers, JPA repositories.");
        RECOMMENDATIONS.put("hibernate",     "Learn Hibernate / JPA: entities, mappings, JPQL, transactions.");
        RECOMMENDATIONS.put("jpa",           "Learn JPA: entity lifecycle, relationships, and JPQL queries.");
        RECOMMENDATIONS.put("sql",           "Learn SQL: SELECT, JOIN, GROUP BY, indexes, and transactions.");
        RECOMMENDATIONS.put("postgresql",    "Learn PostgreSQL: data types, indexes, transactions, and psql commands.");
        RECOMMENDATIONS.put("mysql",         "Learn MySQL: schema design, queries, indexes, and stored procedures.");
        RECOMMENDATIONS.put("react",         "Learn React: components, hooks (useState, useEffect), React Router.");
        RECOMMENDATIONS.put("javascript",    "Learn JavaScript: ES6+, async/await, DOM manipulation, fetch API.");
        RECOMMENDATIONS.put("typescript",    "Learn TypeScript: types, interfaces, generics, and integration with React.");
        RECOMMENDATIONS.put("html",          "Learn HTML5: semantic elements, forms, accessibility basics.");
        RECOMMENDATIONS.put("css",           "Learn CSS3: flexbox, grid, responsive design, and Bootstrap.");
        RECOMMENDATIONS.put("python",        "Learn Python: syntax, OOP, file I/O, popular libraries (pandas, requests).");
        RECOMMENDATIONS.put("django",        "Learn Django: MVT pattern, ORM, views, templates, REST framework.");
        RECOMMENDATIONS.put("node",          "Learn Node.js: event loop, Express framework, npm, async patterns.");
        RECOMMENDATIONS.put("nodejs",        "Learn Node.js: event loop, Express framework, npm, async patterns.");
        RECOMMENDATIONS.put("express",       "Learn Express.js: routing, middleware, REST API design.");
        RECOMMENDATIONS.put("mongodb",       "Learn MongoDB: documents, collections, aggregation pipeline, Mongoose.");
        RECOMMENDATIONS.put("git",           "Learn Git: branching, merging, pull requests, rebasing.");
        RECOMMENDATIONS.put("docker",        "Learn Docker: images, containers, Dockerfile, docker-compose basics.");
        RECOMMENDATIONS.put("aws",           "Learn AWS basics: EC2, S3, IAM, RDS, and CLI usage.");
        RECOMMENDATIONS.put("rest",          "Learn REST API design: HTTP methods, status codes, JSON, Postman.");
        RECOMMENDATIONS.put("api",           "Learn REST API design: HTTP methods, status codes, JSON, Postman.");
        RECOMMENDATIONS.put("microservices", "Learn Microservices: service decomposition, REST communication, Spring Cloud basics.");
        RECOMMENDATIONS.put("kafka",         "Learn Apache Kafka: topics, producers, consumers, and event-driven design.");
        RECOMMENDATIONS.put("redis",         "Learn Redis: caching, pub/sub, data structures, and Spring Cache integration.");
        RECOMMENDATIONS.put("junit",         "Learn JUnit 5: unit testing, assertions, mocking with Mockito.");
        RECOMMENDATIONS.put("testing",       "Learn testing: unit tests with JUnit, integration tests, Mockito mocking.");
        RECOMMENDATIONS.put("maven",         "Learn Maven: pom.xml, dependency management, lifecycle phases.");
        RECOMMENDATIONS.put("linux",         "Learn Linux basics: shell commands, file permissions, process management.");
        RECOMMENDATIONS.put("c",             "Review C programming: pointers, memory management, data structures.");
        RECOMMENDATIONS.put("c++",           "Review C++: OOP, STL containers, templates, memory management.");
        RECOMMENDATIONS.put("data structures","Study Data Structures: arrays, linked lists, trees, graphs, and hash maps.");
        RECOMMENDATIONS.put("algorithms",    "Study Algorithms: sorting, searching, dynamic programming, complexity analysis.");
        RECOMMENDATIONS.put("machine learning","Start Machine Learning: linear regression, classification, scikit-learn basics.");
        RECOMMENDATIONS.put("deep learning", "Learn Deep Learning: neural networks, TensorFlow/Keras, CNNs and RNNs.");
        RECOMMENDATIONS.put("angular",       "Learn Angular: components, services, modules, RxJS, and Angular CLI.");
        RECOMMENDATIONS.put("vue",           "Learn Vue.js: components, directives, Vuex state management.");
        RECOMMENDATIONS.put("kotlin",        "Learn Kotlin: null safety, extension functions, coroutines, Android basics.");
    }

    public SkillGapServiceImpl(JobPostingRepository jobPostingRepository,
                                StudentProfileRepository studentProfileRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    // ── public API ──────────────────────────────────────────────────────────

    @Override
    public SkillGapDto analyzeSkillGap(Long jobId, Long studentId) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        StudentProfile profile = studentProfileRepository.findByStudentId(studentId)
                .orElseThrow(() -> new StudentNotFoundException(
                        "No student profile found for student id: " + studentId));

        return analyzeSkillGap(job, profile);
    }

    @Override
    public SkillGapDto analyzeSkillGap(JobPosting job, StudentProfile profile) {
        SkillGapDto dto = new SkillGapDto();
        dto.setJobId(job.getId());
        dto.setStudentId(profile.getStudent().getId());

        // Required skills from the job (from requiredSkills field)
        List<String> required = parseRequiredSkills(job.getRequiredSkills());
        dto.setRequiredSkills(required);

        if (required.isEmpty()) {
            // No required skills defined — perfect match, no gaps
            dto.setMatchedSkills(List.of());
            dto.setMissingSkills(List.of());
            dto.setRecommendations(List.of());
            dto.setMatchScore(100);
            return dto;
        }

        // Student's skills (case-insensitive set)
        Set<String> studentSkillsLower = profile.getSkills().stream()
                .map(Skill::getName)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String req : required) {
            if (studentSkillsLower.contains(req.toLowerCase())) {
                matched.add(req);
            } else {
                missing.add(req);
            }
        }

        // Match score = matched / total required * 100
        int score = (int) Math.round((double) matched.size() / required.size() * 100);

        List<String> recs = missing.stream()
                .map(this::getRecommendation)
                .collect(Collectors.toList());

        dto.setMatchedSkills(matched);
        dto.setMissingSkills(missing);
        dto.setRecommendations(recs);
        dto.setMatchScore(score);

        return dto;
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    private List<String> parseRequiredSkills(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    /**
     * Finds a recommendation for a missing skill.
     * Tries longest key match first (so "Spring Boot" beats "Spring").
     */
    private String getRecommendation(String skill) {
        String lower = skill.toLowerCase();

        // Try exact match first
        if (RECOMMENDATIONS.containsKey(lower)) {
            return "Missing: " + skill + " — " + RECOMMENDATIONS.get(lower);
        }

        // Try partial match (key is contained in skill or skill is contained in key)
        for (Map.Entry<String, String> entry : RECOMMENDATIONS.entrySet()) {
            if (lower.contains(entry.getKey()) || entry.getKey().contains(lower)) {
                return "Missing: " + skill + " — " + entry.getValue();
            }
        }

        // Generic fallback
        return "Missing: " + skill + " — Study " + skill + " fundamentals and build a small project to practise.";
    }
}
