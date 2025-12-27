"use client";

import { Row } from "@/src/components/ui/row";
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
import type { EquipmentModel } from "@/backend/models";
import type { DropdownItemProps } from "@/src/components/ui/dropdown";
import type { TableRenderers } from "../DataboardTableSection";
import { RowHead } from "@/src/components/ui/row/row-head";
import { RowStr } from "@/src/components/ui/row/row-str";

export const calculateEquipmentGroupStats = DataboardEquipmentStats.getStats;

const EquipmentAction = ({ equipment }: { equipment: EquipmentModel }) => {
    const teachers = getEquipmentTeachers(equipment);

    return (
        <div className="flex flex-wrap gap-2">
            {teachers.map(({ teacher, totalHours }) => {
                const totalMinutes = totalHours * 60;
                const duration = getFullDuration(totalMinutes);

                return <EquipmentTeacherTag key={teacher.id} icon={<HeadsetIcon className="w-3 h-3" />} username={teacher.username} hours={totalHours} link={`/teachers/${teacher.id}`} duration={duration} />;
            })}
        </div>
    );
};

function validateActivity(fromStatus: EquipmentStatus, toStatus: EquipmentStatus): boolean {
    console.log(`checking validation for status update ${fromStatus} to ${toStatus}`);
    return true;
}

export const equipmentRenderers: TableRenderers<EquipmentModel> = {
    renderEntity: (equipment) => {
        const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;
        const equipmentName = getEquipmentName(equipment);
        const category = EQUIPMENT_CATEGORIES.find((c) => c.id === equipment.schema.category);
        const CategoryIcon = category?.icon;
        
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

        return (
            <RowHead
                avatar={<div style={{ color: equipmentEntity.color }}>{CategoryIcon ? <CategoryIcon className="w-8 h-8" /> : <div className="w-8 h-8" />}</div>}
                name={equipmentName}
                status={currentStatusConfig.label}
                dropdownItems={statusDropdownItems}
                statusColor={currentStatusConfig.color}
            />
        );
    },
    renderStr: (equipment) => {
        const teachers = getEquipmentTeachers(equipment);
        const teacherUsernames = teachers.map(({ teacher }) => teacher.username);
        const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;

        return (
            <RowStr
                label={equipment.schema.color || "N/A"}
                items={[
                    {
                        label: "Teachers",
                        value: (
                            <div className="flex flex-col text-xs">
                                {teacherUsernames.length > 0 ? (
                                    teacherUsernames.map((username, index) => <span key={index}>{username}</span>)
                                ) : (
                                    <span>No teachers</span>
                                )}
                            </div>
                        )
                    }
                ]}
                entityColor={equipmentEntity.color}
            />
        );
    },
    renderAction: (equipment) => <EquipmentAction equipment={equipment} />,
    renderStats: (equipment) => DataboardEquipmentStats.getStats(equipment, false),
    renderColor: (equipment) => equipment.schema.color || ENTITY_DATA.find((e) => e.id === "equipment")?.color || "#a855f7",
};

interface EquipmentRowProps {
    item: EquipmentModel;
}

export const EquipmentRow = ({ item: equipment }: EquipmentRowProps) => {
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;

    const equipmentName = getEquipmentName(equipment);
    const category = EQUIPMENT_CATEGORIES.find((c) => c.id === equipment.schema.category);
    const CategoryIcon = category?.icon;
    const isActive = equipment.schema.status === "available" || equipment.schema.status === "in-use";
    const iconColor = isActive ? equipmentEntity.color : "#9ca3af";

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

    const teachers = getEquipmentTeachers(equipment);
    const teacherUsernames = teachers.map(({ teacher }) => teacher.username);

    const strItems = [
        {
            label: "Teachers",
            value: (
                <div className="flex flex-col">
                    {teacherUsernames.length > 0 ? (
                        teacherUsernames.map((username, index) => <span key={index}>{username}</span>)
                    ) : (
                        <span>No teachers</span>
                    )}
                </div>
            ),
        },
    ];

    const stats = DataboardEquipmentStats.getStats(equipment, false);

    return (
        <Row
            id={equipment.schema.id}
            entityData={equipment.schema}
            entityBgColor={equipmentEntity.bgColor}
            entityColor={equipmentEntity.color}
            isActive={isActive}
            head={{
                avatar: <div style={{ color: iconColor }}>{CategoryIcon ? <CategoryIcon className="w-10 h-10" /> : <div className="w-10 h-10" />}</div>,
                name: equipmentName,
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
