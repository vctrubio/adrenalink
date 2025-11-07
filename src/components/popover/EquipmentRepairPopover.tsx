"use client";

import { RowPopover, type PopoverItem } from "@/src/components/ui/row";
import { ENTITY_DATA } from "@/config/entities";
import RepairIcon from "@/public/appSvgs/RepairIcon";
import type { EquipmentModel } from "@/backend/models";

interface EquipmentRepairPopoverProps {
    equipment: EquipmentModel;
}

export const EquipmentRepairPopover = ({ equipment }: EquipmentRepairPopoverProps) => {
    const repairs = equipment.relations?.equipmentRepairs || [];
    const repairEntity = ENTITY_DATA.find((e) => e.id === "repairs")!;

    // Only show repairs with no checkOut date (still in repair)
    const openRepairs = repairs.filter((repair) => !repair.checkOut);

    const popoverItems: PopoverItem[] = openRepairs.map((repair) => ({
        id: repair.id,
        icon: <RepairIcon className="w-4 h-4" />,
        color: repairEntity.color,
        label: `Repair: ${repair.description || "In Progress"}`,
    }));

    return <RowPopover items={popoverItems} />;
};
