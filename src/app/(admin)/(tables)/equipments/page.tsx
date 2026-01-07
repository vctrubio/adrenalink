import { getEquipmentsTable } from "@/supabase/server/equipments";
import { EquipmentsTable } from "./EquipmentsTable";
import { TablesPageClient } from "@/src/components/tables/TablesPageClient";
import type { TableStat } from "@/src/components/tables/TablesHeaderStats";

export default async function EquipmentsMasterTablePage() {
    const equipments = await getEquipmentsTable();

    // Calculate stats
    const totalEquipment = equipments.length;
    let totalRentals = 0;
    let totalEvents = 0;
    let totalRepairs = 0;
    let totalDurationMinutes = 0;

    equipments.forEach(e => {
        totalRentals += e.rentalStats.count;
        totalEvents += e.activityStats.eventCount;
        totalRepairs += e.repairStats.count;
        totalDurationMinutes += e.activityStats.totalDurationMinutes;
    });

    const stats: TableStat[] = [
        { type: "equipment", value: totalEquipment },
        { type: "rentals", value: totalRentals },
        { type: "repairs", value: totalRepairs },
        { type: "events", value: totalEvents, label: "Usage" },
        { type: "duration", value: (totalDurationMinutes / 60).toFixed(1) + "h" }
    ];

    return (
        <TablesPageClient
            title="Equipments Master Table"
            description="Monitor gear inventory, repair history, teacher assignments, and total usage."
            stats={stats}
        >
            <EquipmentsTable equipments={equipments} />
        </TablesPageClient>
    );
}