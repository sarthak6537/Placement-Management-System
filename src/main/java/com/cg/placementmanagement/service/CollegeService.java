package com.cg.placementmanagement.service;

import com.cg.placementmanagement.entity.College;

import java.util.List;
import java.util.Optional;

public interface CollegeService {
    List<College> findAll();
    Optional<College> findById(Long id);
    College save(College college);
    College update(Long id, College college);
    void deleteById(Long id);
}
