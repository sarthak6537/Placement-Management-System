package com.cg.placementmanagement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class InterviewSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;

    private LocalDateTime scheduledAt;
    private String roundName;
    private String mode;
    private String venue;
    private String coordinator;

    @Column(nullable = false)
    private String status = "SCHEDULED";

    public InterviewSchedule() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public JobPosting getJobPosting() { return jobPosting; }
    public void setJobPosting(JobPosting jobPosting) { this.jobPosting = jobPosting; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public String getRoundName() { return roundName; }
    public void setRoundName(String roundName) { this.roundName = roundName; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getCoordinator() { return coordinator; }
    public void setCoordinator(String coordinator) { this.coordinator = coordinator; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
