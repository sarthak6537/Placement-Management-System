package com.cg.placementmanagement.service;

import com.cg.placementmanagement.entity.StudentProfile;

import java.util.List;
import java.util.Optional;

public interface StudentProfileService {
    List<StudentProfile> findAll();
    Optional<StudentProfile> findById(Long id);
    Optional<StudentProfile> findByStudentId(Long studentId);
    StudentProfile save(StudentProfile studentProfile);
    StudentProfile update(Long id, StudentProfile studentProfile);
    void deleteById(Long id);
}
