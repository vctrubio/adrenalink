/**
 * Email Color Configuration
 * Centralized color definitions for email templates
 * Following clean code thesis: single source of truth, direct access
 */

export const EMAIL_COLORS = {
    // Primary Colors
    primary: "#6366f1",
    primaryHover: "#4f46e5",
    primaryDark: "#18181b",
    
    // Background Colors
    background: "#f4f4f5",
    backgroundLight: "#fafafa",
    white: "#ffffff",
    
    // Text Colors
    textPrimary: "#18181b",
    textSecondary: "#52525b",
    textMuted: "#71717a",
    textLight: "#a1a1aa",
    
    // Border Colors
    border: "#e4e4e7",
    borderLight: "#f4f4f5",
    
    // System Architecture Colors
    students: "#eab308",
    teachers: "#22c55e",
    bookings: "#3b82f6",
    equipment: "#a855f7",
    packages: "#fb923c",
} as const;
