package com.cg.placementmanagement.security;

import com.cg.placementmanagement.entity.*;
import com.cg.placementmanagement.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service("securityService")
public class SecurityService {

    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final CertificateRepository certificateRepository;
    private final SkillRepository skillRepository;

    public SecurityService(UserRepository userRepository,
                           JobApplicationRepository jobApplicationRepository,
                           CertificateRepository certificateRepository,
                           SkillRepository skillRepository) {
        this.userRepository = userRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.certificateRepository = certificateRepository;
        this.skillRepository = skillRepository;
    }

    private boolean isSuperUser(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_PLACEMENT_OFFICER"));
    }

//    private Student getAuthenticatedStudent(Authentication authentication) {
//        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
//        if (user instanceof StudentUser studentUser) {
//            return studentUser.getStudent();
//        }
//        return null;
//    }
public Student getAuthenticatedStudent(Authentication authentication) {
    User user = userRepository.findByUsername(authentication.getName()).orElse(null);

    if (user instanceof StudentUser studentUser) {
        return studentUser.getStudent();
    }

    return null;
}

    public boolean isStudentOwner(Authentication authentication, Long studentId) {
        if (authentication == null || authentication.getName() == null) return false;
        if (isSuperUser(authentication)) return true;

        Student student = getAuthenticatedStudent(authentication);
        return student != null && student.getId().equals(studentId);
    }

    public boolean isJobApplicationOwner(Authentication authentication, Long applicationId) {
        if (authentication == null || authentication.getName() == null) return false;
        if (isSuperUser(authentication)) return true;

        Student student = getAuthenticatedStudent(authentication);
        if (student == null) return false;

        Optional<JobApplication> app = jobApplicationRepository.findById(applicationId);
        return app.isPresent() && app.get().getStudent().getId().equals(student.getId());
    }

    public boolean isJobApplicationCreator(Authentication authentication, JobApplication application) {
        if (authentication == null || authentication.getName() == null) return false;
        if (isSuperUser(authentication)) return true;

        Student student = getAuthenticatedStudent(authentication);
        if (student == null || application == null || application.getStudent() == null) return false;

        return application.getStudent().getId().equals(student.getId());
    }

    public boolean isCertificateOwner(Authentication authentication, Long certificateId) {
        if (authentication == null || authentication.getName() == null) return false;
        if (isSuperUser(authentication)) return true;

        Student student = getAuthenticatedStudent(authentication);
        if (student == null) return false;

        Optional<Certificate> cert = certificateRepository.findById(certificateId);
        return cert.isPresent() && cert.get().getStudent().getId().equals(student.getId());
    }

    public boolean isCertificateCreator(Authentication authentication, Certificate certificate) {
        if (authentication == null || authentication.getName() == null) return false;
        if (isSuperUser(authentication)) return true;

        Student student = getAuthenticatedStudent(authentication);
        if (student == null || certificate == null || certificate.getStudent() == null) return false;

        return certificate.getStudent().getId().equals(student.getId());
    }

    public boolean isStudentProfileOwner(Authentication authentication, Long profileId) {
        if (authentication == null || authentication.getName() == null) return false;
        if (isSuperUser(authentication)) return true;

        Student student = getAuthenticatedStudent(authentication);
        return student != null && student.getStudentProfile() != null && student.getStudentProfile().getId().equals(profileId);
    }

    public boolean isStudentProfileCreator(Authentication authentication, StudentProfile profile) {
        if (authentication == null || authentication.getName() == null) return false;
        if (isSuperUser(authentication)) return true;

        Student student = getAuthenticatedStudent(authentication);
        if (student == null || profile == null || profile.getStudent() == null) return false;

        return profile.getStudent().getId().equals(student.getId());
    }
}
