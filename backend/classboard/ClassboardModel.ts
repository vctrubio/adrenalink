export interface ClassboardBooking {
    id: string;
    dateStart: string;
    dateEnd: string;
    leaderStudentName?: string;
    status?: string;
}

export interface ClassboardSchoolPackage {
    id: string;
    durationMinutes: number;
    description: string;
    pricePerStudent: number;
    capacityStudents: number;
    capacityEquipment: number;
    categoryEquipment: string;
    packageType: string;
}

export interface ClassboardStudent {
    id: string;
    firstName: string;
    lastName: string;
    passport: string;
    country: string;
    phone: string;
    languages: string[];
}

export interface ClassboardBookingStudent {
    student: ClassboardStudent & {
        description?: string | null; // from schoolStudents
    };
}

export interface ClassboardTeacher {
    id: string;
    username: string;
}

export interface ClassboardEvent {
    id: string;
    date: string;
    duration: number;
    location: string;
    status: string;
    equipments?: {
        id: string;
        brand: string;
        model: string;
        size: number | null;
        sku?: string;
        color?: string;
    }[];
}

export interface ClassboardCommission {
    id: string;
    type: "fixed" | "percentage";
    cph: string; // Commission per hour
    description?: string | null;
}

export interface ClassboardLesson {
    id: string;
    teacher: ClassboardTeacher;
    status: string;
    commission: ClassboardCommission;
    events: ClassboardEvent[];
}

export interface ClassboardData {
    booking: ClassboardBooking;
    schoolPackage: ClassboardSchoolPackage;
    bookingStudents: ClassboardBookingStudent[];
    lessons: ClassboardLesson[];
}

export type ClassboardModel = ClassboardData[];