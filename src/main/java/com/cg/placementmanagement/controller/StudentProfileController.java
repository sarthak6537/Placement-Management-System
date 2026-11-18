package com.cg.placementmanagement.controller;

import com.cg.placementmanagement.entity.StudentProfile;
import com.cg.placementmanagement.service.StudentProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/student-profiles")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    public StudentProfileController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
    }

    @PostMapping
    @PreAuthorize("@securityService.isStudentProfileCreator(authentication, #studentProfile)")
    public ResponseEntity<StudentProfile> createStudentProfile(@Valid @RequestBody StudentProfile studentProfile) {
        return new ResponseEntity<>(studentProfileService.save(studentProfile), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PLACEMENT_OFFICER')")
    public ResponseEntity<List<StudentProfile>> getAllStudentProfiles() {
        return ResponseEntity.ok(studentProfileService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityService.isStudentProfileOwner(authentication, #id)")
    public ResponseEntity<StudentProfile> getStudentProfileById(@PathVariable Long id) {
        return studentProfileService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-student/{studentId}")
    @PreAuthorize("@securityService.isStudentOwner(authentication, #studentId)")
    public ResponseEntity<StudentProfile> getStudentProfileByStudentId(@PathVariable Long studentId) {
        return studentProfileService.findByStudentId(studentId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityService.isStudentProfileOwner(authentication, #id)")
    public ResponseEntity<StudentProfile> updateStudentProfile(@PathVariable Long id, @Valid @RequestBody StudentProfile studentProfile) {
        try {
            return ResponseEntity.ok(studentProfileService.update(id, studentProfile));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityService.isStudentProfileOwner(authentication, #id)")
    public ResponseEntity<Void> deleteStudentProfile(@PathVariable Long id) {
        studentProfileService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
