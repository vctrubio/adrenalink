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
        id: string;
        username: string;
    };
    leaderStudentName: string;
    studentCount: number;
    studentNames: string[];
    packageData: TransactionEventPackage;
    financials: TransactionEventFinancials;
    equipments?: TransactionEventEquipment[];
}
