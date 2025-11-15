import { getEquipments } from "@/actions/databoard-action";
import { DataboardRowsSection } from "@/src/components/databoard/ClientDataHeader";
import { EquipmentRow } from "@/src/components/databoard/rows/EquipmentRow";

export default async function EquipmentPage() {
    const result = await getEquipments();

    if (!result.success) {
        return <div>Error loading equipments: {result.error}</div>;
    }

    return (
        <div>
            <DataboardRowsSection entityId="equipment" data={result.data} rowComponent={EquipmentRow} />
        </div>
    );
}
