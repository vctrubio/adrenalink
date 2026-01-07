import { getEquipmentId } from "@/supabase/server/equipment-id";
import { EquipmentData } from "@/backend/data/EquipmentData";
import { EquipmentTableGetters } from "@/getters/table-getters";
import { getStat } from "@/backend/RenderStats";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { EquipmentLeftColumn } from "./EquipmentLeftColumn";
import { EquipmentRightColumn } from "./EquipmentRightColumn";

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getEquipmentId(id);

    if (!result.success || !result.data) {
        return <div>Equipment not found</div>;
    }

    const equipment: EquipmentData = result.data;

    const stats = [
        getStat("equipment", `${equipment.schema.brand} ${equipment.schema.model}`, `${equipment.schema.brand} ${equipment.schema.model}`),
        getStat("events", EquipmentTableGetters.getEventCount(equipment)),
        getStat("rentals", EquipmentTableGetters.getRentalCount(equipment)),
        getStat("repairs", EquipmentTableGetters.getRepairCount(equipment)),
        getStat("revenue", EquipmentTableGetters.getRevenue(equipment)),
    ].filter(Boolean) as any[];

    return (
        <EntityIdLayout
            stats={stats}
            leftColumn={<EquipmentLeftColumn equipment={equipment} />}
            rightColumn={<EquipmentRightColumn equipment={equipment} />}
        />
    );
}
