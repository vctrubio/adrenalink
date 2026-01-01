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

export interface PackageData {
    pricePerStudent: number;
    durationMinutes: number;
    description: string;
    categoryEquipment: string;
    capacityEquipment: number;
}

export interface EventNode {
    id: string;
    lessonId: string;
    bookingId: string;
    leaderStudentName?: string;
    bookingStudents?: StudentData[];
    commission: CommissionInfo;
    eventData: {
        date: string;
        duration: number;
        location: string;
        status: string;
    };
    studentData: StudentData[];
    packageData: PackageData;
    next: EventNode | null;
}

/**
 * EventNodeV2 - Optimized event node with only essential data
 * Reduces memory footprint and simplifies data structures
 * Used in TeacherQueue for storing events with all necessary information for:
 * - Event card rendering (lessonId, eventData, students, booking leader)
 * - Statistics calculation (commission info, capacity, event status/duration)
 * - Teacher queue management
 */
export interface EventNodeV2 {
    id: string;
    lessonId: string;
    bookingId: string;
    bookingLeaderName: string;
    // Only include students if capacity > 1
    bookingStudents: StudentData[] | null;
    capacityStudents: number;
    commission: {
        type: "fixed" | "percentage";
        cph: number; // cents per hour or percentage
    };
    eventData: {
        date: string;
        duration: number;
        location: string;
        status: "planned" | "tbc" | "completed" | "uncompleted";
    };
    next: EventNodeV2 | null;
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
