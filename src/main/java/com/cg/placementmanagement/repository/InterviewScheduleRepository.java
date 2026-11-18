package com.cg.placementmanagement.repository;

import com.cg.placementmanagement.entity.InterviewSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewScheduleRepository extends JpaRepository<InterviewSchedule, Long> {
}
