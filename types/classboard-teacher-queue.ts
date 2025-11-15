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
    id: string | null;
    lessonId: string;
    bookingId: string;
    commission: CommissionInfo;
    eventData: {
        id?: string;
        date: string;
        duration: number;
        location: string;
        status: string;
    };
    studentData: StudentData[];
    packageData: PackageData;
    next: EventNode | null;
}

export interface TeacherInfo {
    username: string;
    name: string;
}

export interface ControllerSettings {
    submitTime: string;
    location: string;
    durationCapOne: number;
    durationCapTwo: number;
    durationCapThree: number;
    gapMinutes: number;
    stepDuration: number;
}

/**
 * Draggable booking with lessons and events for classboard UI
 * Used in drag-drop operations and booking display
 */
export interface DraggableBooking {
    bookingId: string;
    capacityStudents: number;
    lessons: Array<{
        id: string;
        teacherUsername: string;
        commissionType: "fixed" | "percentage";
        commissionCph: number;
        events: Array<{
            id: string;
            date: string;
            duration: number;
            location: string;
            status: string;
        }>;
    }>;
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
