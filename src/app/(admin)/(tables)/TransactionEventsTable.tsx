"use client";

import { useState, useMemo } from "react";
import { Check, TrendingUp, TrendingDown, Calendar, Clock, Handshake, Receipt, Activity } from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { TeacherUsernameCommissionBadge } from "@/src/components/ui/badge/teacher-username-commission";
import { EVENT_STATUS_CONFIG, type EventStatus } from "@/types/status";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { TransactionEventData } from "@/types/transaction-event";
import { getHMDuration } from "@/getters/duration-getter";
import { getLeaderCapacity } from "@/getters/bookings-getter";
import { BrandSizeCategoryList } from "@/src/components/ui/badge/brand-size-category";
import { MasterTable, type GroupingType, type ColumnDef, type MobileColumnDef, type GroupStats } from "./MasterTable";

import { filterTransactionEvents } from "@/types/searching-entities";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";
import { StatItemUI } from "@/backend/data/StatsData";
import { BOOKING_STATUS_CONFIG } from "@/types/status";

import { TableGroupHeader, TableMobileGroupHeader } from "@/src/components/tables/TableGroupHeader";

// Header className groups for consistent styling across columns
const HEADER_CLASSES = {
    blue: "px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    orange: "px-4 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10",
    zinc: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    zincRight: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right",
    zincRightBold: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right font-bold",
    purple: "px-4 py-3 font-medium text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10",
} as const;

// --- Main component ---

export function TransactionEventsTable({ events = [] }: { events: TransactionEventData[] }) {
    const { search, group } = useTablesController();
    const filteredEvents = filterTransactionEvents(events, search);

    // Map controller group to MasterTable grouping
    const masterTableGroupBy: GroupingType = group === "Weekly" ? "week" : group === "Monthly" ? "month" : "all";

    const getGroupKey = (row: TransactionEventData, groupBy: GroupingType) => {
        const date = new Date(row.event.date);
        if (groupBy === "date") {
            return row.event.date.split("T")[0];
        } else if (groupBy === "week") {
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            return `${date.getFullYear()}-W${weekNum}`;
        } else if (groupBy === "month") {
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        }
        return "";
    };

    const desktopColumns: ColumnDef<TransactionEventData>[] = [
        {
            header: "Date",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => {
                const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
                return <span className="text-blue-900/60 dark:text-blue-100/60 bg-blue-50/[0.03] dark:bg-blue-900/[0.02]">{dateFormat.format(new Date(data.event.date))}</span>;
            },
        },
        {
            header: "Time",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => {
                const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
                return <span className="text-blue-900/80 dark:text-blue-100/80 bg-blue-50/[0.03] dark:bg-blue-900/[0.02] font-medium">{timeFormat.format(new Date(data.event.date))}</span>;
            },
        },
        {
            header: "Dur",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => <span className="text-blue-900/80 dark:text-blue-100/80 bg-blue-50/[0.03] dark:bg-blue-900/[0.02]">{(data.event.duration / 60).toFixed(1)}h</span>,
        },
        {
            header: "Loc",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => <span className="text-muted-foreground bg-blue-50/[0.03] dark:bg-blue-900/[0.02] text-xs">{data.event.location || "-"}</span>,
        },
        {
            header: "Teacher",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50/[0.03] dark:bg-blue-900/[0.02]">{data.teacher.username}</span>,
        },
        {
            header: "Students",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => <span className="bg-blue-50/[0.03] dark:bg-blue-900/[0.02]">{getLeaderCapacity(data.leaderStudentName, data.studentCount)}</span>,
        },
        {
            header: "Package",
            headerClassName: HEADER_CLASSES.orange,
            render: (data) => <span className="max-w-[150px] truncate text-orange-900/80 dark:text-orange-100/80 bg-orange-50/[0.03] dark:bg-orange-900/[0.02] font-medium italic">{data.packageData.description}</span>,
        },
        {
            header: "PPH",
            headerClassName: HEADER_CLASSES.orange,
            render: (data) => {
                const pricePerHour = data.packageData.durationMinutes / 60 > 0 ? data.packageData.pricePerStudent / (data.packageData.durationMinutes / 60) : 0;
                return (
                    <span className="tabular-nums text-orange-900/80 dark:text-orange-100/80 bg-orange-50/[0.03] dark:bg-orange-900/[0.02] font-bold">
                        {pricePerHour.toFixed(0)} <span className="text-[10px] font-normal">{data.financials.currency}</span>
                    </span>
                );
            },
        },
        {
            header: "Cap.",
            headerClassName: HEADER_CLASSES.orange,
            render: (data) => {
                const EquipmentIcon = EQUIPMENT_CATEGORIES.find((c) => c.id === data.packageData.categoryEquipment)?.icon;
                return EquipmentIcon ? <EquipmentStudentCapacityBadge categoryIcon={EquipmentIcon} equipmentCapacity={data.packageData.capacityEquipment} studentCapacity={data.packageData.capacityStudents} /> : null;
            },
        },
        {
            header: "Equipment",
            headerClassName: HEADER_CLASSES.purple,
            render: (data) => <BrandSizeCategoryList equipments={data.equipments} />,
        },
        {
            header: "Commission",
            headerClassName: HEADER_CLASSES.zincRight,
            render: (data) => <span className="text-right tabular-nums font-medium text-zinc-900/80 dark:text-zinc-100/80 bg-zinc-50/[0.03] dark:bg-zinc-900/[0.02]">{data.financials.teacherEarnings.toFixed(0)}</span>,
        },
        {
            header: "Revenue",
            headerClassName: HEADER_CLASSES.zincRight,
            render: (data) => <span className="text-right tabular-nums font-medium text-zinc-900/80 dark:text-zinc-100/80 bg-zinc-50/[0.03] dark:bg-zinc-900/[0.02]">{data.financials.studentRevenue.toFixed(0)}</span>,
        },
        {
            header: "Net",
            headerClassName: HEADER_CLASSES.zincRightBold,
            render: (data) => {
                const profit = data.financials.profit;
                const isPositive = profit >= 0;
                return (
                    <div className="flex items-center justify-end gap-1 bg-emerald-500/[0.02]">
                        {isPositive ? <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" /> : <TrendingDown size={14} className="text-rose-600 dark:text-rose-400" />}
                        <span className={`text-right tabular-nums font-black ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{Math.abs(profit).toFixed(0)}</span>
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
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter" style={{ backgroundColor: `${statusConfig.color}15`, color: statusConfig.color }}>
                        {data.event.status === "completed" && <Check size={10} strokeWidth={4} />}
                        {statusConfig.label}
                    </div>
                ) : null;
            },
        },
    ];

    const mobileColumns: MobileColumnDef<TransactionEventData>[] = [
        // ... (previous mobile columns)
        {
            label: "Profit",
            render: (data) => {
                const statusConfig = EVENT_STATUS_CONFIG[data.event.status as EventStatus];
                return statusConfig ? (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black uppercase tracking-tighter" style={{ backgroundColor: `${statusConfig.color}15`, color: statusConfig.color }}>
                        {data.financials.profit >= 0 ? <TrendingUp size={12} strokeWidth={4} className="shrink-0" /> : <TrendingDown size={12} strokeWidth={4} className="shrink-0" />}
                        {Math.abs(data.financials.profit).toFixed(0)}
                    </div>
                ) : null;
            },
        },
    ];

    const calculateStats = (groupRows: TransactionEventData[]) => {
        return groupRows.reduce(
            (acc, curr) => ({
                totalDuration: acc.totalDuration + curr.event.duration,
                eventCount: acc.eventCount + 1,
                completedCount: acc.completedCount + (curr.event.status === "completed" ? 1 : 0),
                studentCount: acc.studentCount + curr.studentCount,
                totalCommissions: acc.totalCommissions + curr.financials.teacherEarnings,
                totalRevenue: acc.totalRevenue + curr.financials.studentRevenue,
                totalProfit: acc.totalProfit + curr.financials.profit,
            }),
            { totalDuration: 0, eventCount: 0, completedCount: 0, studentCount: 0, totalCommissions: 0, totalRevenue: 0, totalProfit: 0 },
        );
    };

    const GroupHeaderStats = ({ stats, hideLabel = false }: { stats: GroupStats; hideLabel?: boolean }) => (
        <>
            <StatItemUI type="students" value={stats.studentCount} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="events" value={hideLabel ? stats.eventCount : `${stats.completedCount}/${stats.eventCount}`} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="duration" value={getHMDuration(stats.totalDuration)} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="commission" value={stats.totalCommissions.toFixed(0)} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="revenue" value={stats.totalRevenue.toFixed(0)} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type={stats.totalProfit >= 0 ? "profit" : "loss"} value={Math.abs(stats.totalProfit).toFixed(0)} hideLabel={hideLabel} variant="primary" iconColor={false} />
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

    return (
        <MasterTable
            rows={filteredEvents}
            columns={desktopColumns}
            mobileColumns={mobileColumns}
            getGroupKey={getGroupKey}
            calculateStats={calculateStats}
            renderGroupHeader={renderGroupHeader}
            renderMobileGroupHeader={renderMobileGroupHeader}
            groupBy={masterTableGroupBy}
            showGroupToggle={false}
        />
    );
}
