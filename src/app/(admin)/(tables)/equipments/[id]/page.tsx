import { getEquipmentId } from "@/supabase/server/equipment-id";
import { EquipmentData } from "@/backend/data/EquipmentData";
import { EquipmentTableGetters } from "@/getters/table-getters";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { EquipmentLeftColumn } from "./EquipmentLeftColumn";
import { EquipmentRightColumn } from "./EquipmentRightColumn";

import { TableLayout } from "../../TableLayout";
import type { TableStat } from "../../TablesHeaderStats";

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getEquipmentId(id);

    if (!result.success || !result.data) {
        return <div>Equipment not found</div>;
    }

    const equipment: EquipmentData = result.data;

    const lessonDurationMinutes = EquipmentTableGetters.getTotalUsageMinutes(equipment);
    const rentalDurationMinutes = EquipmentTableGetters.getTotalRentalMinutes(equipment);

    const stats: TableStat[] = [
        {
            type: "equipment",
            value: `${equipment.schema.brand} ${equipment.schema.model}`,
            desc: "Equipment Profile",
        },
        {
            type: "events",
            value: EquipmentTableGetters.getEventCount(equipment),
            label: "Activity",
            desc: "Lessons using this gear",
        },
        {
            type: "rentals",
            value: EquipmentTableGetters.getRentalCount(equipment),
            desc: "Direct student rentals",
        },
        {
            type: "repairs",
            value: EquipmentTableGetters.getRepairCount(equipment),
            desc: "Total maintenance logs",
        },
        {
            type: "duration",
            value: rentalDurationMinutes + lessonDurationMinutes,
            label: "Flying Time",
            desc: "Total rental duration",
        },
    ];

    return (
        <TableLayout stats={stats} showSearch={false}>
            <EntityIdLayout
                stats={stats}
                leftColumn={<EquipmentLeftColumn equipment={equipment} />}
                rightColumn={<EquipmentRightColumn equipment={equipment} />}
            />
        </TableLayout>
    );
}
