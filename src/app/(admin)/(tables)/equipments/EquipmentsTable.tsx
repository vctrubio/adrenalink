"use client";

import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { MasterTable, type ColumnDef, type MobileColumnDef, type GroupStats, type GroupingType } from "../MasterTable";
import { EquipmentStatusLabel } from "@/src/components/labels/EquipmentStatusLabel";
import { getHMDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import type { EquipmentTableData } from "@/supabase/server/equipments";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import RepairIcon from "@/public/appSvgs/RepairIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { Activity } from "lucide-react";

const HEADER_CLASSES = {
    purple: "px-4 py-3 font-medium text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10",
    green: "px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10",
    orange: "px-4 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10",
    red: "px-4 py-3 font-medium text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-900/10",
    zinc: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    center: "px-4 py-3 font-medium text-center",
} as const;

export function EquipmentsTable({ equipments = [] }: { equipments: EquipmentTableData[] }) {
    const equipmentEntity = ENTITY_DATA.find(e => e.id === "equipment")!;

    const desktopColumns: ColumnDef<EquipmentTableData>[] = [
        {
            header: "Equipment",
            headerClassName: HEADER_CLASSES.purple,
            render: (data) => {
                const config = EQUIPMENT_CATEGORIES.find(c => c.id === data.category);
                const Icon = config?.icon || Activity;
                const color = config?.color || "#a855f7";
                
                return (
                    <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-2">
                            <div style={{ color }}>
                                <Icon size={16} />
                            </div>
                            <HoverToEntity entity={equipmentEntity} id={data.id}>
                                <span className="font-bold text-foreground">{data.brand} {data.model}</span>
                            </HoverToEntity>
                            {data.size && (
                                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-black text-[10px]">
                                    {data.size}
                                </span>
                            )}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-6">
                            SKU: {data.sku} {data.color && `• ${data.color}`}
                        </div>
                    </div>
                );
            },
        },
        {
            header: "Repairs",
            headerClassName: HEADER_CLASSES.purple,
            render: (data) => (
                <div className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400">
                    <RepairIcon size={16} className="text-purple-600/40" />
                    <span>{data.repairStats.count}</span>
                </div>
            ),
        },
        {
            header: "Rentals",
            headerClassName: HEADER_CLASSES.red,
            render: (data) => (
                <div className="flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400">
                    <HelmetIcon size={16} className="text-rose-600/40" />
                    <span>{data.rentalStats.count}</span>
                </div>
            ),
        },
        {
            header: "Teachers",
            headerClassName: HEADER_CLASSES.green,
            render: (data) => (
                <div className="flex flex-col gap-1.5">
                    {data.assignedTeachers.map(teacher => (
                        <div key={teacher.id} className="flex items-center gap-2 text-xs font-medium">
                            <div className="flex items-center gap-1.5">
                                <HeadsetIcon size={14} className="text-emerald-600/60" />
                                <span className="text-foreground font-bold">{teacher.username}</span>
                            </div>
                            <div className="flex items-center gap-3 ml-2 border-l border-border/50 pl-2">
                                <div className="flex items-center gap-1 text-muted-foreground/70" title="Events">
                                    <FlagIcon size={12} />
                                    <span>{teacher.eventCount}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground/70" title="Duration">
                                    <DurationIcon size={12} />
                                    <span>{getHMDuration(teacher.durationMinutes)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {data.assignedTeachers.length === 0 && <span className="text-xs text-muted-foreground italic">-</span>}
                </div>
            ),
        },
        {
            header: "Usage",
            headerClassName: HEADER_CLASSES.zinc,
            render: (data) => (
                <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5" title="Total Events">
                        <FlagIcon size={14} className="text-zinc-600/60" />
                        <span>{data.activityStats.eventCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Total Duration">
                        <DurationIcon size={14} className="text-zinc-600/60" />
                        <span>{getHMDuration(data.activityStats.totalDurationMinutes)}</span>
                    </div>
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
            label: "Gear",
            render: (data) => {
                const config = EQUIPMENT_CATEGORIES.find(c => c.id === data.category);
                const Icon = config?.icon || Activity;
                const color = config?.color || "#a855f7";
                
                return (
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <div style={{ color }}>
                                <Icon size={14} />
                            </div>
                            <HoverToEntity entity={equipmentEntity} id={data.id}>
                                <div className="font-bold text-sm leading-tight">{data.brand} {data.model}</div>
                            </HoverToEntity>
                        </div>
                        {data.size && (
                            <div className="w-fit bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-black text-[9px]">
                                {data.size}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            label: "Rentals",
            render: (data) => (
                <div className="flex items-center gap-1 text-sm font-bold text-rose-600 dark:text-rose-400">
                    <HelmetIcon size={14} className="text-rose-600/40" />
                    <span>{data.rentalStats.count}</span>
                </div>
            ),
        },
        {
            label: "Activity",
            render: (data) => (
                <div className="flex flex-col gap-1 text-[10px] font-bold">
                    <div className="flex items-center gap-1">
                        <FlagIcon size={10} />
                        <span>{data.activityStats.eventCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <DurationIcon size={10} />
                        <span>{getHMDuration(data.activityStats.totalDurationMinutes)}</span>
                    </div>
                </div>
            ),
        },
        {
            label: "Status",
            render: (data) => <EquipmentStatusLabel equipmentId={data.id} status={data.status} />,
        },
    ];

    return (
        <MasterTable
            rows={equipments}
            columns={desktopColumns}
            mobileColumns={mobileColumns}
            groupBy="all"
            showGroupToggle={false}
        />
    );
}
