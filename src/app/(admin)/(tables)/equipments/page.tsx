import { getEquipmentsTable } from "@/supabase/server/equipments";
import { EquipmentsTable } from "./EquipmentsTable";
import { TableLayout } from "../TableLayout";
import type { TableStat } from "../TablesHeaderStats";
import { getAggregateEquipments } from "@/backend/data/EquipmentStats";

export const dynamic = "force-dynamic";

export default async function EquipmentsMasterTablePage() {
    const equipments = await getEquipmentsTable();

    const stats_data = equipments.reduce(
        (acc, curr) => ({
            equipmentCount: acc.equipmentCount + curr.stats.equipmentCount,
            totalRepairs: acc.totalRepairs + curr.stats.totalRepairs,
            totalRentalsCount: acc.totalRentalsCount + curr.stats.totalRentalsCount,
            totalLessonEventsCount: acc.totalLessonEventsCount + curr.stats.totalLessonEventsCount,
        }),
        { equipmentCount: 0, totalRepairs: 0, totalRentalsCount: 0, totalLessonEventsCount: 0 },
    );

    const stats: TableStat[] = [
        { type: "equipment", value: stats_data.equipmentCount, desc: "Total gear in inventory" },
        { type: "events", value: stats_data.totalLessonEventsCount, label: "Activity", desc: "Lessons using this gear" },
        { type: "rentals", value: stats_data.totalRentalsCount, desc: "Direct student rentals" },
        { type: "repairs", value: stats_data.totalRepairs, desc: "Total maintenance logs" },
    ];

    return (
        <TableLayout stats={stats}>
            <EquipmentsTable equipments={equipments} />
        </TableLayout>
    );
}
