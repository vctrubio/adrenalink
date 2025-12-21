"use client";

import { Row } from "@/src/components/ui/row";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { ENTITY_DATA } from "@/config/entities";
import { EquipmentTeacherTag } from "@/src/components/tags";
import { EquipmentRepairPopover } from "@/src/components/popover/EquipmentRepairPopover";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { getEquipmentName, getEquipmentTeachers } from "@/getters/equipments-getter";
import { EquipmentStats as DataboardEquipmentStats } from "@/src/components/databoard/stats";
import { formatDate } from "@/getters/date-getter";
import { getFullDuration } from "@/getters/duration-getter";
import { EQUIPMENT_STATUS_CONFIG, type EquipmentStatus } from "@/types/status";
import { updateEquipmentStatus } from "@/actions/equipments-action";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { EquipmentDropdownRow } from "./EquipmentDropdownRow";
import type { EquipmentModel } from "@/backend/models";
import type { DropdownItemProps } from "@/src/components/ui/dropdown";

export const calculateEquipmentGroupStats = DataboardEquipmentStats.getStats;

const EquipmentAction = ({ equipment }: { equipment: EquipmentModel }) => {
    const teachers = getEquipmentTeachers(equipment);

    return (
        <div className="flex flex-wrap gap-2">
            {teachers.map(({ teacher, totalHours }) => {
                const totalMinutes = totalHours * 60;
                const duration = getFullDuration(totalMinutes);
                
                return (
                    <EquipmentTeacherTag 
                        key={teacher.id} 
                        icon={<HeadsetIcon className="w-3 h-3" />} 
                        username={teacher.username} 
                        hours={totalHours} 
                        link={`/teachers/${teacher.username}`}
                        duration={duration}
                    />
                );
            })}
        </div>
    );
};

interface EquipmentRowProps {
    item: EquipmentModel;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

function validateActivity(fromStatus: EquipmentStatus, toStatus: EquipmentStatus): boolean {
    console.log(`checking validation for status update ${fromStatus} to ${toStatus}`);
    return true;
}

export const EquipmentRow = ({ item: equipment, isExpanded, onToggle }: EquipmentRowProps) => {
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;

    const equipmentName = getEquipmentName(equipment);
    const category = EQUIPMENT_CATEGORIES.find((c) => c.id === equipment.schema.category);
    const CategoryIcon = category?.icon;
    const iconColor = isExpanded ? equipmentEntity.color : "#9ca3af";

    const currentStatus = equipment.schema.status as EquipmentStatus;
    const currentStatusConfig = EQUIPMENT_STATUS_CONFIG[currentStatus];

    const statusDropdownItems: DropdownItemProps[] = (Object.keys(EQUIPMENT_STATUS_CONFIG) as EquipmentStatus[]).map((status) => ({
        id: status,
        label: EQUIPMENT_STATUS_CONFIG[status].label,
        icon: () => <div className="w-3 h-3 rounded-full" style={{ backgroundColor: EQUIPMENT_STATUS_CONFIG[status].color }} />,
        color: EQUIPMENT_STATUS_CONFIG[status].color,
        onClick: async () => {
            if (validateActivity(currentStatus, status)) {
                await updateEquipmentStatus(equipment.schema.id, status);
            }
        },
    }));

    const strItems = [
        { label: "Category", value: category?.label || "N/A" },
        { label: "Color", value: equipment.schema.color || "N/A" },
        { label: "Purchase Date", value: equipment.schema.purchaseDate ? formatDate(equipment.schema.purchaseDate) : "N/A" },
        { label: "Status", value: currentStatusConfig.label },
    ];

    const stats = DataboardEquipmentStats.getStats(equipment, false);

    return (
        <Row
            id={equipment.schema.id}
            entityData={equipment.schema}
            entityBgColor={equipmentEntity.bgColor}
            entityColor={equipmentEntity.color}
            isExpanded={isExpanded}
            onToggle={onToggle}
            expandedContent={<EquipmentDropdownRow item={equipment} />}
            head={{
                avatar: (
                    <div style={{ color: iconColor }}>
                        {CategoryIcon ? <CategoryIcon className="w-10 h-10" /> : <div className="w-10 h-10" />}
                    </div>
                ),
                name: (
                    <HoverToEntity entity={equipmentEntity} id={equipment.schema.id}>
                        {equipmentName}
                    </HoverToEntity>
                ),
                status: currentStatusConfig.label,
                dropdownItems: statusDropdownItems,
                statusColor: currentStatusConfig.color,
            }}
            str={{
                label: equipment.schema.color || "N/A",
                items: strItems,
            }}
            action={<EquipmentAction equipment={equipment} />}
            popover={<EquipmentRepairPopover equipment={equipment} />}
            stats={stats}
        />
    );
};
