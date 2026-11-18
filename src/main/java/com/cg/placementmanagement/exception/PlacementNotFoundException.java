package com.cg.placementmanagement.exception;

/**
 * Thrown when a Placement entity cannot be found.
 */
public class PlacementNotFoundException extends CustomException {
    public PlacementNotFoundException(String message) {
        super(message);
    }
}
