import type { RentalModel } from "@/backend/models";

const RENTAL_RATE_PER_HOUR = 80; // Fixed rate, will change

export const RentalStats = {
    getDuration: (rental: RentalModel): number => rental.schema.duration || 0,
    getRevenue: (rental: RentalModel): number => (rental.schema.duration || 0) * RENTAL_RATE_PER_HOUR,
};

export const getRentalDateString = (rental: RentalModel): string => {
    const date = new Date(rental.schema.date);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const getRentalLocation = (rental: RentalModel): string => {
    return rental.schema.location || "-";
};

export const getRentalStatus = (rental: RentalModel): string => {
    return rental.schema.status;
};

export const getStudentName = (rental: RentalModel): string => {
    const student = rental.relations?.student;
    if (!student) return "Unknown";
    return `${student.firstName} ${student.lastName}`;
};

export const getEquipmentInfo = (rental: RentalModel): { sku: string; model: string } | null => {
    const equipment = rental.relations?.equipment;
    if (!equipment) return null;
    return {
        sku: equipment.sku,
        model: equipment.model,
    };
};
