package com.cg.placementmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Email should be valid")
    private String email;

    @ManyToOne
    @JoinColumn(name = "college_id")
    private College college;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Certificate> certificates = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "student_placement",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "placement_id")
    )
    @JsonIgnore
    private Set<Placement> placements = new HashSet<>();

    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private StudentProfile studentProfile;

    public Student() {}

    public Student(String firstName, String lastName, String email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public College getCollege() { return college; }
    public void setCollege(College college) { this.college = college; }

    public Set<Certificate> getCertificates() { return certificates; }
    public void setCertificates(Set<Certificate> certificates) { this.certificates = certificates; }

    public Set<Placement> getPlacements() { return placements; }
    public void setPlacements(Set<Placement> placements) { this.placements = placements; }

    public void addCertificate(Certificate c) {
        certificates.add(c);
        c.setStudent(this);
    }

    public void removeCertificate(Certificate c) {
        certificates.remove(c);
        c.setStudent(null);
    }

    public void addPlacement(Placement p) {
        placements.add(p);
        p.getStudents().add(this);
    }

    public void removePlacement(Placement p) {
        placements.remove(p);
        p.getStudents().remove(this);
    }

    public StudentProfile getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfile studentProfile) {
        this.studentProfile = studentProfile;
        if (studentProfile != null) {
            studentProfile.setStudent(this);
        }
    }
}
