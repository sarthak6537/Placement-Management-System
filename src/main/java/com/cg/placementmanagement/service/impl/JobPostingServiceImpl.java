package com.cg.placementmanagement.service.impl;

import com.cg.placementmanagement.entity.JobPosting;
import com.cg.placementmanagement.repository.CompanyRepository;
import com.cg.placementmanagement.repository.JobPostingRepository;
import com.cg.placementmanagement.service.JobPostingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class JobPostingServiceImpl implements JobPostingService {

    private final JobPostingRepository jobPostingRepository;
    private final CompanyRepository companyRepository;

    public JobPostingServiceImpl(JobPostingRepository jobPostingRepository, CompanyRepository companyRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.companyRepository = companyRepository;
    }

    @Override
    public List<JobPosting> findAll() {
        return jobPostingRepository.findAll();
    }

    @Override
    public Optional<JobPosting> findById(Long id) {
        return jobPostingRepository.findById(id);
    }

    @Override
    public JobPosting save(JobPosting jobPosting) {
        if (jobPosting.getCompany() != null && jobPosting.getCompany().getId() != null) {
            companyRepository.findById(jobPosting.getCompany().getId())
                             .ifPresent(jobPosting::setCompany);
        }
        return jobPostingRepository.save(jobPosting);
    }

    @Override
    public JobPosting update(Long id, JobPosting jobPosting) {
        JobPosting existing = jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job Posting not found with id: " + id));
        
        existing.setTitle(jobPosting.getTitle());
        existing.setDescription(jobPosting.getDescription());
        existing.setEligibleBatch(jobPosting.getEligibleBatch());
        existing.setEligibleBranches(jobPosting.getEligibleBranches());
        existing.setLocation(jobPosting.getLocation());
        existing.setEmploymentType(jobPosting.getEmploymentType());
        existing.setApplicationDeadline(jobPosting.getApplicationDeadline());
        existing.setStatus(jobPosting.getStatus());
        existing.setMinimumCgpa(jobPosting.getMinimumCgpa());
        existing.setRequiredSkills(jobPosting.getRequiredSkills());
        existing.setGraduationYear(jobPosting.getGraduationYear());
        
        if (jobPosting.getCompany() != null && jobPosting.getCompany().getId() != null) {
            companyRepository.findById(jobPosting.getCompany().getId())
                             .ifPresent(existing::setCompany);
        }
        
        return jobPostingRepository.save(existing);
    }

    @Override
    public void deleteById(Long id) {
        jobPostingRepository.deleteById(id);
    }
}
