package com.cg.placementmanagement.service;

import com.cg.placementmanagement.entity.JobPosting;

import java.util.List;
import java.util.Optional;

public interface JobPostingService {
    List<JobPosting> findAll();
    Optional<JobPosting> findById(Long id);
    JobPosting save(JobPosting jobPosting);
    JobPosting update(Long id, JobPosting jobPosting);
    void deleteById(Long id);
}
