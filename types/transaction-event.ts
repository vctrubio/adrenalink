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

export interface TransactionEventData {
    event: {
        id: string;
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
    financials: TransactionEventFinancials;
}
