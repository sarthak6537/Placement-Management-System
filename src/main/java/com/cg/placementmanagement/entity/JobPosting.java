package com.cg.placementmanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
public class JobPosting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @Column(length = 4000)
    private String description;

    private String eligibleBatch;
    private String eligibleBranches;
    private String location;
    private String employmentType;
    private LocalDate applicationDeadline;

    // ── Eligibility Engine fields ──────────────────────────────────────────
    // Minimum CGPA required to apply (null = no requirement)
    private Double minimumCgpa;

    // Comma-separated required skill names e.g. "Java,Spring Boot,SQL,React"
    @Column(length = 1000)
    private String requiredSkills;

    // Required graduation year e.g. 2026 (null = no requirement)
    private Integer graduationYear;
    // ──────────────────────────────────────────────────────────────────────

    @Column(nullable = false)
    private String status = "OPEN";

    @ManyToOne(optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @OneToMany(mappedBy = "jobPosting", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<JobApplication> applications = new HashSet<>();

    @OneToMany(mappedBy = "jobPosting", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<InterviewSchedule> interviewSchedules = new HashSet<>();

    public JobPosting() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEligibleBatch() { return eligibleBatch; }
    public void setEligibleBatch(String eligibleBatch) { this.eligibleBatch = eligibleBatch; }

    public String getEligibleBranches() { return eligibleBranches; }
    public void setEligibleBranches(String eligibleBranches) { this.eligibleBranches = eligibleBranches; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public LocalDate getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDate applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getMinimumCgpa() { return minimumCgpa; }
    public void setMinimumCgpa(Double minimumCgpa) { this.minimumCgpa = minimumCgpa; }

    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }

    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    public Set<JobApplication> getApplications() { return applications; }
    public void setApplications(Set<JobApplication> applications) { this.applications = applications; }

    public Set<InterviewSchedule> getInterviewSchedules() { return interviewSchedules; }
    public void setInterviewSchedules(Set<InterviewSchedule> interviewSchedules) { this.interviewSchedules = interviewSchedules; }
}
