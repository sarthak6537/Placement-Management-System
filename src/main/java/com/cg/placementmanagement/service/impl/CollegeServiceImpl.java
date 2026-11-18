package com.cg.placementmanagement.service.impl;

import com.cg.placementmanagement.entity.College;
import com.cg.placementmanagement.exception.CollegeNotFoundException;
import com.cg.placementmanagement.repository.CollegeRepository;
import com.cg.placementmanagement.service.CollegeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CollegeServiceImpl implements CollegeService {

    private final CollegeRepository collegeRepository;

    public CollegeServiceImpl(CollegeRepository collegeRepository) {
        this.collegeRepository = collegeRepository;
    }

    @Override
    public List<College> findAll() {
        return collegeRepository.findAll();
    }

    @Override
    public Optional<College> findById(Long id) {
        return collegeRepository.findById(id);
    }

    @Override
    public College save(College college) {
        return collegeRepository.save(college);
    }

    @Override
    public College update(Long id, College college) {
        College existing = collegeRepository.findById(id)
                .orElseThrow(() -> new CollegeNotFoundException("College not found with id: " + id));
        existing.setName(college.getName());
        existing.setAddress(college.getAddress());
        return collegeRepository.save(existing);
    }

    @Override
    public void deleteById(Long id) {
        collegeRepository.deleteById(id);
    }
}
