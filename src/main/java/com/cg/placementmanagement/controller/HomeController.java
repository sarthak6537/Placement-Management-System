package com.cg.placementmanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> home() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "success");
        response.put("message", "PlacePro - Placement Management API is running");
        response.put("timestamp", LocalDateTime.now());
        response.put("version", "1.0.0");
        response.put("endpoints", new LinkedHashMap<String, String>() {{
            put("Auth",               "/auth/login, /auth/register");
            put("Students",           "/students");
            put("Student Profiles",   "/student-profiles");
            put("Colleges",           "/colleges");
            put("Companies",          "/companies");
            put("Job Postings",       "/job-postings");
            put("Job Applications",   "/job-applications");
            put("Interview Schedules","/interview-schedules");
            put("Placements",         "/placements");
            put("Certificates",       "/certificates");
            put("Skills",             "/skills");
            put("Users",              "/users");
        }});
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("service", "PlacePro - Placement Management API");
        return ResponseEntity.ok(response);
    }
}
