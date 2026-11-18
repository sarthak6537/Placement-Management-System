package com.cg.placementmanagement.service.impl;

import com.cg.placementmanagement.entity.Company;
import com.cg.placementmanagement.repository.CompanyRepository;
import com.cg.placementmanagement.service.CompanyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyServiceImpl(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Override
    public List<Company> findAll() {
        return companyRepository.findAll();
    }

    @Override
    public Optional<Company> findById(Long id) {
        return companyRepository.findById(id);
    }

    @Override
    public Company save(Company company) {
        return companyRepository.save(company);
    }

    @Override
    public Company update(Long id, Company company) {
        Company existing = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
        
        existing.setName(company.getName());
        existing.setIndustry(company.getIndustry());
        existing.setWebsite(company.getWebsite());
        existing.setRecruiterName(company.getRecruiterName());
        existing.setRecruiterEmail(company.getRecruiterEmail());
        existing.setStatus(company.getStatus());
        
        return companyRepository.save(existing);
    }

    @Override
    public void deleteById(Long id) {
        companyRepository.deleteById(id);
    }
}
