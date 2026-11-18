package com.cg.placementmanagement.service;

import com.cg.placementmanagement.entity.JobApplication;

import java.util.List;
import java.util.Optional;

public interface JobApplicationService {
    List<JobApplication> findAll();
    Optional<JobApplication> findById(Long id);
    JobApplication save(JobApplication jobApplication);
    JobApplication update(Long id, JobApplication jobApplication);
    void deleteById(Long id);
}
