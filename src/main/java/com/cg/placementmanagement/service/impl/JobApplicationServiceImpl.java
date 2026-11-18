package com.cg.placementmanagement.service.impl;

import com.cg.placementmanagement.entity.JobApplication;
import com.cg.placementmanagement.repository.JobApplicationRepository;
import com.cg.placementmanagement.repository.JobPostingRepository;
import com.cg.placementmanagement.repository.StudentRepository;
import com.cg.placementmanagement.service.JobApplicationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final StudentRepository studentRepository;
    private final JobPostingRepository jobPostingRepository;

    public JobApplicationServiceImpl(JobApplicationRepository jobApplicationRepository, 
                                     StudentRepository studentRepository, 
                                     JobPostingRepository jobPostingRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.studentRepository = studentRepository;
        this.jobPostingRepository = jobPostingRepository;
    }

    @Override
    public List<JobApplication> findAll() {
        return jobApplicationRepository.findAll();
    }

    @Override
    public Optional<JobApplication> findById(Long id) {
        return jobApplicationRepository.findById(id);
    }

    @Override
    public JobApplication save(JobApplication jobApplication) {
        if (jobApplication.getStudent() != null && jobApplication.getStudent().getId() != null) {
            studentRepository.findById(jobApplication.getStudent().getId()).ifPresent(jobApplication::setStudent);
        }
        if (jobApplication.getJobPosting() != null && jobApplication.getJobPosting().getId() != null) {
            jobPostingRepository.findById(jobApplication.getJobPosting().getId()).ifPresent(jobApplication::setJobPosting);
        }
        return jobApplicationRepository.save(jobApplication);
    }

    @Override
    public JobApplication update(Long id, JobApplication jobApplication) {
        JobApplication existing = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job Application not found with id: " + id));
        
        existing.setStatus(jobApplication.getStatus());
        existing.setNotes(jobApplication.getNotes());
        
        if (jobApplication.getStudent() != null && jobApplication.getStudent().getId() != null) {
            studentRepository.findById(jobApplication.getStudent().getId()).ifPresent(existing::setStudent);
        }
        if (jobApplication.getJobPosting() != null && jobApplication.getJobPosting().getId() != null) {
            jobPostingRepository.findById(jobApplication.getJobPosting().getId()).ifPresent(existing::setJobPosting);
        }
        
        return jobApplicationRepository.save(existing);
    }

    @Override
    public void deleteById(Long id) {
        jobApplicationRepository.deleteById(id);
    }
}
