"use client";

import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { MasterTable, type ColumnDef, type MobileColumnDef, type GroupStats, type GroupingType } from "../MasterTable";
import { EquipmentStatusLabel } from "@/src/components/labels/EquipmentStatusLabel";
import { getHMDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import type { EquipmentTableData } from "@/config/tables";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import RepairIcon from "@/public/appSvgs/RepairIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { Activity } from "lucide-react";

import { StatItemUI } from "@/backend/data/StatsData";
import { Calendar } from "lucide-react";
import { TeacherLessonStatsBadge } from "@/src/components/ui/badge/teacher-lesson-stats";

import { useTableLogic } from "@/src/hooks/useTableLogic";

const HEADER_CLASSES = {
    purple: "px-4 py-3 font-medium text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-yellow-900/10",
    green: "px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10",
    orange: "px-4 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10",
    red: "px-4 py-3 font-medium text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-900/10",
    zinc: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    center: "px-4 py-3 font-medium text-center",
} as const;

export function EquipmentsTable({ equipments = [] }: { equipments: EquipmentTableData[] }) {
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;

    const { filteredRows: filteredEquipment, masterTableGroupBy, getGroupKey } = useTableLogic({
        data: equipments,
        filterSearch: filterEquipment,
        filterStatus: (eq, status) => {
            const isActive = eq.status === "public" || eq.status === "rental";
            if (status === "Active") return isActive;
            if (status === "Inactive") return !isActive;
            return true;
        },
        dateField: "createdAt"
    });

    const calculateStats = (groupRows: EquipmentTableData[]): GroupStats => {
        return groupRows.reduce(
            (acc, curr) => ({
                equipmentCount: acc.equipmentCount + 1,
                totalRentals: acc.totalRentals + curr.rentalStats.count,
                totalRepairs: acc.totalRepairs + curr.repairStats.count,
                totalEvents: acc.totalEvents + curr.activityStats.eventCount,
            }),
            { equipmentCount: 0, totalRentals: 0, totalRepairs: 0, totalEvents: 0 },
        );
    };

    const GroupHeaderStats = ({ stats, hideLabel = false }: { stats: GroupStats; hideLabel?: boolean }) => (
        <>
            <StatItemUI type="equipment" value={stats.equipmentCount} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="events" value={stats.totalEvents} hideLabel={hideLabel} labelOverride="Lessons" iconColor={false} />
            <StatItemUI type="rentals" value={stats.totalRentals} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="repairs" value={stats.totalRepairs} hideLabel={hideLabel} iconColor={false} />
        </>
    );

    const renderGroupHeader = (title: string, stats: GroupStats, groupBy: GroupingType) => (
        <TableGroupHeader title={title} stats={stats} groupBy={groupBy}>
            <GroupHeaderStats stats={stats} />
        </TableGroupHeader>
    );

    const renderMobileGroupHeader = (title: string, stats: GroupStats, groupBy: GroupingType) => (
        <TableMobileGroupHeader title={title} stats={stats} groupBy={groupBy}>
            <GroupHeaderStats stats={stats} hideLabel />
        </TableMobileGroupHeader>
    );

    const desktopColumns: ColumnDef<EquipmentTableData>[] = [
        {
            header: "Equipment",
            headerClassName: HEADER_CLASSES.purple,
            render: (data) => {
                const config = EQUIPMENT_CATEGORIES.find((c) => c.id === data.category);
                const Icon = config?.icon || Activity;
                const color = config?.color || "#a855f7";

                return (
                    <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-2">
                            <div style={{ color }}>
                                <Icon size={16} />
                            </div>
                            <HoverToEntity entity={equipmentEntity} id={data.id}>
                                <span className="font-bold text-foreground">
                                    {data.brand} {data.model}
                                </span>
                            </HoverToEntity>
                            {data.size && <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-black text-[10px]">{data.size}</span>}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-6">
                            SKU: {data.sku} {data.color && `• ${data.color}`}
                        </div>
                    </div>
                );
            },
        },
        {
            header: "Activity",
            headerClassName: HEADER_CLASSES.zinc,
            render: (data) => (
                <div className="flex items-center gap-4 text-xs font-medium">
                    <StatItemUI type="events" value={data.activityStats.eventCount} iconColor={true} hideLabel={true} desc={`Total lessons using ${data.brand} ${data.model}`} />
                    <StatItemUI type="duration" value={data.activityStats.totalDurationMinutes} iconColor={true} hideLabel={true} desc={"Total operating hours for this gear"} />
                    <StatItemUI type="rentals" value={data.rentalStats.count} iconColor={true} hideLabel={true} desc={"Total student rentals"} />
                    <StatItemUI type="repairs" value={data.repairStats.count} iconColor={true} hideLabel={true} desc={"Total repair logs"} />
                </div>
            ),
        },
        {
            header: "Teachers",
            headerClassName: HEADER_CLASSES.green,
            render: (data) => (
                <div className="flex flex-row flex-wrap gap-1.5 w-full">
                    {data.assignedTeachers.map((teacher) => (
                        <div key={teacher.id} className="scale-90 origin-left">
                            <TeacherLessonStatsBadge teacherId={teacher.id} teacherUsername={teacher.username} eventCount={teacher.eventCount} durationMinutes={teacher.durationMinutes} />
                        </div>
                    ))}
                    {data.assignedTeachers.length === 0 && <span className="text-xs text-muted-foreground italic">-</span>}
                </div>
            ),
        },
        {
            header: "Status",
            headerClassName: HEADER_CLASSES.center,
            render: (data) => (
                <div className="flex justify-center">
                    <EquipmentStatusLabel equipmentId={data.id} status={data.status} />
                </div>
            ),
        },
    ];

    const mobileColumns: MobileColumnDef<EquipmentTableData>[] = [
        {
            label: "Equipment",
            headerClassName: HEADER_CLASSES.purple,
            render: (data) => {
                const config = EQUIPMENT_CATEGORIES.find((c) => c.id === data.category);
                const Icon = config?.icon || Activity;
                const color = config?.color || "#a855f7";

                return (
                    <div className="flex items-center gap-2">
                        <div style={{ color }}>
                            <Icon size={14} />
                        </div>
                        <HoverToEntity entity={equipmentEntity} id={data.id}>
                            <div className="font-bold text-sm leading-tight">
                                {data.brand} {data.model}
                            </div>
                        </HoverToEntity>
                        {data.size && <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-black text-[9px] whitespace-nowrap">{data.size}</span>}
                    </div>
                );
            },
        },
        {
            label: "Activity",
            headerClassName: HEADER_CLASSES.zinc,
            render: (data) => (
                <div className="flex flex-row flex-wrap gap-2 scale-90 origin-right justify-end max-w-[120px]">
                    <StatItemUI type="events" value={data.activityStats.eventCount} iconColor={true} hideLabel={true} />
                    <StatItemUI type="duration" value={data.activityStats.totalDurationMinutes} iconColor={true} hideLabel={true} />
                    <StatItemUI type="rentals" value={data.rentalStats.count} iconColor={true} hideLabel={true} />
                    <StatItemUI type="repairs" value={data.repairStats.count} iconColor={true} hideLabel={true} />
                </div>
            ),
        },
        {
            label: "Status",
            headerClassName: HEADER_CLASSES.center,
            render: (data) => <EquipmentStatusLabel equipmentId={data.id} status={data.status} />,
        },
    ];

    return (
        <MasterTable
            rows={filteredEquipment}
            columns={desktopColumns}
            mobileColumns={mobileColumns}
            groupBy={masterTableGroupBy}
            getGroupKey={getGroupKey}
            calculateStats={calculateStats}
            renderGroupHeader={renderGroupHeader}
            renderMobileGroupHeader={renderMobileGroupHeader}
            showGroupToggle={false}
        />
    );
}
