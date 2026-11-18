package com.cg.placementmanagement.service;

import com.cg.placementmanagement.dto.RecommendedJobDto;

import java.util.List;

/**
 * Combines eligibility check + skill gap into a single match result.
 * Also produces a personalised recommended jobs list for a student.
 */
public interface JobMatchingService {

    /**
     * Full match result for one job + one student.
     */
    RecommendedJobDto getMatchResult(Long jobId, Long studentId);

    /**
     * Returns all OPEN jobs sorted by match score (descending) for the student.
     */
    List<RecommendedJobDto> getRecommendedJobs(Long studentId);
}
