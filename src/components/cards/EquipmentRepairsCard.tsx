"use client";

import { useState } from "react";
import type { EquipmentModel } from "@/backend/models";
import RepairIcon from "@/public/appSvgs/RepairIcon";
import { EntityActionList } from "@/src/components/cards/EntityActionList";
import AddEquipmentRepairModal from "@/src/components/modals/AddEquipmentRepairModal";

interface EquipmentRepairsCardProps {
    equipment: EquipmentModel;
    onRepairAdded?: () => void;
}

export const EquipmentRepairsCard = ({ equipment, onRepairAdded }: EquipmentRepairsCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const repairs = equipment.relations?.equipmentRepairs || [];

    return (
        <>
            <EntityActionList
                entityId={equipment.schema.id}
                entityType="Repairs"
                icon={RepairIcon}
                iconColor="#a855f7"
                accentColor="#a855f7"
                count={repairs.length}
                addButtonLabel="Add Repair"
                onAddClick={() => setIsModalOpen(true)}
                emptyMessage="No repairs recorded yet."
                items={
                    <div className="space-y-3">
                        {repairs.slice(0, 5).map((repair) => (
                            <div key={repair.id} className="border-l-2 border-red-500 pl-3">
                                <p className="text-sm font-medium text-foreground">{repair.description || "Repair"}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    ${repair.price || "0"} - {repair.checkOut ? "Completed" : "In Progress"}
                                </p>
                            </div>
                        ))}
                        {repairs.length > 5 && <p className="text-sm text-muted-foreground">+{repairs.length - 5} more repairs</p>}
                    </div>
                }
            />

            <AddEquipmentRepairModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                equipmentId={equipment.schema.id}
                onRepairAdded={onRepairAdded}
            />
        </>
    );
};
