import type { EquipmentWithRepairsRentalsEvents, EquipmentTableStats, EquipmentTableData } from "@/config/tables";

export type EquipmentData = EquipmentTableData;
export type EquipmentRelations = any;
export type EquipmentUpdateForm = any;

/**
 * Calculate stats for a single equipment record
 */
export function calculateEquipmentStats(equipment: EquipmentWithRepairsRentalsEvents): EquipmentTableStats {
    return {
        equipmentCount: 1,
        totalRepairs: equipment.repairStats.count,
        totalRentalsCount: equipment.rentalStats.count,
        totalLessonEventsCount: equipment.activityStats.eventCount,
    };
}
