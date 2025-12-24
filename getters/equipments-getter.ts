import type { EquipmentModel } from "@/backend/models";

// ============ EQUIPMENT STATS NAMESPACE ============
// Reads from pre-calculated stats in databoard models

export const EquipmentStats = {
    getEventsCount: (equipment: EquipmentModel): number => equipment.stats?.events_count || 0,
    getTotalHours: (equipment: EquipmentModel): number => (equipment.stats?.total_duration_minutes || 0) / 60,
    getRentalsCount: (equipment: EquipmentModel): number => equipment.stats?.rentals_count || 0,
    getMoneyIn: (equipment: EquipmentModel): number => equipment.stats?.money_in || 0,
    getMoneyOut: (equipment: EquipmentModel): number => equipment.stats?.money_out || 0,
    getRevenue: (equipment: EquipmentModel): number => EquipmentStats.getMoneyIn(equipment) - EquipmentStats.getMoneyOut(equipment),
};

// ============ EQUIPMENT UTILITY FUNCTIONS ============
// Helpers for equipment display and relation access

// Get equipment name (model + size)
export function getEquipmentName(equipment: EquipmentModel): string {
    const size = equipment.schema.size ? ` ${equipment.schema.size}` : "";
    return `${equipment.schema.model}${size}`;
}

// Get all teachers using this equipment with their total hours (from pre-calculated stats)
export function getEquipmentTeachers(equipment: EquipmentModel): { teacher: any; totalHours: number }[] {
    const teacherEquipments = equipment.relations?.teacherEquipments || [];
    const teacherHours = equipment.stats?.teacherHours || {};

    return teacherEquipments
        .map((te) => {
            const teacher = te.teacher;
            if (!teacher) return null;

            const totalMinutes = teacherHours[teacher.id] || 0;
            const totalHours = totalMinutes / 60;

            return { teacher, totalHours };
        })
        .filter(Boolean) as { teacher: any; totalHours: number }[];
}
