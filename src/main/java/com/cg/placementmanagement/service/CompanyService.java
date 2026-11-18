package com.cg.placementmanagement.service;

import com.cg.placementmanagement.entity.Company;

import java.util.List;
import java.util.Optional;

public interface CompanyService {
    List<Company> findAll();
    Optional<Company> findById(Long id);
    Company save(Company company);
    Company update(Long id, Company company);
    void deleteById(Long id);
}
