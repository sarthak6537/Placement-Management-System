package com.cg.placementmanagement.dto;

import java.util.List;

/**
 * Skill gap analysis result for a student against a specific job.
 * Returned by GET /job-postings/{jobId}/skill-gap/{studentId}
 */
public class SkillGapDto {

    private Long jobId;
    private Long studentId;

    // Skills required by the job
    private List<String> requiredSkills;

    // Skills the student already has that match required
    private List<String> matchedSkills;

    // Skills required but missing from the student's profile
    private List<String> missingSkills;

    // Simple rule-based learning recommendation per missing skill
    private List<String> recommendations;

    // Match percentage = matchedSkills.size / requiredSkills.size * 100
    private int matchScore;

    public SkillGapDto() {}

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public List<String> getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }
}
