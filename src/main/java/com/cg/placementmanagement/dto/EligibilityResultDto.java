package com.cg.placementmanagement.dto;

import java.util.List;

/**
 * Result of checking a student's eligibility for a job.
 * Returned by GET /job-postings/{jobId}/eligibility/{studentId}
 */
public class EligibilityResultDto {

    private Long jobId;
    private Long studentId;
    private boolean eligible;

    // Each string explains one reason the student is NOT eligible.
    // Empty list means the student is eligible.
    private List<String> reasons;

    public EligibilityResultDto() {}

    public EligibilityResultDto(Long jobId, Long studentId, boolean eligible, List<String> reasons) {
        this.jobId = jobId;
        this.studentId = studentId;
        this.eligible = eligible;
        this.reasons = reasons;
    }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }

    public List<String> getReasons() { return reasons; }
    public void setReasons(List<String> reasons) { this.reasons = reasons; }
}
