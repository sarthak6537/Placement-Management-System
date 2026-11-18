package com.cg.placementmanagement.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotBlank;

@Entity
@DiscriminatorValue("PLACEMENT_OFFICER")
public class PlacementOfficer extends User {
    
    @NotBlank(message = "Department is required")
    private String department;

    public PlacementOfficer() { super(); }

    public PlacementOfficer(String username, String password, String email, String department) {
        super(username, password, email, Role.ROLE_PLACEMENT_OFFICER);
        this.department = department;
    }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
