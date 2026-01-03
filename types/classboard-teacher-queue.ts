/**
 * Consolidated types for classboard teacher queue management
 * All queue-related types in one place for consistency and maintainability
 */

import type { CommissionInfo } from "@/getters/commission-calculator";

export interface StudentData {
    id: string;
    firstName: string;
    lastName: string;
    passport: string;
    country: string;
    phone: string;
}

/**
 * EventNode - Optimized event node with only essential data
 * Reduces memory footprint and simplifies data structures
 * Used in TeacherQueue for storing events with all necessary information for:
 * - Event card rendering (lessonId, eventData, students, booking leader)
 * - Statistics calculation (commission info, capacity, event status/duration, revenue)
 * - Equipment display (categoryEquipment, capacityEquipment)
 * - Teacher queue management
 */
export interface EventNode {
    id: string;
    lessonId: string;
    bookingId: string;
    bookingLeaderName: string;
    // Always present - needed for export/reporting even for single student bookings
    bookingStudents: StudentData[];
    capacityStudents: number;
    pricePerStudent: number; // For revenue calculation
    packageDuration: number; // Package expected duration in minutes
    categoryEquipment: string; // For equipment display
    capacityEquipment: number; // For equipment display
    commission: {
        type: "fixed" | "percentage";
        cph: number; // Currency per hour (based on school credential currency) or percentage
    };
    eventData: {
        date: string;
        duration: number;
        location: string;
        status: "planned" | "tbc" | "completed" | "uncompleted";
    };
    prev: EventNode | null;
    next: EventNode | null;
}


export interface ControllerSettings {
    submitTime: string;
    location: string;
    durationCapOne: number;
    durationCapTwo: number;
    durationCapThree: number;
    gapMinutes: number;
    stepDuration: number;
    minDuration: number;
    maxDuration: number;
    locked?: boolean; // Locked = optimize on delete, Unlocked = respect existing times
}

/**
 * Minimal draggable booking for event creation
 * Only contains data needed to create a new event via drag-drop
 */
export interface DraggableBooking {
    bookingId: string;
    capacityStudents: number;
    lessons: {
        id: string; // lessonId
        teacherId: string; // UUID of teacher
    }[];
}

export type TeacherViewMode = "collapsed" | "expanded" | "adjustment";

/**
 * Event card properties for rendering - gap info and movement constraints
 */
export interface EventCardProps {
    gap: {
        hasGap: boolean;
        gapDuration: number;
        meetsRequirement: boolean;
    };
    isFirst: boolean;
    isLast: boolean;
    canMoveEarlier: boolean;
    canMoveLater: boolean;
}
