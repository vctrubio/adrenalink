import { getEntityId } from "@/actions/id-actions";
import type { EquipmentModel } from "@/backend/models";
import { InfoHeader } from "../../InfoHeader";

export default async function EquipmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getEntityId("equipment", id);

    if (!result.success) {
        return <InfoHeader title={`Equipment ${id}`} />;
    }

    const equipment = result.data as EquipmentModel;
    const equipmentTitle = equipment.schema.model;

    return (
        <>
            <InfoHeader title={equipmentTitle} />
            <div className="space-y-4">
                {/* Equipment details will go here */}
            </div>
        </>
    );
}
