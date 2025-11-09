"use client";

import { Row, type StatItem } from "@/src/components/ui/row";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { EquipmentTeacherTag } from "@/src/components/tags";
import { EquipmentRepairPopover } from "@/src/components/popover/EquipmentRepairPopover";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EquipmentStats, getEquipmentName, getEquipmentTeachers, hasOpenRepair } from "@/getters/equipments-getter";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import type { EquipmentModel } from "@/backend/models";

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
    const hasRepair = hasOpenRepair(equipment);

    return (
        <div className="flex flex-wrap gap-2">
            {teachers.map(({ teacher, totalHours }) => (
                <EquipmentTeacherTag key={teacher.id} icon={<HeadsetIcon className="w-3 h-3" />} username={teacher.username} hours={totalHours} link={`/teachers/${teacher.username}`} />
            ))}
            {hasRepair && <div className="px-2 py-1 text-xs font-medium rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">In Repair</div>}
        </div>
    );
};

interface EquipmentRowProps {
    item: EquipmentModel;
    isExpanded: boolean;
    onToggle: (id: string) => void;
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
    const status = equipment.schema.status || "unknown";

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
            entityData={equipment}
            entityBgColor={equipmentEntity.bgColor}
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
                status: `Status: ${status}`,
            }}
            str={{
                label: "Details",
                items: strItems,
            }}
            action={<EquipmentAction equipment={equipment} />}
            popover={<EquipmentRepairPopover equipment={equipment} />}
            stats={stats}
        />
    );
};
