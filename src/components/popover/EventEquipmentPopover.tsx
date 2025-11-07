"use client";

import { RowPopover, type PopoverItem } from "@/src/components/ui/row";
import { getTeacherUnfinishedEvents } from "@/getters/teachers-getter";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import type { TeacherModel } from "@/backend/models";

interface EventEquipmentPopoverProps {
    teacher: TeacherModel;
}

export const EventEquipmentPopover = ({ teacher }: EventEquipmentPopoverProps) => {
    const unfinishedEvents = getTeacherUnfinishedEvents(teacher);

    const popoverItems: PopoverItem[] = unfinishedEvents.map((event) => {
        const equipmentCategory = EQUIPMENT_CATEGORIES.find((cat) => cat.id === event.equipmentCategory);
        const EquipmentIcon = equipmentCategory?.icon;

        return {
            id: event.id,
            icon: EquipmentIcon ? <EquipmentIcon className="w-4 h-4" /> : <div className="w-4 h-4" />,
            color: equipmentCategory?.color || "#9ca3af",
            label: `Event: ${event.id.slice(0, 8)}`,
        };
    });

    return <RowPopover items={popoverItems} />;
};
