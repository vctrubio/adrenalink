"use client";

import { Row, type StatItem } from "@/src/components/ui/row";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { EquipmentTeacherTag } from "@/src/components/tags";
import { EquipmentRepairPopover } from "@/src/components/popover/EquipmentRepairPopover";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EquipmentStats, getEquipmentName, getEquipmentTeachers } from "@/getters/equipments-getter";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import { EQUIPMENT_STATUS_CONFIG, type EquipmentStatus } from "@/types/status";
import { updateEquipmentStatus } from "@/actions/equipments-action";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";
import type { EquipmentModel } from "@/backend/models";
import type { DropdownItemProps } from "@/src/components/ui/dropdown";

export function calculateEquipmentGroupStats(equipments: EquipmentModel[]): StatItem[] {
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

    const totalEvents = equipments.reduce((sum, equipment) => sum + EquipmentStats.getEventsCount(equipment), 0);
    const totalMinutes = equipments.reduce((sum, equipment) => sum + (equipment.stats?.total_duration_minutes || 0), 0);
    const totalRentals = equipments.reduce((sum, equipment) => sum + EquipmentStats.getRentalsCount(equipment), 0);

    const totalMoneyIn = equipments.reduce((sum, equipment) => sum + EquipmentStats.getMoneyIn(equipment), 0);
    const totalMoneyOut = equipments.reduce((sum, equipment) => sum + EquipmentStats.getMoneyOut(equipment), 0);
    const netRevenue = totalMoneyIn - totalMoneyOut;
    const bankColor = netRevenue >= 0 ? "#10b981" : "#ef4444";

    return [
        { icon: <EquipmentIcon className="w-5 h-5" />, value: equipments.length, color: equipmentEntity.color },
        { icon: <FlagIcon className="w-5 h-5" />, value: totalEvents, color: eventEntity.color },
        { icon: <DurationIcon className="w-5 h-5" />, value: getPrettyDuration(totalMinutes), color: "#4b5563" },
        { icon: <HelmetIcon className="w-5 h-5" />, value: totalRentals, color: "#ef4444" },
        { icon: <BankIcon className="w-5 h-5" />, value: Math.abs(Math.round(netRevenue)), color: bankColor },
    ];
}

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
}

function validateActivity(fromStatus: EquipmentStatus, toStatus: EquipmentStatus): boolean {
    console.log(`checking validation for status update ${fromStatus} to ${toStatus}`);
    return true;
}

export const EquipmentRow = ({ item: equipment, isExpanded, onToggle }: EquipmentRowProps) => {
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

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

    const revenue = EquipmentStats.getRevenue(equipment);
    const bankColor = revenue >= 0 ? "#10b981" : "#ef4444";

    const stats: StatItem[] = [
        { icon: <FlagIcon className="w-5 h-5" />, value: EquipmentStats.getEventsCount(equipment), color: eventEntity.color },
        { icon: <DurationIcon className="w-5 h-5" />, value: getPrettyDuration(equipment.stats?.total_duration_minutes || 0), color: "#4b5563" },
        { icon: <HelmetIcon className="w-5 h-5" />, value: EquipmentStats.getRentalsCount(equipment), color: "#ef4444" },
        { icon: <BankIcon className="w-5 h-5" />, value: Math.abs(Math.round(revenue)), color: bankColor },
    ];

    return (
        <Row
            id={equipment.schema.id}
            entityData={equipment.schema}
            entityBgColor={equipmentEntity.bgColor}
            entityColor={equipmentEntity.color}
            isExpanded={isExpanded}
            onToggle={onToggle}
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
