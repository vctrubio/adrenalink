"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Check, TrendingUp, TrendingDown } from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { TeacherUsernameCommissionBadge } from "@/src/components/ui/badge/teacher-username-commission";
import { EVENT_STATUS_CONFIG, type EventStatus } from "@/types/status";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { TransactionEventData } from "@/types/transaction-event";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import { getLeaderCapacity } from "@/getters/bookings-getter";
import { MasterTable, type GroupingType, type ColumnDef, type MobileColumnDef, type GroupStats } from "./MasterTable";

import { filterTransactionEvents } from "@/types/searching-entities";
import { useTableLogic } from "@/src/hooks/useTableLogic";
import { TableGroupHeader, TableMobileGroupHeader } from "@/src/components/tables/TableGroupHeader";
import { StatItemUI } from "@/backend/data/StatsData";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";
import { EquipmentFulfillmentCell } from "@/src/components/tables/EquipmentFulfillmentCell"; // Import the extracted component

// Header className groups for consistent styling across columns
const HEADER_CLASSES = {
    blue: "px-2 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    orange: "px-2 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10",
    zinc: "px-2 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    zincRight: "px-2 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right",
    zincRightBold: "px-2 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right font-bold",
    purple: "px-2 py-3 font-medium text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10",
} as const;

// --- Main component ---

export function TransactionEventsTable({
    events: initialEvents = [],
    groupBy,
    showYear = false,
    enableTableLogic = true, // New prop to control useTableLogic
}: {
    events: TransactionEventData[];
    groupBy?: GroupingType;
    showYear?: boolean;
    enableTableLogic?: boolean;
}) {
    const [events, setEvents] = useState(initialEvents);
    const { sort } = useTablesController();

    // Sync state when props change
    useEffect(() => {
        setEvents(initialEvents);
    }, [initialEvents]);

    const handleEquipmentUpdate = (eventId: string, equipment: any) => {
        setEvents((prev) =>
            prev.map((row) => {
                if (row.event.id === eventId) {
                    return {
                        ...row,
                        event: { ...row.event, status: "completed" },
                        equipments: [...(row.equipments || []), equipment],
                    };
                }
                return row;
            }),
        );
    };

    let displayedEvents: TransactionEventData[] = events;
    let masterTableGroupBy: GroupingType | undefined = groupBy;
    let getGroupKey: ((item: TransactionEventData) => string | undefined) | undefined = undefined;
    let showGroupToggle = false;

    if (enableTableLogic) {
        // Only use useTableLogic if enabled
        const {
            filteredRows,
            masterTableGroupBy: hookGroupBy,
            getGroupKey: hookGetGroupKey,
        } = useTableLogic({
            data: events,
            filterSearch: filterTransactionEvents,
            filterStatus: (item, status) => {
                if (status === "All") return true;
                return item.event.status.toLowerCase() === status.toLowerCase();
            },
            dateField: (row) => row.event.date,
        });
        displayedEvents = filteredRows;
        masterTableGroupBy = hookGroupBy;
        getGroupKey = hookGetGroupKey;
        showGroupToggle = true;
    } else {
        // If table logic is disabled, use initialEvents directly
        displayedEvents = initialEvents;
    }

    // Apply sorting (only if table logic is enabled, otherwise assume pre-sorted)
    const finalFilteredAndSortedEvents = useMemo(() => {
        if (!enableTableLogic || !sort.field) return displayedEvents; // Use displayedEvents here

        const sorted = [...displayedEvents].sort((a, b) => {
            // Sort displayedEvents
            let aValue: any;
            let bValue: any;

            if (sort.field === "date") {
                aValue = new Date(a.event.date).getTime();
                bValue = new Date(b.event.date).getTime();
            } else if (sort.field === "createdAt") {
                aValue = new Date(a.event.date).getTime();
                bValue = new Date(b.event.date).getTime();
            } else if (sort.field === "updatedAt") {
                aValue = new Date(a.event.date).getTime();
                bValue = new Date(b.event.date).getTime();
            } else {
                return 0;
            }

            if (aValue < bValue) return sort.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sort.direction === "asc" ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [displayedEvents, sort, enableTableLogic]); // Depend on displayedEvents

    const desktopColumns: ColumnDef<TransactionEventData>[] = useMemo(
        () => [
            {
                header: "Date",
                headerClassName: `${HEADER_CLASSES.blue} text-center`,
                className: "w-[100px] text-center",
                render: (data) => {
                    const [datePart] = data.event.date.split("T");
                    const [year, month, day] = datePart.split("-");
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const formattedDate = showYear
                        ? `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`
                        : `${months[parseInt(month) - 1]} ${parseInt(day)}`;

                    return (
                        <span className="text-blue-900/60 dark:text-blue-100/60 bg-blue-50/[0.03] dark:bg-blue-900/[0.02] text-center block">
                            {formattedDate}
                        </span>
                    );
                },
            },
            {
                header: "Time",
                headerClassName: HEADER_CLASSES.blue,
                className: "w-[50px]",
                render: (data) => {
                    const timeMatch = data.event.date.match(/T(\d{2}:\d{2})/);
                    const formattedTime = timeMatch ? timeMatch[1] : "--:--";

                    return (
                        <span className="text-blue-900/80 dark:text-blue-100/80 bg-blue-50/[0.03] dark:bg-blue-900/[0.02] font-medium">
                            {formattedTime}
                        </span>
                    );
                },
            },
            {
                header: "Dur",
                headerClassName: `${HEADER_CLASSES.blue} text-center`,
                className: "w-[60px] text-center",
                render: (data) => (
                    <span className="text-blue-900/80 dark:text-blue-100/80 bg-blue-50/[0.03] dark:bg-blue-900/[0.02] text-center block">
                        {getHMDuration(data.event.duration)}
                    </span>
                ),
            },
            {
                header: "Location",
                headerClassName: HEADER_CLASSES.blue,
                className: "w-[100px]",
                render: (data) => (
                    <span className="text-muted-foreground bg-blue-50/[0.03] dark:bg-blue-900/[0.02] text-xs">
                        {data.event.location || "-"}
                    </span>
                ),
            },
            {
                header: "Teacher",
                headerClassName: HEADER_CLASSES.blue,
                render: (data) => (
                    <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50/[0.03] dark:bg-blue-900/[0.02]">
                        {data.teacher.username}
                    </span>
                ),
            },
            {
                header: "Students",
                headerClassName: HEADER_CLASSES.blue,
                render: (data) => (
                    <span className="bg-blue-50/[0.03] dark:bg-blue-900/[0.02]">
                        {getLeaderCapacity(data.booking?.leaderStudentName || "N/A", data.booking?.students?.length || 0)}
                    </span>
                ),
            },
            {
                header: "Package",
                headerClassName: HEADER_CLASSES.orange,
                render: (data) => (
                    <span className="max-w-[150px] truncate text-orange-900/80 dark:text-orange-100/80 bg-orange-50/[0.03] dark:bg-orange-900/[0.02] font-medium italic">
                        {data.packageData.description}
                    </span>
                ),
            },
            {
                header: "PPH",
                headerClassName: HEADER_CLASSES.orange,
                render: (data) => {
                    const pricePerHour =
                        data.packageData.durationMinutes / 60 > 0
                            ? data.packageData.pricePerStudent / (data.packageData.durationMinutes / 60)
                            : 0;
                    return (
                        <span className="tabular-nums text-orange-900/80 dark:text-orange-100/80 bg-orange-50/[0.03] dark:bg-orange-900/[0.02] font-bold">
                            {getCompactNumber(pricePerHour)}{" "}
                            <span className="text-[10px] font-normal">{data.financials.currency}</span>
                        </span>
                    );
                },
            },
            {
                header: "Cap.",
                headerClassName: HEADER_CLASSES.orange,
                render: (data) => {
                    const EquipmentIcon = EQUIPMENT_CATEGORIES.find((c) => c.id === data.packageData.categoryEquipment)?.icon;
                    return EquipmentIcon ? (
                        <EquipmentStudentCapacityBadge
                            categoryIcon={EquipmentIcon}
                            equipmentCapacity={data.packageData.capacityEquipment}
                            studentCapacity={data.packageData.capacityStudents}
                        />
                    ) : null;
                },
            },
            {
                header: "Equipment",
                headerClassName: HEADER_CLASSES.purple,
                render: (data) => (
                    <EquipmentFulfillmentCell
                        eventId={data.event.id}
                        equipments={data.equipments}
                        categoryId={data.packageData.categoryEquipment}
                        teacherId={data.teacher.id}
                        teacherUsername={data.teacher.username}
                        eventTime={data.event.date.split("T")[1].substring(0, 5)}
                        eventDuration={data.event.duration}
                        eventStatus={data.event.status}
                        onUpdate={handleEquipmentUpdate}
                    />
                ),
            },
            {
                header: "Comm.",
                headerClassName: HEADER_CLASSES.zinc,
                render: (data) => (
                    <span className="tabular-nums font-medium text-zinc-900/80 dark:text-zinc-100/80 bg-zinc-50/[0.03] dark:bg-zinc-900/[0.02]">
                        {getCompactNumber(data.financials.teacherEarnings)}
                    </span>
                ),
            },
            {
                header: "Rev.",
                headerClassName: HEADER_CLASSES.zinc,
                render: (data) => (
                    <span className="tabular-nums font-medium text-zinc-900/80 dark:text-zinc-100/80 bg-zinc-50/[0.03] dark:bg-zinc-900/[0.02]">
                        {getCompactNumber(data.financials.studentRevenue)}
                    </span>
                ),
            },
            {
                header: "Profit",
                headerClassName: HEADER_CLASSES.zincRightBold,
                render: (data) => {
                    const profit = data.financials.profit;
                    const isPositive = profit >= 0;
                    return (
                        <div className="flex items-center justify-end gap-1 bg-emerald-500/[0.02]">
                            {isPositive ? (
                                <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
                            ) : (
                                <TrendingDown size={14} className="text-rose-600 dark:text-rose-400" />
                            )}
                            <span
                                className={`text-right tabular-nums font-black ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                            >
                                {getCompactNumber(Math.abs(profit))}
                            </span>
                        </div>
                    );
                },
            },
            {
                header: "Status",
                headerClassName: "px-4 py-3 font-medium text-center",
                render: (data) => {
                    const statusConfig = EVENT_STATUS_CONFIG[data.event.status as EventStatus];
                    return statusConfig ? (
                        <div
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter"
                            style={{ backgroundColor: `${statusConfig.color}15`, color: statusConfig.color }}
                        >
                            {data.event.status === "completed" && <Check size={10} strokeWidth={4} />}
                            {statusConfig.label}
                        </div>
                    ) : null;
                },
            },
        ],
        [showYear, handleEquipmentUpdate],
    ); // Dependencies for useMemo

    const mobileColumns: MobileColumnDef<TransactionEventData>[] = useMemo(
        () => [
            {
                label: "Event",
                render: (data) => {
                    const [datePart, timePartFull] = data.event.date.split("T");
                    const [, month, day] = datePart.split("-");
                    const timePart = timePartFull.substring(0, 5);

                    return (
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-muted-foreground/60">
                                    {month}/{day}
                                </span>
                                <span className="text-sm font-black text-foreground">{timePart}</span>
                            </div>
                            <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">
                                +{getHMDuration(data.event.duration)}
                            </span>
                        </div>
                    );
                },
            },
            {
                label: "Teacher",
                render: (data) => (
                    <TeacherUsernameCommissionBadge
                        teacherIcon={HeadsetIcon}
                        teacherUsername={data.teacher.username}
                        teacherColor="#22c55e"
                        commissionValue={data.financials.commissionValue.toString()}
                        commissionType={data.financials.commissionType}
                        currency={data.financials.currency}
                        showCurrency={false}
                    />
                ),
            },
            {
                label: "Package",
                render: (data) => (
                    <div className="inline-flex scale-90 origin-center">
                        <EquipmentStudentPackagePriceBadge
                            categoryEquipment={data.packageData.categoryEquipment}
                            equipmentCapacity={data.packageData.capacityEquipment}
                            studentCapacity={data.packageData.capacityStudents}
                            packageDurationHours={data.packageData.durationMinutes / 60}
                            pricePerHour={data.packageData.pricePerStudent / (data.packageData.durationMinutes / 60)}
                        />
                    </div>
                ),
            },
            {
                label: "Profit",
                render: (data) => {
                    const statusConfig = EVENT_STATUS_CONFIG[data.event.status as EventStatus];
                    return statusConfig ? (
                        <div
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black uppercase tracking-tighter"
                            style={{ backgroundColor: `${statusConfig.color}15`, color: statusConfig.color }}
                        >
                            {data.financials.profit >= 0 ? (
                                <TrendingUp size={12} strokeWidth={4} className="shrink-0" />
                            ) : (
                                <TrendingDown size={12} strokeWidth={4} className="shrink-0" />
                            )}
                            {getCompactNumber(Math.abs(data.financials.profit))}
                        </div>
                    ) : null;
                },
            },
        ],
        [handleEquipmentUpdate],
    ); // Dependencies for useMemo

    const calculateStats = useCallback((groupRows: TransactionEventData[]) => {
        return groupRows.reduce(
            (acc, curr) => ({
                totalDuration: acc.totalDuration + curr.event.duration,
                eventCount: acc.eventCount + 1,
                completedCount: acc.completedCount + (curr.event.status === "completed" ? 1 : 0),
                studentCount: acc.studentCount + (curr.booking?.students?.length || 0),
                totalCommissions: acc.totalCommissions + curr.financials.teacherEarnings,
                totalRevenue: acc.totalRevenue + curr.financials.studentRevenue,
                totalProfit: acc.totalProfit + curr.financials.profit,
            }),
            {
                totalDuration: 0,
                eventCount: 0,
                completedCount: 0,
                studentCount: 0,
                totalCommissions: 0,
                totalRevenue: 0,
                totalProfit: 0,
            },
        );
    }, []);

    const GroupHeaderStats = useCallback(
        ({ stats, hideLabel = false }: { stats: GroupStats; hideLabel?: boolean }) => (
            <>
                <StatItemUI type="students" value={stats.studentCount} hideLabel={hideLabel} iconColor={false} />
                <StatItemUI
                    type="events"
                    value={hideLabel ? stats.eventCount : `${stats.completedCount}/${stats.eventCount}`}
                    hideLabel={hideLabel}
                    iconColor={false}
                />
                <StatItemUI type="duration" value={stats.totalDuration} hideLabel={hideLabel} iconColor={false} />
                <StatItemUI type="commission" value={stats.totalCommissions} hideLabel={hideLabel} iconColor={false} />
                <StatItemUI type="revenue" value={stats.totalRevenue} hideLabel={hideLabel} iconColor={false} />
                <StatItemUI
                    type={stats.totalProfit >= 0 ? "profit" : "loss"}
                    value={Math.abs(stats.totalProfit)}
                    hideLabel={hideLabel}
                    variant="primary"
                    iconColor={false}
                />
            </>
        ),
        [],
    );

    const renderGroupHeader = useCallback(
        (title: string, stats: GroupStats, groupBy: GroupingType) => (
            <TableGroupHeader title={title} stats={stats} groupBy={groupBy}>
                <GroupHeaderStats stats={stats} />
            </TableGroupHeader>
        ),
        [GroupHeaderStats],
    );

    const renderMobileGroupHeader = useCallback(
        (title: string, stats: GroupStats, groupBy: GroupingType) => (
            <TableMobileGroupHeader title={title} stats={stats} groupBy={groupBy}>
                <GroupHeaderStats stats={stats} hideLabel />
            </TableMobileGroupHeader>
        ),
        [GroupHeaderStats],
    );

    if (finalFilteredAndSortedEvents.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                No transactions match your criteria.
            </div>
        );
    }

    return (
        <MasterTable
            rows={finalFilteredAndSortedEvents}
            columns={desktopColumns}
            mobileColumns={mobileColumns}
            getGroupKey={getGroupKey}
            calculateStats={calculateStats}
            renderGroupHeader={renderGroupHeader}
            renderMobileGroupHeader={renderMobileGroupHeader}
            groupBy={groupBy || masterTableGroupBy}
            showGroupToggle={showGroupToggle} // Use the new showGroupToggle variable
        />
    );
}
