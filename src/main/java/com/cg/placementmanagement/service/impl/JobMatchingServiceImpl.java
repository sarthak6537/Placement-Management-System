package com.cg.placementmanagement.service.impl;

import com.cg.placementmanagement.dto.EligibilityResultDto;
import com.cg.placementmanagement.dto.RecommendedJobDto;
import com.cg.placementmanagement.dto.SkillGapDto;
import com.cg.placementmanagement.entity.JobPosting;
import com.cg.placementmanagement.entity.StudentProfile;
import com.cg.placementmanagement.exception.StudentNotFoundException;
import com.cg.placementmanagement.repository.JobPostingRepository;
import com.cg.placementmanagement.repository.StudentProfileRepository;
import com.cg.placementmanagement.service.EligibilityService;
import com.cg.placementmanagement.service.JobMatchingService;
import com.cg.placementmanagement.service.SkillGapService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Orchestrates EligibilityService + SkillGapService to produce
 * a combined match result for each job.
 *
 * For recommended jobs:
 *   - All OPEN jobs are evaluated
 *   - Sorted by match score descending (highest first)
 *   - Eligible jobs appear before ineligible ones at equal scores
 */
@Service
@Transactional(readOnly = true)
public class JobMatchingServiceImpl implements JobMatchingService {

    private final JobPostingRepository jobPostingRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final EligibilityService eligibilityService;
    private final SkillGapService skillGapService;

    public JobMatchingServiceImpl(JobPostingRepository jobPostingRepository,
                                   StudentProfileRepository studentProfileRepository,
                                   EligibilityService eligibilityService,
                                   SkillGapService skillGapService) {
        this.jobPostingRepository = jobPostingRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.eligibilityService = eligibilityService;
        this.skillGapService = skillGapService;
    }

    // ── public API ──────────────────────────────────────────────────────────

    @Override
    public RecommendedJobDto getMatchResult(Long jobId, Long studentId) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        StudentProfile profile = studentProfileRepository.findByStudentId(studentId)
                .orElseThrow(() -> new StudentNotFoundException(
                        "No student profile found for student id: " + studentId));

        return buildDto(job, profile);
    }

    @Override
    public List<RecommendedJobDto> getRecommendedJobs(Long studentId) {
        StudentProfile profile = studentProfileRepository.findByStudentId(studentId)
                .orElseThrow(() -> new StudentNotFoundException(
                        "No student profile found for student id: " + studentId));

        return jobPostingRepository.findAll().stream()
                .filter(j -> "OPEN".equalsIgnoreCase(j.getStatus()))
                .map(job -> buildDto(job, profile))
                // Sort: eligible first, then by match score descending
                .sorted(Comparator
                        .comparing(RecommendedJobDto::isEligible).reversed()
                        .thenComparingInt(RecommendedJobDto::getMatchScore).reversed())
                .collect(Collectors.toList());
    }

    // ── internal builder ────────────────────────────────────────────────────

    private RecommendedJobDto buildDto(JobPosting job, StudentProfile profile) {
        EligibilityResultDto eligibility = eligibilityService.checkEligibility(job, profile);
        SkillGapDto skillGap            = skillGapService.analyzeSkillGap(job, profile);

        RecommendedJobDto dto = new RecommendedJobDto();
        dto.setJobId(job.getId());
        dto.setJobTitle(job.getTitle());
        dto.setCompanyName(job.getCompany() != null ? job.getCompany().getName() : "Unknown");
        dto.setLocation(job.getLocation());
        dto.setEmploymentType(job.getEmploymentType());
        dto.setStatus(job.getStatus());
        dto.setApplicationDeadline(
                job.getApplicationDeadline() != null ? job.getApplicationDeadline().toString() : null);

        dto.setEligible(eligibility.isEligible());
        dto.setEligibilityReasons(eligibility.getReasons());

        dto.setMatchScore(skillGap.getMatchScore());
        dto.setRequiredSkills(skillGap.getRequiredSkills());
        dto.setMatchedSkills(skillGap.getMatchedSkills());
        dto.setMissingSkills(skillGap.getMissingSkills());
        dto.setRecommendations(skillGap.getRecommendations());

        return dto;
    }
}
