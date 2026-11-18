package com.cg.placementmanagement.service.impl;

import com.cg.placementmanagement.entity.StudentProfile;
import com.cg.placementmanagement.repository.SkillRepository;
import com.cg.placementmanagement.repository.StudentProfileRepository;
import com.cg.placementmanagement.repository.StudentRepository;
import com.cg.placementmanagement.service.StudentProfileService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StudentProfileServiceImpl implements StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final StudentRepository studentRepository;
    private final SkillRepository skillRepository;

    public StudentProfileServiceImpl(StudentProfileRepository studentProfileRepository, 
                                     StudentRepository studentRepository, 
                                     SkillRepository skillRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.studentRepository = studentRepository;
        this.skillRepository = skillRepository;
    }

    @Override
    public List<StudentProfile> findAll() {
        return studentProfileRepository.findAll();
    }

    @Override
    public Optional<StudentProfile> findById(Long id) {
        return studentProfileRepository.findById(id);
    }

    @Override
    public Optional<StudentProfile> findByStudentId(Long studentId) {
        return studentProfileRepository.findByStudentId(studentId);
    }

    @Override
    public StudentProfile save(StudentProfile studentProfile) {
        if (studentProfile.getStudent() != null && studentProfile.getStudent().getId() != null) {
            studentRepository.findById(studentProfile.getStudent().getId()).ifPresent(studentProfile::setStudent);
        }
        
        if (studentProfile.getSkills() != null) {
            java.util.Set<com.cg.placementmanagement.entity.Skill> managed = new java.util.HashSet<>();
            for (com.cg.placementmanagement.entity.Skill s : studentProfile.getSkills()) {
                if (s.getId() != null) {
                    skillRepository.findById(s.getId()).ifPresent(managed::add);
                }
            }
            studentProfile.setSkills(managed);
        }
        
        return studentProfileRepository.save(studentProfile);
    }

    @Override
    public StudentProfile update(Long id, StudentProfile studentProfile) {
        StudentProfile existing = studentProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student Profile not found with id: " + id));
        
        existing.setPhone(studentProfile.getPhone());
        existing.setDepartment(studentProfile.getDepartment());
        existing.setBatch(studentProfile.getBatch());
        existing.setCgpa(studentProfile.getCgpa());
        existing.setResumeUrl(studentProfile.getResumeUrl());
        existing.setBio(studentProfile.getBio());
        
        if (studentProfile.getStudent() != null && studentProfile.getStudent().getId() != null) {
            studentRepository.findById(studentProfile.getStudent().getId()).ifPresent(existing::setStudent);
        }
        
        if (studentProfile.getSkills() != null) {
            java.util.Set<com.cg.placementmanagement.entity.Skill> managed = new java.util.HashSet<>();
            for (com.cg.placementmanagement.entity.Skill s : studentProfile.getSkills()) {
                if (s.getId() != null) {
                    skillRepository.findById(s.getId()).ifPresent(managed::add);
                }
            }
            existing.setSkills(managed);
        }
        
        return studentProfileRepository.save(existing);
    }

    @Override
    public void deleteById(Long id) {
        studentProfileRepository.deleteById(id);
    }
}
