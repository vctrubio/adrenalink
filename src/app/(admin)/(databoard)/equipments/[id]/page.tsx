import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import { MasterAdminLayout } from "@/src/components/layouts/MasterAdminLayout";
import type { EquipmentModel } from "@/backend/models";
import { EquipmentLeftColumn } from "./EquipmentLeftColumn";
import { TeachersUsingEquipmentCard } from "@/src/components/cards/TeachersUsingEquipmentCard";
import { EquipmentRepairsCard } from "@/src/components/cards/EquipmentRepairsCard";
import { EquipmentStatsColumns } from "./EquipmentStatsColumns";

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    console.log(`EquipmentDetailPage: Fetched ID from params: ${id}`);
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: School context not found</div>
            </div>
        );
    }

    const result = await getEntityId("equipment", id);

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: {result.error}</div>
            </div>
        );
    }

    const equipment = result.data as EquipmentModel;

    // Verify equipment belongs to the school
    if (equipment.schema.schoolId !== schoolHeader.id) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: You do not have permission to view this equipment</div>
            </div>
        );
    }

    return (
        <MasterAdminLayout
            controller={<EquipmentLeftColumn equipment={equipment} />}
            form={
                <>
                    <EquipmentStatsColumns equipment={equipment} />

                    <TeachersUsingEquipmentCard equipment={equipment} />

                    <EquipmentRepairsCard equipment={equipment} />

                </>
            }
        />
    );
}
