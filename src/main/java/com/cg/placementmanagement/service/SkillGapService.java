package com.cg.placementmanagement.service;

import com.cg.placementmanagement.dto.SkillGapDto;
import com.cg.placementmanagement.entity.JobPosting;
import com.cg.placementmanagement.entity.StudentProfile;

/**
 * Compares a student's skills against the required skills of a job
 * and produces a gap analysis with learning recommendations.
 */
public interface SkillGapService {

    /**
     * Full skill gap analysis by IDs.
     */
    SkillGapDto analyzeSkillGap(Long jobId, Long studentId);

    /**
     * Skill gap analysis on already-loaded objects (used internally).
     */
    SkillGapDto analyzeSkillGap(JobPosting job, StudentProfile profile);
}
