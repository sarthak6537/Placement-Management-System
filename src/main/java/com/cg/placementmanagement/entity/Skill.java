package com.cg.placementmanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Skill name is required")
    @Column(unique = true)
    private String name;

    private String category;

    @ManyToMany(mappedBy = "skills")
    @JsonIgnore
    private Set<StudentProfile> studentProfiles = new HashSet<>();

    public Skill() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Set<StudentProfile> getStudentProfiles() { return studentProfiles; }
    public void setStudentProfiles(Set<StudentProfile> studentProfiles) { this.studentProfiles = studentProfiles; }
}
