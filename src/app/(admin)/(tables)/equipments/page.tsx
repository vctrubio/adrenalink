import { getEquipmentsTable } from "@/supabase/server/equipments";
import { EquipmentsTable } from "./EquipmentsTable";

export default async function EquipmentsMasterTablePage() {
    const equipments = await getEquipmentsTable();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Equipments Master Table</h1>
                <p className="text-muted-foreground">Monitor gear inventory, repair history, teacher assignments, and total usage.</p>
            </div>
            
            <EquipmentsTable equipments={equipments} />
        </div>
    );
}
