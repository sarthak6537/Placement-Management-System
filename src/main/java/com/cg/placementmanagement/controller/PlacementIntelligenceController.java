package com.cg.placementmanagement.controller;

import com.cg.placementmanagement.dto.EligibilityResultDto;
import com.cg.placementmanagement.dto.RecommendedJobDto;
import com.cg.placementmanagement.dto.SkillGapDto;
import com.cg.placementmanagement.service.EligibilityService;
import com.cg.placementmanagement.service.JobMatchingService;
import com.cg.placementmanagement.service.SkillGapService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for the Placement Intelligence features:
 *  - Job Eligibility Engine
 *  - Job Matching Score
 *  - Skill Gap Analysis
 *  - Personalized Job Recommendations
 *
 * All endpoints require the caller to be authenticated.
 * Student-specific endpoints are further guarded by ownership check.
 */
@RestController
@RequestMapping("/job-postings")
public class PlacementIntelligenceController {

    private final EligibilityService eligibilityService;
    private final SkillGapService skillGapService;
    private final JobMatchingService jobMatchingService;

    public PlacementIntelligenceController(EligibilityService eligibilityService,
                                            SkillGapService skillGapService,
                                            JobMatchingService jobMatchingService) {
        this.eligibilityService = eligibilityService;
        this.skillGapService    = skillGapService;
        this.jobMatchingService = jobMatchingService;
    }

    /**
     * GET /job-postings/{jobId}/eligibility/{studentId}
     * Returns whether the student is eligible for the job and why not if not.
     */
    @GetMapping("/{jobId}/eligibility/{studentId}")
    @PreAuthorize("@securityService.isStudentOwner(authentication, #studentId)")
    public ResponseEntity<EligibilityResultDto> checkEligibility(
            @PathVariable Long jobId,
            @PathVariable Long studentId) {
        return ResponseEntity.ok(eligibilityService.checkEligibility(jobId, studentId));
    }

    /**
     * GET /job-postings/{jobId}/skill-gap/{studentId}
     * Returns the skill gap analysis: matched skills, missing skills, recommendations.
     */
    @GetMapping("/{jobId}/skill-gap/{studentId}")
    @PreAuthorize("@securityService.isStudentOwner(authentication, #studentId)")
    public ResponseEntity<SkillGapDto> getSkillGap(
            @PathVariable Long jobId,
            @PathVariable Long studentId) {
        return ResponseEntity.ok(skillGapService.analyzeSkillGap(jobId, studentId));
    }

    /**
     * GET /job-postings/{jobId}/match/{studentId}
     * Returns the full match result: eligibility + match score + skill gap combined.
     */
    @GetMapping("/{jobId}/match/{studentId}")
    @PreAuthorize("@securityService.isStudentOwner(authentication, #studentId)")
    public ResponseEntity<RecommendedJobDto> getMatchResult(
            @PathVariable Long jobId,
            @PathVariable Long studentId) {
        return ResponseEntity.ok(jobMatchingService.getMatchResult(jobId, studentId));
    }

    /**
     * GET /job-postings/recommended/{studentId}
     * Returns all OPEN jobs sorted by match score (highest first) for the student.
     */
    @GetMapping("/recommended/{studentId}")
    @PreAuthorize("@securityService.isStudentOwner(authentication, #studentId)")
    public ResponseEntity<List<RecommendedJobDto>> getRecommendedJobs(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(jobMatchingService.getRecommendedJobs(studentId));
    }
}
