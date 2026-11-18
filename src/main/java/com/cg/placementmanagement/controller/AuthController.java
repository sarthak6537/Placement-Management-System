package com.cg.placementmanagement.controller;

import com.cg.placementmanagement.dto.AuthDtos.JwtAuthResponse;
import com.cg.placementmanagement.dto.AuthDtos.LoginRequest;
import com.cg.placementmanagement.dto.AuthDtos.RegisterRequest;
import com.cg.placementmanagement.entity.Student;
import com.cg.placementmanagement.entity.StudentUser;
import com.cg.placementmanagement.entity.User;
import com.cg.placementmanagement.repository.StudentRepository;
import com.cg.placementmanagement.repository.UserRepository;
import com.cg.placementmanagement.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.cg.placementmanagement.entity.StudentProfile;
import com.cg.placementmanagement.repository.StudentProfileRepository;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final StudentProfileRepository studentProfileRepository;

    //    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
//                          StudentRepository studentRepository,
//                          PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
//        this.authenticationManager = authenticationManager;
//        this.userRepository = userRepository;
//        this.studentRepository = studentRepository;
//        this.passwordEncoder = passwordEncoder;
//        this.tokenProvider = tokenProvider;
//    }
    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          StudentRepository studentRepository,
                          StudentProfileRepository studentProfileRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider) {

        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = tokenProvider.generateToken(authentication);
            return ResponseEntity.ok(new JwtAuthResponse(jwt));
        } catch (org.springframework.security.core.AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            return new ResponseEntity<>("Username is already taken!", HttpStatus.BAD_REQUEST);
        }

        String email = registerRequest.getEmail() != null ? registerRequest.getEmail() : "";
        String encodedPassword = passwordEncoder.encode(registerRequest.getPassword());
        User user;

        if (registerRequest.getRole() != null && registerRequest.getRole() == com.cg.placementmanagement.entity.Role.ROLE_ADMIN) {
            String fullName = registerRequest.getFullName() != null ? registerRequest.getFullName() : registerRequest.getUsername();
            user = new com.cg.placementmanagement.entity.Admin(registerRequest.getUsername(), encodedPassword, email, fullName);
        } else if (registerRequest.getRole() != null && registerRequest.getRole() == com.cg.placementmanagement.entity.Role.ROLE_PLACEMENT_OFFICER) {
            String department = registerRequest.getDepartment() != null ? registerRequest.getDepartment() : "General";
            user = new com.cg.placementmanagement.entity.PlacementOfficer(registerRequest.getUsername(), encodedPassword, email, department);
        } else {
            // Default to Student
            Student student = new Student(
                    registerRequest.getUsername(),  // firstName
                    registerRequest.getUsername(),  // lastName (placeholder, user can edit)
                    email
            );
//            student = studentRepository.save(student);
//            user = new StudentUser(registerRequest.getUsername(), encodedPassword, email, student);
            student = studentRepository.save(student);

// Create Student Profile if it does not exist
            ensureStudentProfile(student);

            user = new StudentUser(registerRequest.getUsername(), encodedPassword, email, student);
        }

        userRepository.save(user);

        return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
    }

    /**
     * POST /auth/link-student
     * Called by the frontend when a ROLE_STUDENT user has no linked Student record
     * (i.e., accounts created before the auto-link fix was deployed).
     * Creates a Student row and links it to the current authenticated user.
     */
    @PostMapping("/link-student")
    public ResponseEntity<?> linkStudent(Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Not authenticated");
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);

        if (!(user instanceof StudentUser studentUser)) {
            return ResponseEntity.badRequest().body("Not a student account");
        }

        Student student = studentUser.getStudent();

        // Create Student record if not already linked
        if (student == null) {
            String email = user.getEmail() != null
                    ? user.getEmail()
                    : username + "@placeholder.local";

            student = new Student(username, username, email);
            student = studentRepository.save(student);

            studentUser.setStudent(student);
            userRepository.save(studentUser);
        }

        // Ensure Student Profile exists even if Student was already linked
        ensureStudentProfile(student);

        return ResponseEntity.ok(studentUser);
    }

    private void ensureStudentProfile(Student student) {
        if (student == null || student.getId() == null) {
            return;
        }

        if (studentProfileRepository.findByStudentId(student.getId()).isEmpty()) {
            StudentProfile profile = new StudentProfile();
            profile.setStudent(student);
            profile.setPhone("");
            profile.setDepartment("");
            profile.setBatch("");

            studentProfileRepository.save(profile);
        }
    }
}
