import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import { getEquipmentIdStats } from "@/getters/databoard-sql-equipment";
import type { EquipmentModel } from "@/backend/models";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { EquipmentLeftColumn } from "./EquipmentLeftColumn";
import { EquipmentRightColumn } from "./EquipmentRightColumn";

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    console.log(`EquipmentDetailPage: Fetched ID from params: ${id}`);
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
        return (
            <EntityIdLayout
                leftColumn={<div>School context not found</div>}
                rightColumn={null}
            />
        );
    }

    const result = await getEntityId("equipment", id);

    if (!result.success) {
        return (
            <EntityIdLayout
                leftColumn={<div>Equipment not found</div>}
                rightColumn={null}
            />
        );
    }

    const equipment = result.data as EquipmentModel;

    // Verify equipment belongs to the school
    if (equipment.schema.schoolId !== schoolHeader.id) {
        return (
            <EntityIdLayout
                leftColumn={<div>You do not have permission to view this equipment</div>}
                rightColumn={null}
            />
        );
    }

    // Fetch optimized stats for left column
    const equipmentIdStats = await getEquipmentIdStats(equipment.schema.id);

    return (
        <EntityIdLayout
            leftColumn={<EquipmentLeftColumn equipment={equipment} equipmentStats={equipmentIdStats} />}
            rightColumn={<EquipmentRightColumn equipment={equipment} />}
        />
    );
}
