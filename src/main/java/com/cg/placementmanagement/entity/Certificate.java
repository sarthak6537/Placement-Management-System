package com.cg.placementmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
public class Certificate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Certificate name is required")
    private String name;

    @NotNull(message = "Issued date is required")
    private LocalDate issuedDate;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    public Certificate() {}

    public Certificate(String name, LocalDate issuedDate) {
        this.name = name;
        this.issuedDate = issuedDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDate getIssuedDate() { return issuedDate; }
    public void setIssuedDate(LocalDate issuedDate) { this.issuedDate = issuedDate; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
}
