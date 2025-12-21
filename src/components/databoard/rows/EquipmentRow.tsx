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
import { EQUIPMENT_STATUS_CONFIG, type EquipmentStatus } from "@/types/status";
import { updateEquipmentStatus } from "@/actions/equipments-action";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import type { EquipmentModel } from "@/backend/models";
import type { DropdownItemProps } from "@/src/components/ui/dropdown";

export const calculateEquipmentGroupStats = DataboardEquipmentStats.getStats;

const EquipmentAction = ({ equipment }: { equipment: EquipmentModel }) => {
    const teachers = getEquipmentTeachers(equipment);

    return (
        <div className="flex flex-wrap gap-2">
            {teachers.map(({ teacher, totalHours }) => (
                <EquipmentTeacherTag key={teacher.id} icon={<HeadsetIcon className="w-3 h-3" />} username={teacher.username} hours={totalHours} link={`/teachers/${teacher.username}`} />
            ))}
        </div>
    );
};

interface EquipmentRowProps {
    item: EquipmentModel;
    isExpanded: boolean;
    onToggle: (id: string) => void;
    expandedContent?: React.ReactNode;
}

function validateActivity(fromStatus: EquipmentStatus, toStatus: EquipmentStatus): boolean {
    console.log(`checking validation for status update ${fromStatus} to ${toStatus}`);
    return true;
}

export const EquipmentRow = ({ item: equipment, isExpanded, onToggle, expandedContent }: EquipmentRowProps) => {
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;

    // Get category-specific icon
    const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === equipment.schema.category);
    const CategoryIcon = categoryConfig?.icon;
    const categoryColor = categoryConfig?.color || equipmentEntity.color;
    const iconColor = isExpanded ? categoryColor : "#9ca3af";

    const equipmentName = getEquipmentName(equipment);
    const currentStatus = equipment.schema.status as EquipmentStatus;
    const currentStatusConfig = EQUIPMENT_STATUS_CONFIG[currentStatus];

    const statusDropdownItems: DropdownItemProps[] = (["rental", "public", "selling", "sold", "inrepair", "rip"] as const).map((status) => ({
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
        { label: "SKU", value: equipment.schema.sku },
        { label: "Color", value: equipment.schema.color || "N/A" },
        { label: "Category", value: equipment.schema.category },
        { label: "Updated", value: formatDate(equipment.schema.updatedAt) },
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
            expandedContent={expandedContent}
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
