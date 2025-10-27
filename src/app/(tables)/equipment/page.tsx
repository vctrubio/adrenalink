import { EntityCard } from "@/src/components/cards/EntityCard";

function ExportEquipmentAvailable() {
    //redner categoreis, kite wing and windsurf.
    return <>hello 3 equipemnt </>;
}
export default function EquipmentPage() {
    return (
        <>
            <div className="p-8">
                <EntityCard entityId="equipment" />
            </div>
            <ExportEquipmentAvailable />
        </>
    );
}
