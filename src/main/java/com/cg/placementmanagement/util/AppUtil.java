package com.cg.placementmanagement.util;

/**
 * Utility helpers for the application.
 */
public final class AppUtil {
    private AppUtil() {}

    public static boolean isNullOrEmpty(String s) {
        return s == null || s.isEmpty();
    }
}
