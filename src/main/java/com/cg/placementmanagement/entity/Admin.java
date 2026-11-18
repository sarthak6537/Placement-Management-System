package com.cg.placementmanagement.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotBlank;

@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends User {
    @NotBlank(message = "Full name is required")
    private String fullName;

    public Admin() { super(); }

    public Admin(String username, String password, String email, String fullName) {
        super(username, password, email, Role.ROLE_ADMIN);
        this.fullName = fullName;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}
