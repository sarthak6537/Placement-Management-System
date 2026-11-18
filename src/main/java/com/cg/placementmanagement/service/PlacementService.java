package com.cg.placementmanagement.service;

import com.cg.placementmanagement.entity.Placement;

import java.util.List;
import java.util.Optional;

public interface PlacementService {
    List<Placement> findAll();
    Optional<Placement> findById(Long id);
    Placement save(Placement placement);
    Placement update(Long id, Placement placement);
    void deleteById(Long id);
}
