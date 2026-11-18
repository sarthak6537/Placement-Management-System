package com.cg.placementmanagement.service.impl;

import com.cg.placementmanagement.entity.Placement;
import com.cg.placementmanagement.exception.PlacementNotFoundException;
import com.cg.placementmanagement.repository.PlacementRepository;
import com.cg.placementmanagement.repository.StudentRepository;
import com.cg.placementmanagement.service.PlacementService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PlacementServiceImpl implements PlacementService {

    private final PlacementRepository placementRepository;
    private final StudentRepository studentRepository;

    public PlacementServiceImpl(PlacementRepository placementRepository, StudentRepository studentRepository) {
        this.placementRepository = placementRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public List<Placement> findAll() {
        return placementRepository.findAll();
    }

    @Override
    public Optional<Placement> findById(Long id) {
        return placementRepository.findById(id);
    }

    @Override
    public Placement save(Placement placement) {
        // If placements include student references (by id), ensure they are managed entities
        if (placement.getStudents() != null && !placement.getStudents().isEmpty()) {
            java.util.Set<com.cg.placementmanagement.entity.Student> managed = new java.util.HashSet<>();
            for (com.cg.placementmanagement.entity.Student s : placement.getStudents()) {
                if (s.getId() != null) {
                    studentRepository.findById(s.getId()).ifPresent(managed::add);
                }
            }
            placement.setStudents(managed);
        }
        return placementRepository.save(placement);
    }

    @Override
    public Placement update(Long id, Placement placement) {
        Placement existing = placementRepository.findById(id)
                .orElseThrow(() -> new PlacementNotFoundException("Placement not found with id: " + id));
        existing.setCompanyName(placement.getCompanyName());
        existing.setDate(placement.getDate());
        if (placement.getStudents() != null) {
            java.util.Set<com.cg.placementmanagement.entity.Student> managed = new java.util.HashSet<>();
            for (com.cg.placementmanagement.entity.Student s : placement.getStudents()) {
                if (s.getId() != null) {
                    studentRepository.findById(s.getId()).ifPresent(managed::add);
                }
            }
            existing.setStudents(managed);
        }
        return placementRepository.save(existing);
    }

    @Override
    public void deleteById(Long id) {
        placementRepository.deleteById(id);
    }
}
