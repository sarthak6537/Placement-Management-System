package com.cg.placementmanagement.service;

import com.cg.placementmanagement.entity.Certificate;

import java.util.List;
import java.util.Optional;

public interface CertificateService {
    List<Certificate> findAll();
    List<Certificate> findByStudentId(Long studentId);
    Optional<Certificate> findById(Long id);
    Certificate save(Certificate certificate);
    Certificate update(Long id, Certificate certificate);
    void deleteById(Long id);
}
