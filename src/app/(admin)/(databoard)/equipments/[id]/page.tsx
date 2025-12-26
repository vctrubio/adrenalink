import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import { getEquipmentIdStats } from "@/getters/databoard-sql-equipment";
import type { EquipmentModel } from "@/backend/models";
import { EntityHeaderRow } from "@/src/components/databoard/EntityHeaderRow";
import { EquipmentIdStats } from "@/src/components/databoard/stats/EquipmentIdStats";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { EquipmentLeftColumnV2 } from "./EquipmentLeftColumnV2";
import { EquipmentRightColumnV2 } from "./EquipmentRightColumnV2";

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    console.log(`EquipmentDetailPage: Fetched ID from params: ${id}`);
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
        return (
            <EntityIdLayout
                header={
                    <EntityHeaderRow
                        entityId="equipment"
                        entityName={`Equipment ${id}`}
                        stats={[]}
                    />
                }
                leftColumn={<div>School context not found</div>}
                rightColumn={null}
            />
        );
    }

    const result = await getEntityId("equipment", id);

    if (!result.success) {
        return (
            <EntityIdLayout
                header={
                    <EntityHeaderRow
                        entityId="equipment"
                        entityName={`Equipment ${id}`}
                        stats={[]}
                    />
                }
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
                header={
                    <EntityHeaderRow
                        entityId="equipment"
                        entityName={`Equipment ${id}`}
                        stats={[]}
                    />
                }
                leftColumn={<div>You do not have permission to view this equipment</div>}
                rightColumn={null}
            />
        );
    }

    const equipmentStats = EquipmentIdStats.getStats(equipment);
    const entityName = `${equipment.schema.model}${equipment.schema.size ? ` - ${equipment.schema.size}m` : ""}`;

    // Fetch optimized stats for left column
    const equipmentIdStats = await getEquipmentIdStats(equipment.schema.id);

    return (
        <EntityIdLayout
            header={
                <EntityHeaderRow
                    entityId="equipment"
                    entityName={entityName}
                    stats={equipmentStats}
                />
            }
            leftColumn={<EquipmentLeftColumnV2 equipment={equipment} equipmentStats={equipmentIdStats} />}
            rightColumn={<EquipmentRightColumnV2 equipment={equipment} />}
        />
    );
}
