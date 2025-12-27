import { getEquipments } from "@/actions/databoard-action";
import { DataboardPageClient } from "@/src/components/databoard/DataboardPageClient";

export default async function EquipmentsPage() {
    const result = await getEquipments();

    if (!result.success) {
        return <div>Error loading equipments: {result.error}</div>;
    }

    return <DataboardPageClient entityId="equipment" data={result.data} />;
}
