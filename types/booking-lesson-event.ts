/**
 * Common type definitions for booking, lesson, and event data
 * Used across booking containers, teacher views, and data transformations
 */

/**
 * Raw event data from database queries
 */
export interface EventData {
    id: string;
    date: string | Date;
    duration: number;
    location?: string;
    status: string;
}

/**
 * Transformed event row data for display
 */
export interface LessonEventRowData {
    eventId: string;
    date: Date;
    time: string;
    dateLabel: string;
    dayOfWeek?: string;
    duration: number;
    durationLabel: string;
    location: string;
    status: string;
}

/**
 * Lesson data from database queries
 */
export interface LessonData {
    id: string;
    status: string;
    teacher?: {
        id: string;
        username: string;
        firstName?: string;
        lastName?: string;
    };
    events?: EventData[];
    commission?: {
        commissionType: string;
        cph: string;
    };
    booking?: {
        id: string;
        status: string;
        leaderStudentName: string;
        dateStart: string;
        dateEnd: string;
        studentPackage?: {
            schoolPackage?: {
                durationMinutes: number;
                pricePerStudent: number;
                capacityStudents: number;
                capacityEquipment: number;
                categoryEquipment: string;
            };
        };
        bookingStudents?: Array<{
            student?: {
                id: string;
                firstName: string;
                lastName: string;
            };
        }>;
    };
}

/**
 * Transformed teacher lesson row data for display
 */
export interface TeacherLessonRowData {
    lessonId: string;
    teacherId: string;
    teacherName: string;
    teacherUsername: string;
    status: string; // lesson status
    commissionType: string;
    cph: number;
    eventCount: number;
    duration: number;
    earned: number;
    events: LessonEventRowData[];
    // Additional fields often used
    bookingId?: string;
    bookingStatus?: string;
    leaderName?: string;
    dateStart?: string;
    dateEnd?: string;
    equipmentCategory?: string;
    studentCapacity?: number;
}
