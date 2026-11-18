package com.cg.placementmanagement.service;

import com.cg.placementmanagement.entity.Student;

import java.util.List;
import java.util.Optional;

public interface StudentService {
    List<Student> findAll();
    Optional<Student> findById(Long id);
    Student save(Student student);
    Student update(Long id, Student student);
    void deleteById(Long id);
}
