import { type EventStatus } from "./status";

export interface TransactionEventFinancials {
    teacherEarnings: number;
    studentRevenue: number;
    profit: number;
    currency: string;
    commissionType: "fixed" | "percentage";
    commissionValue: number;
}

export interface TransactionEventPackage {
    description: string;
    pricePerStudent: number;
    durationMinutes: number;
    categoryEquipment: string;
    capacityEquipment: number;
    capacityStudents: number;
}

export interface TransactionEventEquipment {
    id: string;
    brand: string;
    model: string;
    size: number | null;
    sku?: string;
    color?: string;
}

export interface TransactionEventCommission {
    id: string;
    type: "fixed" | "percentage";
    cph: number;
    description?: string | null;
}

export interface TransactionEventData {
    event: {
        id: string;
        lessonId?: string;
        date: string;
        duration: number;
        location: string | null;
        status: string;
    };
    teacher: {
        username: string;
    };
    leaderStudentName: string;
    studentCount: number;
    studentNames: string[];
    packageData: TransactionEventPackage;
    commission: TransactionEventCommission;
    financials: TransactionEventFinancials;
    equipments?: TransactionEventEquipment[];
    lessonStatus?: string;
    bookingStatus?: string;
    bookingId?: string;
}
