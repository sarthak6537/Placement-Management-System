package com.cg.placementmanagement.service.impl;

import com.cg.placementmanagement.entity.InterviewSchedule;
import com.cg.placementmanagement.repository.InterviewScheduleRepository;
import com.cg.placementmanagement.repository.JobPostingRepository;
import com.cg.placementmanagement.service.InterviewScheduleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class InterviewScheduleServiceImpl implements InterviewScheduleService {

    private final InterviewScheduleRepository interviewScheduleRepository;
    private final JobPostingRepository jobPostingRepository;

    public InterviewScheduleServiceImpl(InterviewScheduleRepository interviewScheduleRepository, JobPostingRepository jobPostingRepository) {
        this.interviewScheduleRepository = interviewScheduleRepository;
        this.jobPostingRepository = jobPostingRepository;
    }

    @Override
    public List<InterviewSchedule> findAll() {
        return interviewScheduleRepository.findAll();
    }

    @Override
    public Optional<InterviewSchedule> findById(Long id) {
        return interviewScheduleRepository.findById(id);
    }

    @Override
    public InterviewSchedule save(InterviewSchedule interviewSchedule) {
        if (interviewSchedule.getJobPosting() != null && interviewSchedule.getJobPosting().getId() != null) {
            jobPostingRepository.findById(interviewSchedule.getJobPosting().getId()).ifPresent(interviewSchedule::setJobPosting);
        }
        return interviewScheduleRepository.save(interviewSchedule);
    }

    @Override
    public InterviewSchedule update(Long id, InterviewSchedule interviewSchedule) {
        InterviewSchedule existing = interviewScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview Schedule not found with id: " + id));
        
        existing.setScheduledAt(interviewSchedule.getScheduledAt());
        existing.setRoundName(interviewSchedule.getRoundName());
        existing.setMode(interviewSchedule.getMode());
        existing.setVenue(interviewSchedule.getVenue());
        existing.setCoordinator(interviewSchedule.getCoordinator());
        existing.setStatus(interviewSchedule.getStatus());
        
        if (interviewSchedule.getJobPosting() != null && interviewSchedule.getJobPosting().getId() != null) {
            jobPostingRepository.findById(interviewSchedule.getJobPosting().getId()).ifPresent(existing::setJobPosting);
        }
        
        return interviewScheduleRepository.save(existing);
    }

    @Override
    public void deleteById(Long id) {
        interviewScheduleRepository.deleteById(id);
    }
}
