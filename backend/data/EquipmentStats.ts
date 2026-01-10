import type { EquipmentTableData } from "@/config/tables";
import type { EquipmentTableStats } from "@/config/tables";

/**
 * Aggregates statistics for a list of equipment
 */
export function getAggregateEquipment(equipments: EquipmentTableData[]): EquipmentTableStats {
    return equipments.reduce(
        (acc, curr) => ({
            equipmentCount: acc.equipmentCount + curr.stats.equipmentCount,
            totalRepairs: acc.totalRepairs + curr.stats.totalRepairs,
            totalRentalsCount: acc.totalRentalsCount + curr.stats.totalRentalsCount,
            totalLessonEventsCount: acc.totalLessonEventsCount + curr.stats.totalLessonEventsCount,
        }),
        { equipmentCount: 0, totalRepairs: 0, totalRentalsCount: 0, totalLessonEventsCount: 0 },
    );
}
