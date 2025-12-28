import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import { EquipmentDataboard } from "@/getters/databoard-getter";
import { createStat } from "@/src/components/databoard/stats/stat-factory";
import type { EquipmentModel } from "@/backend/models";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { EquipmentLeftColumn } from "./EquipmentLeftColumn";
import { EquipmentRightColumn } from "./EquipmentRightColumn";

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    console.log(`EquipmentDetailPage: Fetched ID from params: ${id}`);
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
        return <div>School context not found</div>;
    }

    const result = await getEntityId("equipment", id);

    if (!result.success) {
        return <div>Equipment not found</div>;
    }

    const equipment = result.data as EquipmentModel;

    // Verify equipment belongs to the school
    if (equipment.schema.schoolId !== schoolHeader.id) {
        return <div>You do not have permission to view this equipment</div>;
    }

    // Build stats using databoard-getter + stat-factory (single source of truth)
    const equipmentName = `${equipment.schema.model}${equipment.schema.size ? ` - ${equipment.schema.size}m` : ""}`;
    const stats = [
        createStat("lessons", EquipmentDataboard.getLessonCount(equipment), "Lessons"),
        createStat("events", EquipmentDataboard.getEventCount(equipment), "Events"),
        createStat("duration", EquipmentDataboard.getDurationMinutes(equipment), "Duration"),
        createStat("revenue", EquipmentDataboard.getRevenue(equipment), "Revenue"),
    ].filter(Boolean) as any[];

    return (
        <EntityIdLayout
            stats={stats}
            leftColumn={<EquipmentLeftColumn equipment={equipment} />}
            rightColumn={<EquipmentRightColumn equipment={equipment} />}
        />
    );
}
