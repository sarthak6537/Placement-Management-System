package com.cg.placementmanagement.service;

import com.cg.placementmanagement.entity.Skill;

import java.util.List;
import java.util.Optional;

public interface SkillService {
    List<Skill> findAll();
    Optional<Skill> findById(Long id);
    Skill save(Skill skill);
    Skill update(Long id, Skill skill);
    void deleteById(Long id);
}
