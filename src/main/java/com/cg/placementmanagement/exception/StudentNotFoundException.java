package com.cg.placementmanagement.exception;

/**
 * Thrown when a Student entity cannot be found.
 */
public class StudentNotFoundException extends CustomException {
    public StudentNotFoundException(String message) {
        super(message);
    }
}
