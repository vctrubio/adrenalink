import { getEquipments } from "@/actions/databoard-action";
import { DataboardPageClient } from "@/src/components/databoard/DataboardPageClient";
import { equipmentRenderers, calculateEquipmentGroupStats } from "@/src/components/databoard/rows/EquipmentRow";

export default async function EquipmentPage() {
    const result = await getEquipments();

    if (!result.success) {
        return <div>Error loading equipments: {result.error}</div>;
    }

    return <DataboardPageClient entityId="equipment" data={result.data} renderers={equipmentRenderers} calculateStats={calculateEquipmentGroupStats} />;
}
