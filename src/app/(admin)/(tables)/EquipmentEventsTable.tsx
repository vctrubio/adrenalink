"use client";

import { useMemo } from "react";
import { Clock, ShieldCheck, Check, Activity } from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { TransactionEventData } from "@/types/transaction-event";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import { MasterTable, type GroupingType, type ColumnDef, type MobileColumnDef, type GroupStats } from "./MasterTable";
import { useTableLogic } from "@/src/hooks/useTableLogic";
import { TableGroupHeader, TableMobileGroupHeader } from "@/src/components/tables/TableGroupHeader";
import { StatItemUI } from "@/backend/data/StatsData";
import { filterTransactionEvents } from "@/types/searching-entities";
import { EquipmentDisplay } from "./equipments/EquipmentsTable";
import { filterByStatus } from "@/src/components/PackageEquipmentFilters";
import { LeaderStudent } from "@/src/components/LeaderStudent";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";

const HEADER_CLASSES = {
    purple: "px-2 py-3 font-medium text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10",
    blue: "px-2 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    green: "px-2 py-3 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10",
    orange: "px-2 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10",
    zinc: "px-2 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
} as const;

export function EquipmentEventsTable({
    events = [],
    groupBy = "all",
}: {
    events: TransactionEventData[];
    groupBy?: GroupingType;
}) {
    const {
        filteredRows: filteredEvents,
        masterTableGroupBy,
        getGroupKey,
    } = useTableLogic({
        data: events,
        filterSearch: filterTransactionEvents,
        filterStatus: filterByStatus,
        dateField: (row) => row.event.date,
    });

    const calculateStats = (groupRows: TransactionEventData[]): GroupStats => {
        const stats = groupRows.reduce(
            (acc, curr) => ({
                eventCount: acc.eventCount + 1,
                totalDuration: acc.totalDuration + curr.event.duration,
                equipmentCount: acc.equipmentCount + (curr.equipments?.length || 0),
                studentCount: acc.studentCount + (curr.booking?.students?.length || 0),
            }),
            { eventCount: 0, totalDuration: 0, equipmentCount: 0, studentCount: 0 },
        );
        return stats;
    };

    const GroupHeaderStats = ({ stats, hideLabel = false }: { stats: GroupStats; hideLabel?: boolean }) => (
        <>
            <StatItemUI type="events" value={stats.eventCount} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="duration" value={stats.totalDuration} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="equipment" value={stats.equipmentCount} hideLabel={hideLabel} labelOverride="Items Used" iconColor={false} />
            <StatItemUI type="students" value={stats.studentCount} hideLabel={hideLabel} iconColor={false} />
        </>
    );

    const desktopColumns: ColumnDef<TransactionEventData>[] = useMemo(
        () => [
            {
                header: "Time",
                headerClassName: HEADER_CLASSES.zinc,
                className: "w-[120px]",
                render: (data) => {
                    const date = new Date(data.event.date);
                    return (
                        <div className="flex flex-col">
                            <span className="font-bold text-foreground">
                                {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                                {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                },
            },
            {
                header: "Equipment Used",
                headerClassName: HEADER_CLASSES.purple,
                render: (data) => (
                    <div className="flex flex-wrap gap-3">
                        {data.equipments && data.equipments.length > 0 ? (
                            data.equipments.map((eq) => (
                                <EquipmentDisplay
                                    key={eq.id}
                                    equipment={{
                                        ...eq,
                                        category: data.packageData.categoryEquipment,
                                    }}
                                    variant="compact"
                                    iconSize={12}
                                />
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground italic opacity-50">No gear assigned</span>
                        )}
                    </div>
                ),
            },
            {
                header: "Category",
                headerClassName: HEADER_CLASSES.purple,
                render: (data) => {
                    const config = EQUIPMENT_CATEGORIES.find(c => c.id === data.packageData.categoryEquipment?.toLowerCase());
                    const Icon = config?.icon || ShieldCheck;
                    return (
                        <div className="flex items-center gap-2">
                            <div style={{ color: config?.color }}>
                                <Icon size={14} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-tight text-foreground">
                                {config?.name || data.packageData.categoryEquipment}
                            </span>
                        </div>
                    );
                },
            },
            {
                header: "Activity",
                headerClassName: HEADER_CLASSES.blue,
                render: (data) => (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5" title="Duration">
                            <Clock size={12} className="text-blue-500" />
                            <span className="text-xs font-bold text-foreground tabular-nums">
                                {getHMDuration(data.event.duration)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Instructor">
                            <HeadsetIcon size={12} className="text-[#22c55e]" />
                            <span className="text-xs font-bold text-foreground">
                                {data.teacher.username}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                header: "Context",
                headerClassName: HEADER_CLASSES.orange,
                render: (data) => (
                    <div className="flex flex-col gap-1">
                        <LeaderStudent
                            leaderStudentName={data.booking?.leaderStudentName || "N/A"}
                            bookingId={data.booking?.id || ""}
                            bookingStudents={data.booking?.students || []}
                            variant="minimal"
                        />
                        <span className="text-[9px] font-bold text-orange-600/70 uppercase truncate max-w-[120px]">
                            {data.packageData.description}
                        </span>
                    </div>
                ),
            },
            {
                header: "Revenue",
                headerClassName: HEADER_CLASSES.zinc,
                className: "text-right font-bold",
                render: (data) => (
                    <span className="tabular-nums text-foreground">
                        {getCompactNumber(data.financials.studentRevenue)}
                    </span>
                ),
            },
        ],
        [],
    );

    const mobileColumns: MobileColumnDef<TransactionEventData>[] = useMemo(
        () => [
            {
                label: "Usage",
                render: (data) => (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-foreground">
                                {new Date(data.event.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                {getHMDuration(data.event.duration)}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {data.equipments?.slice(0, 2).map(eq => (
                                <span key={eq.id} className="text-[9px] bg-muted px-1 rounded font-bold">
                                    {eq.brand} {eq.model}
                                </span>
                            ))}
                            {(data.equipments?.length || 0) > 2 && (
                                <span className="text-[9px] text-muted-foreground">+{data.equipments!.length - 2} more</span>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                label: "Instructor",
                render: (data) => (
                    <div className="flex items-center gap-1.5">
                        <HeadsetIcon size={12} className="text-[#22c55e]" />
                        <span className="text-xs font-bold">{data.teacher.username}</span>
                    </div>
                ),
            },
            {
                label: "Rev.",
                render: (data) => (
                    <span className="text-xs font-black tabular-nums">
                        {getCompactNumber(data.financials.studentRevenue)}
                    </span>
                ),
            },
        ],
        [],
    );

    return (
        <MasterTable
            rows={filteredEvents}
            columns={desktopColumns}
            mobileColumns={mobileColumns}
            groupBy={masterTableGroupBy}
            getGroupKey={getGroupKey}
            calculateStats={calculateStats}
            renderGroupHeader={(title, stats, groupBy) => (
                <TableGroupHeader title={title} stats={stats} groupBy={groupBy}>
                    <GroupHeaderStats stats={stats} />
                </TableGroupHeader>
            )}
            renderMobileGroupHeader={(title, stats, groupBy) => (
                <TableMobileGroupHeader title={title} stats={stats} groupBy={groupBy}>
                    <GroupHeaderStats stats={stats} hideLabel />
                </TableMobileGroupHeader>
            )}
            showGroupToggle={false}
            populateType="event"
        />
    );
}
