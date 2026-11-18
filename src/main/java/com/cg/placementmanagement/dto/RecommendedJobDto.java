package com.cg.placementmanagement.dto;

import java.util.List;

/**
 * A recommended job for a student, combining job details with
 * eligibility, match score, and skill gap in one response.
 * Returned by GET /job-postings/recommended/{studentId}
 * and GET /job-postings/{jobId}/match/{studentId}
 */
public class RecommendedJobDto {

    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String location;
    private String employmentType;
    private String status;
    private String applicationDeadline;

    // Eligibility Engine result
    private boolean eligible;
    private List<String> eligibilityReasons; // empty if eligible

    // Job Matching Score (0–100)
    private int matchScore;

    // Skill Gap
    private List<String> requiredSkills;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> recommendations;

    public RecommendedJobDto() {}

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(String applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }

    public List<String> getEligibilityReasons() { return eligibilityReasons; }
    public void setEligibilityReasons(List<String> eligibilityReasons) { this.eligibilityReasons = eligibilityReasons; }

    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }

    public List<String> getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
}
