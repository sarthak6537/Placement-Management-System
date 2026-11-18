package com.cg.placementmanagement.service.impl;

import com.cg.placementmanagement.entity.Skill;
import com.cg.placementmanagement.repository.SkillRepository;
import com.cg.placementmanagement.service.SkillService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;

    public SkillServiceImpl(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @Override
    public List<Skill> findAll() {
        return skillRepository.findAll();
    }

    @Override
    public Optional<Skill> findById(Long id) {
        return skillRepository.findById(id);
    }

    @Override
    public Skill save(Skill skill) {
        return skillRepository.save(skill);
    }

    @Override
    public Skill update(Long id, Skill skill) {
        Skill existing = skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found with id: " + id));
        
        existing.setName(skill.getName());
        existing.setCategory(skill.getCategory());
        
        return skillRepository.save(existing);
    }

    @Override
    public void deleteById(Long id) {
        skillRepository.deleteById(id);
    }
}
