package com.cg.placementmanagement.service.impl;

import com.cg.placementmanagement.entity.Student;
import com.cg.placementmanagement.exception.StudentNotFoundException;
import com.cg.placementmanagement.repository.StudentRepository;
import com.cg.placementmanagement.service.StudentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cg.placementmanagement.entity.StudentProfile;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    public StudentServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    @Override
    public Optional<Student> findById(Long id) {
        return studentRepository.findById(id);
    }

//    @Override
//    public Student save(Student student) {
//        return studentRepository.save(student);
//    }
@Override
public Student save(Student student) {

    Student savedStudent = studentRepository.save(student);

    StudentProfile profile = new StudentProfile();

    profile.setStudent(savedStudent);
    profile.setDepartment("");
    profile.setBatch("");
    profile.setPhone("");

    savedStudent.setStudentProfile(profile);

    return studentRepository.save(savedStudent);
}

    @Override
    public Student update(Long id, Student student) {
        Student existing = studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with id: " + id));
        existing.setFirstName(student.getFirstName());
        existing.setLastName(student.getLastName());
        existing.setEmail(student.getEmail());
        // Note: relationships can be updated as needed
        return studentRepository.save(existing);
    }

    @Override
    public void deleteById(Long id) {
        studentRepository.deleteById(id);
    }
}
