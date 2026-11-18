package com.cg.placementmanagement.exception;

/**
 * Thrown when a College entity cannot be found.
 */
public class CollegeNotFoundException extends CustomException {
    public CollegeNotFoundException(String message) {
        super(message);
    }
}
