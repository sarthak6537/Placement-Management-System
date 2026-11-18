package com.cg.placementmanagement.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity
@DiscriminatorValue("STUDENT")
public class StudentUser extends User {

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_profile_id")
    private Student student;

    public StudentUser() { super(); }

    public StudentUser(String username, String password, String email, Student student) {
        super(username, password, email, Role.ROLE_STUDENT);
        this.student = student;
    }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
}
