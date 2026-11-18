package com.cg.placementmanagement.service;

import com.cg.placementmanagement.dto.EligibilityResultDto;
import com.cg.placementmanagement.entity.JobPosting;
import com.cg.placementmanagement.entity.StudentProfile;

/**
 * Checks whether a student meets the eligibility requirements of a job.
 * Rules checked (only when the job has a requirement set):
 *  1. Minimum CGPA
 *  2. Eligible branches / department
 *  3. Graduation year
 */
public interface EligibilityService {

    /**
     * Full eligibility check by IDs.  Loads the student and job internally.
     */
    EligibilityResultDto checkEligibility(Long jobId, Long studentId);

    /**
     * Eligibility check on already-loaded objects (used internally by JobMatchingService).
     */
    EligibilityResultDto checkEligibility(JobPosting job, StudentProfile profile);
}
