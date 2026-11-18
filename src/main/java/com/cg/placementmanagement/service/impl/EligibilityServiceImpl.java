package com.cg.placementmanagement.service.impl;

import com.cg.placementmanagement.dto.EligibilityResultDto;
import com.cg.placementmanagement.entity.JobPosting;
import com.cg.placementmanagement.entity.StudentProfile;
import com.cg.placementmanagement.exception.StudentNotFoundException;
import com.cg.placementmanagement.repository.JobPostingRepository;
import com.cg.placementmanagement.repository.StudentProfileRepository;
import com.cg.placementmanagement.service.EligibilityService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Checks a student's profile against a job's eligibility requirements.
 *
 * Rules:
 *  1. minimumCgpa   — student CGPA must be >= job's minimumCgpa
 *  2. eligibleBranches — student department must appear in the comma-separated list
 *  3. graduationYear   — student batch must contain the required graduation year
 *
 * If a job has no value set for a requirement, that check is skipped (open to all).
 */
@Service
public class EligibilityServiceImpl implements EligibilityService {

    private final JobPostingRepository jobPostingRepository;
    private final StudentProfileRepository studentProfileRepository;

    public EligibilityServiceImpl(JobPostingRepository jobPostingRepository,
                                   StudentProfileRepository studentProfileRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    // ── public API ──────────────────────────────────────────────────────────

    @Override
    public EligibilityResultDto checkEligibility(Long jobId, Long studentId) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        StudentProfile profile = studentProfileRepository.findByStudentId(studentId)
                .orElseThrow(() -> new StudentNotFoundException(
                        "No student profile found for student id: " + studentId));

        return checkEligibility(job, profile);
    }

    @Override
    public EligibilityResultDto checkEligibility(JobPosting job, StudentProfile profile) {
        List<String> reasons = new ArrayList<>();

        // 1. CGPA check
        if (job.getMinimumCgpa() != null) {
            double studentCgpa = profile.getCgpa() != null ? profile.getCgpa() : 0.0;
            if (studentCgpa < job.getMinimumCgpa()) {
                reasons.add(String.format(
                        "CGPA below requirement: your CGPA %.2f is below the required %.2f",
                        studentCgpa, job.getMinimumCgpa()));
            }
        }

        // 2. Branch / Department check
        if (job.getEligibleBranches() != null && !job.getEligibleBranches().isBlank()) {
            List<String> allowedBranches = splitAndTrim(job.getEligibleBranches());
            String studentDept = profile.getDepartment() != null
                    ? profile.getDepartment().trim() : "";

            boolean branchMatch = allowedBranches.stream()
                    .anyMatch(b -> b.equalsIgnoreCase(studentDept));

            if (!branchMatch) {
                reasons.add(String.format(
                        "Department not eligible: your department '%s' is not in [%s]",
                        studentDept.isEmpty() ? "not set" : studentDept,
                        String.join(", ", allowedBranches)));
            }
        }

        // 3. Graduation year check
        if (job.getGraduationYear() != null) {
            String studentBatch = profile.getBatch() != null ? profile.getBatch() : "";
            String requiredYear = String.valueOf(job.getGraduationYear());
            if (!studentBatch.contains(requiredYear)) {
                reasons.add(String.format(
                        "Graduation year mismatch: required %d but your batch is '%s'",
                        job.getGraduationYear(),
                        studentBatch.isEmpty() ? "not set" : studentBatch));
            }
        }

        boolean eligible = reasons.isEmpty();
        return new EligibilityResultDto(job.getId(), profile.getStudent().getId(), eligible, reasons);
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    private List<String> splitAndTrim(String csv) {
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
