package com.cg.placementmanagement.service.impl;

import com.cg.placementmanagement.entity.Certificate;
import com.cg.placementmanagement.exception.CustomException;
import com.cg.placementmanagement.repository.CertificateRepository;
import com.cg.placementmanagement.repository.StudentRepository;
import com.cg.placementmanagement.service.CertificateService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository certificateRepository;
    private final StudentRepository studentRepository;

    public CertificateServiceImpl(CertificateRepository certificateRepository, StudentRepository studentRepository) {
        this.certificateRepository = certificateRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public List<Certificate> findAll() {
        return certificateRepository.findAll();
    }

    @Override
    public List<Certificate> findByStudentId(Long studentId) {
        return certificateRepository.findByStudentId(studentId);
    }

    @Override
    public Optional<Certificate> findById(Long id) {
        return certificateRepository.findById(id);
    }

    @Override
    public Certificate save(Certificate certificate) {
        if (certificate.getStudent() != null && certificate.getStudent().getId() != null) {
            studentRepository.findById(certificate.getStudent().getId()).ifPresent(certificate::setStudent);
        }
        return certificateRepository.save(certificate);
    }

    @Override
    public Certificate update(Long id, Certificate certificate) {
        Certificate existing = certificateRepository.findById(id)
                .orElseThrow(() -> new CustomException("Certificate not found with id: " + id));
        existing.setName(certificate.getName());
        existing.setIssuedDate(certificate.getIssuedDate());
        if (certificate.getStudent() != null && certificate.getStudent().getId() != null) {
            studentRepository.findById(certificate.getStudent().getId()).ifPresent(existing::setStudent);
        }
        return certificateRepository.save(existing);
    }

    @Override
    public void deleteById(Long id) {
        certificateRepository.deleteById(id);
    }
}
