import { getEquipments } from "@/actions/databoard-action";
import { InfoHeader } from "../InfoHeader";
import Link from "next/link";

export default async function EquipmentsPage() {
    const result = await getEquipments();

    if (!result.success) {
        return (
            <>
                <InfoHeader title="Equipments" />
                <div>Error loading equipments</div>
            </>
        );
    }

    const equipments = result.data;

    return (
        <>
            <InfoHeader title="Equipments" />
            <div className="flex flex-col gap-2">
                {equipments.map((equipment) => (
                    <Link
                        key={equipment.schema.id}
                        href={`/info/equipments/${equipment.schema.id}`}
                        className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                        <h3 className="font-semibold">{equipment.schema.model}</h3>
                    </Link>
                ))}
            </div>
        </>
    );
}
