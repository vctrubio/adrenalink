import type { EquipmentModel } from "@/backend/models";

// Get equipment name (model + size)
export function getEquipmentName(equipment: EquipmentModel): string {
    const size = equipment.schema.size ? ` ${equipment.schema.size}m` : "";
    return `${equipment.schema.model}${size}`;
}

// Get all teachers using this equipment with their total hours (from pre-calculated stats)
export function getEquipmentTeachers(equipment: EquipmentModel): Array<{ teacher: any; totalHours: number }> {
    const teacherEquipments = equipment.relations?.teacherEquipments || [];
    const teacherHours = equipment.stats?.teacherHours || {};

    return teacherEquipments.map((te) => {
        const teacher = te.teacher;
        if (!teacher) return null;

        const totalMinutes = teacherHours[teacher.id] || 0;
        const totalHours = totalMinutes / 60;

        return { teacher, totalHours };
    }).filter(Boolean) as Array<{ teacher: any; totalHours: number }>;
}

// Check if equipment has open repairs (no checkOut date)
export function hasOpenRepair(equipment: EquipmentModel): boolean {
    const repairs = equipment.relations?.equipmentRepairs || [];
    return repairs.some((repair) => !repair.checkOut);
}

// Get count of events using this equipment (from pre-calculated stats)
export function getEquipmentEventsCount(equipment: EquipmentModel): number {
    return equipment.stats?.eventsCount || 0;
}

// Get total duration of all events using this equipment in hours (from pre-calculated stats)
export function getEquipmentEventsDuration(equipment: EquipmentModel): number {
    const totalMinutes = equipment.stats?.totalDurationMinutes || 0;
    return totalMinutes / 60;
}

// Get count of rentals for this equipment (from pre-calculated stats)
export function getEquipmentRentalsCount(equipment: EquipmentModel): number {
    return equipment.stats?.rentalsCount || 0;
}

// Calculate money in (from pre-calculated stats)
export function getEquipmentMoneyIn(equipment: EquipmentModel): number {
    return equipment.stats?.moneyIn || 0;
}

// Calculate money out (from pre-calculated stats)
export function getEquipmentMoneyOut(equipment: EquipmentModel): number {
    return equipment.stats?.moneyOut || 0;
}

// Calculate net revenue (money in - money out)
export function getEquipmentRevenue(equipment: EquipmentModel): number {
    return getEquipmentMoneyIn(equipment) - getEquipmentMoneyOut(equipment);
}
