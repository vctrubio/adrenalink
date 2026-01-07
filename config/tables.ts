/**
TYPES OF TABLE DATA
 */
import { BOOKING_STATUS, LESSON_STATUS } from "supabase/db/enums";

export interface Booking {
    id: string;
    dateStart: string;
    dateEnd: string;
    leaderStudentName: string;
    status: (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
}

export interface Package {
    description: string;
    categoryEquipment: string;
    capacityEquipment: number;
    capacityStudents: number;
    durationMinutes: number;
    pricePerStudent: number;
    pph: number; // price per hour per student
}

export interface Commission {
    type: "fixed" | "percentage";
    cph: string;
}

export interface LessonEvents {
    id: string;
    teacherId: string;
    teacherUsername: string;
    status: (typeof LESSON_STATUS)[keyof typeof LESSON_STATUS];
    commission: Commission;
    events: {
        totalCount: number;
        totalDuration: number; // in minutes
        details: { status: string; duration: number }[];
    };
}

export interface LessonWithPayments extends LessonEvents {
    teacherPayments: number;
    dateCreated: string;
    category: string;
    lessonRevenue: number;
    leaderStudentName: string;
    capacityStudents: number;
    bookingId: string;
}

export interface BookingStudentPayments {
    student_id: number;
    amount: number;
}

export interface BookingWithLessonAndPayments {
    booking: Booking;
    package: Package;
    lessons: LessonWithPayments[];
    payments: BookingStudentPayments[];
}

export interface Students {
    id: string;
    firstName: string;
    lastName: string;
    country: string;
    phone: string;
    languages: string[];
    bookings: BookingWithLessonAndPayments[];
}

export interface Teachers {

    id: string;

    username: string;

    firstName: string;

    lastName: string;

    country: string;

    phone: string;

    languages: string[];

    lessons: LessonEvents[];

}



export interface TeacherWithLessonsAndPayments {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    country: string;
    phone: string;
    languages: string[];
    active: boolean;
    lessons: LessonWithPayments[];
    equipments: {
        id: string;
        model: string;
        brand: string;
        size: number | null;
        category: string;
    }[];
    activityStats: Record<string, { count: number; durationMinutes: number }>;
}



export type TeacherTableData = TeacherWithLessonsAndPayments & { stats: TeacherTableStats };



/*

TABLE STATS INTERFACES

*/



export interface BookingTableStats {

    events: {

        count: number;

        duration: number;

        revenue: number;

        statusCounts: {

            planned: number;

            tbc: number;

            completed: number;

            uncompleted: number;

        };

    };

    payments: {

        student: number;

        teacher: number;

    };

    commissions: number;

    balance: number;

}



export interface StudentTableStats {

    totalBookings: number;

    totalEvents: number;

    totalDurationMinutes: number;

    totalRevenue: number;

    totalPayments: number;

}



export interface TeacherTableStats {

    teacherCount: number;

    totalLessons: number;

    totalDurationMinutes: number;

    totalCommissions: number;

    totalPayments: number;

}



export interface EquipmentTableStats {
    equipmentCount: number;
    totalRentalsCount: number;
    totalLessonEventsCount: number;
    totalRepairs: number;
}

export interface EquipmentAssignedTeacher {
    id: string;
    username: string;
    eventCount: number;
    durationMinutes: number;
}

export interface EquipmentWithRepairsRentalsEvents {
    id: string;
    sku: string;
    brand: string;
    model: string;
    color: string | null;
    size: number | null;
    category: string;
    status: string;
    assignedTeachers: EquipmentAssignedTeacher[];
    repairStats: {
        count: number;
    };
    rentalStats: {
        count: number;
    };
    activityStats: {
        eventCount: number;
        totalDurationMinutes: number;
    };
}

export type EquipmentTableData = EquipmentWithRepairsRentalsEvents & { stats: EquipmentTableStats };

export interface PackageWithUsageStats {
    id: string;
    description: string;
    categoryEquipment: string;
    capacityEquipment: number;
    capacityStudents: number;
    durationMinutes: number;
    pricePerStudent: number;
    packageType: string;
    isPublic: boolean;
    active: boolean;
    usageStats: {
        bookingCount: number;
        requestCount: number;
        revenue: number;
    };
}

export type PackageTableData = PackageWithUsageStats & { stats: PackageTableStats };

/*
TABLE STATS INTERFACES
*/

export interface BookingTableStats {
    events: {
        count: number;
        duration: number;
        revenue: number;
        statusCounts: {
            planned: number;
            tbc: number;
            completed: number;
            uncompleted: number;
        };
    };
    payments: {
        student: number;
        teacher: number;
    };
    commissions: number;
    balance: number;
}

export interface StudentTableStats {
    totalBookings: number;
    totalEvents: number;
    totalDurationMinutes: number;
    totalRevenue: number;
    totalPayments: number;
}

export interface TeacherTableStats {
    teacherCount: number;
    totalLessons: number;
    totalDurationMinutes: number;
    totalCommissions: number;
    totalPayments: number;
}

export interface EquipmentTableStats {
    equipmentCount: number;
    totalRentalsCount: number;
    totalLessonEventsCount: number;
    totalRepairs: number;
}

export interface EquipmentAssignedTeacher {
    id: string;
    username: string;
    eventCount: number;
    durationMinutes: number;
}

export interface EquipmentWithRepairsRentalsEvents {
    id: string;
    sku: string;
    brand: string;
    model: string;
    color: string | null;
    size: number | null;
    category: string;
    status: string;
    assignedTeachers: EquipmentAssignedTeacher[];
    repairStats: {
        count: number;
    };
    rentalStats: {
        count: number;
    };
    activityStats: {
        eventCount: number;
        totalDurationMinutes: number;
    };
}

export type EquipmentTableData = EquipmentWithRepairsRentalsEvents & { stats: EquipmentTableStats };

export interface StudentWithBookingsAndPayments {
    id: string;
    firstName: string;
    lastName: string;
    country: string;
    phone: string;
    languages: string[];
    schoolStudentStatus: string;
    schoolStudentDescription: string | null;
    bookings: {
        id: string;
        status: string;
        dateStart: string;
        dateEnd: string;
        packageName: string;
        packageDetails: Package;
        lessons: LessonWithPayments[];
        stats: BookingTableStats;
    }[];
}

export type StudentTableData = StudentWithBookingsAndPayments & { stats: StudentTableStats };

export interface PackageTableStats {
    packageCount: number;
    totalBookings: number;
    totalRequests: number;
    totalRevenue: number;
}
