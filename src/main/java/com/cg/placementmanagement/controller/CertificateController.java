package com.cg.placementmanagement.controller;

import com.cg.placementmanagement.entity.Certificate;
import com.cg.placementmanagement.entity.StudentUser;
import com.cg.placementmanagement.entity.User;
import com.cg.placementmanagement.repository.UserRepository;
import com.cg.placementmanagement.service.CertificateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/certificates")
public class CertificateController {

    private final CertificateService certificateService;
    private final UserRepository userRepository;

    public CertificateController(CertificateService certificateService, UserRepository userRepository) {
        this.certificateService = certificateService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("@securityService.isCertificateCreator(authentication, #certificate)")
    public ResponseEntity<Certificate> createCertificate(@Valid @RequestBody Certificate certificate) {
        Certificate created = certificateService.save(certificate);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PLACEMENT_OFFICER')")
    public ResponseEntity<List<Certificate>> getAllCertificates() {
        return ResponseEntity.ok(certificateService.findAll());
    }

    /**
     * GET /certificates/my
     * Returns certificates belonging to the currently authenticated student.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Certificate>> getMyCertificates(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (!(user instanceof StudentUser studentUser) || studentUser.getStudent() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(certificateService.findByStudentId(studentUser.getStudent().getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityService.isCertificateOwner(authentication, #id)")
    public ResponseEntity<Certificate> getCertificateById(@PathVariable Long id) {
        return certificateService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityService.isCertificateOwner(authentication, #id)")
    public ResponseEntity<Certificate> updateCertificate(@PathVariable Long id, @Valid @RequestBody Certificate certificate) {
        try {
            Certificate updated = certificateService.update(id, certificate);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityService.isCertificateOwner(authentication, #id)")
    public ResponseEntity<Void> deleteCertificate(@PathVariable Long id) {
        certificateService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
