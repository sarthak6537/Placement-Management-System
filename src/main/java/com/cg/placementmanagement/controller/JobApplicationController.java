package com.cg.placementmanagement.controller;

import com.cg.placementmanagement.entity.JobApplication;
import com.cg.placementmanagement.service.JobApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import com.cg.placementmanagement.security.SecurityService;
import java.util.stream.Collectors;

import java.util.List;

@RestController
@RequestMapping("/job-applications")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;
    private final SecurityService securityService;

    public JobApplicationController(JobApplicationService jobApplicationService, SecurityService securityService) {
        this.jobApplicationService = jobApplicationService;
        this.securityService = securityService;
    }

    @PostMapping
    public ResponseEntity<JobApplication> createJobApplication(@Valid @RequestBody JobApplication jobApplication, Authentication authentication) {
        if (!securityService.isJobApplicationCreator(authentication, jobApplication)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(jobApplicationService.save(jobApplication), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PLACEMENT_OFFICER')")
    public ResponseEntity<List<JobApplication>> getAllJobApplications() {
        return ResponseEntity.ok(jobApplicationService.findAll());
    }

    @GetMapping("/by-student/{studentId}")
    public ResponseEntity<List<JobApplication>> getJobApplicationsByStudent(@PathVariable Long studentId, Authentication authentication) {
        if (!securityService.isStudentOwner(authentication, studentId)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<JobApplication> myApps = jobApplicationService.findAll().stream()
                .filter(a -> a.getStudent() != null && a.getStudent().getId().equals(studentId))
                .collect(Collectors.toList());
        return ResponseEntity.ok(myApps);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityService.isJobApplicationOwner(authentication, #id)")
    public ResponseEntity<JobApplication> getJobApplicationById(@PathVariable Long id) {
        return jobApplicationService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityService.isJobApplicationOwner(authentication, #id)")
    public ResponseEntity<JobApplication> updateJobApplication(@PathVariable Long id, @Valid @RequestBody JobApplication jobApplication) {
        try {
            return ResponseEntity.ok(jobApplicationService.update(id, jobApplication));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityService.isJobApplicationOwner(authentication, #id)")
    public ResponseEntity<Void> deleteJobApplication(@PathVariable Long id) {
        jobApplicationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
