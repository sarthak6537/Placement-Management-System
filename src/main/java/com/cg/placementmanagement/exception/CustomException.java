package com.cg.placementmanagement.exception;

/**
 * Simple runtime exception for application-specific errors.
 */
public class CustomException extends RuntimeException {
    public CustomException(String message) {
        super(message);
    }
}
