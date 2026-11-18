package com.cg.placementmanagement.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private Map<String, Object> buildBody(HttpServletRequest request, HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("path", request.getRequestURI());
        return body;
    }

    @ExceptionHandler(StudentNotFoundException.class)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleStudentNotFound(StudentNotFoundException ex, HttpServletRequest request) {
        Map<String, Object> body = buildBody(request, HttpStatus.NOT_FOUND, ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(CollegeNotFoundException.class)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleCollegeNotFound(CollegeNotFoundException ex, HttpServletRequest request) {
        Map<String, Object> body = buildBody(request, HttpStatus.NOT_FOUND, ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(PlacementNotFoundException.class)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handlePlacementNotFound(PlacementNotFoundException ex, HttpServletRequest request) {
        Map<String, Object> body = buildBody(request, HttpStatus.NOT_FOUND, ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(CustomException.class)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleCustomException(CustomException ex, HttpServletRequest request) {
        Map<String, Object> body = buildBody(request, HttpStatus.BAD_REQUEST, ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining(", "));
        Map<String, Object> body = buildBody(request, HttpStatus.BAD_REQUEST, errors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex, HttpServletRequest request) {
        Map<String, Object> body = buildBody(request, HttpStatus.CONFLICT, "Data integrity violation: " + ex.getMostSpecificCause().getMessage());
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex, HttpServletRequest request) {
        // Log the full stack trace so it appears in the Spring Boot console
        ex.printStackTrace();
        // Include the real cause in the response to help during development
        String message = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
        Map<String, Object> body = buildBody(request, HttpStatus.INTERNAL_SERVER_ERROR,
                message != null ? message : "An unexpected error occurred");
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
