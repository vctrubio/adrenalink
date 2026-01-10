import type { EquipmentWithRepairsRentalsEvents, EquipmentTableStats } from "@/config/tables";

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
