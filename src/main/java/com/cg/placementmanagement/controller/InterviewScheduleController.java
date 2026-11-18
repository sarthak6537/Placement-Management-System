package com.cg.placementmanagement.controller;

import com.cg.placementmanagement.entity.InterviewSchedule;
import com.cg.placementmanagement.service.InterviewScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/interview-schedules")
public class InterviewScheduleController {

    private final InterviewScheduleService interviewScheduleService;

    public InterviewScheduleController(InterviewScheduleService interviewScheduleService) {
        this.interviewScheduleService = interviewScheduleService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PLACEMENT_OFFICER')")
    public ResponseEntity<InterviewSchedule> createInterviewSchedule(@Valid @RequestBody InterviewSchedule interviewSchedule) {
        return new ResponseEntity<>(interviewScheduleService.save(interviewSchedule), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<InterviewSchedule>> getAllInterviewSchedules() {
        return ResponseEntity.ok(interviewScheduleService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewSchedule> getInterviewScheduleById(@PathVariable Long id) {
        return interviewScheduleService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLACEMENT_OFFICER')")
    public ResponseEntity<InterviewSchedule> updateInterviewSchedule(@PathVariable Long id, @Valid @RequestBody InterviewSchedule interviewSchedule) {
        try {
            return ResponseEntity.ok(interviewScheduleService.update(id, interviewSchedule));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLACEMENT_OFFICER')")
    public ResponseEntity<Void> deleteInterviewSchedule(@PathVariable Long id) {
        interviewScheduleService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
