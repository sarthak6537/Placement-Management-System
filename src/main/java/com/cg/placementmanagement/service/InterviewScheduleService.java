package com.cg.placementmanagement.service;

import com.cg.placementmanagement.entity.InterviewSchedule;

import java.util.List;
import java.util.Optional;

public interface InterviewScheduleService {
    List<InterviewSchedule> findAll();
    Optional<InterviewSchedule> findById(Long id);
    InterviewSchedule save(InterviewSchedule interviewSchedule);
    InterviewSchedule update(Long id, InterviewSchedule interviewSchedule);
    void deleteById(Long id);
}
