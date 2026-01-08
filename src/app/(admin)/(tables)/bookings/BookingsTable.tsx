"use client";

import { useState } from "react";
import { MasterTable, type ColumnDef, type MobileColumnDef, type GroupingType, type GroupStats } from "../MasterTable";
import { TeacherLessonStatsBadge } from "@/src/components/ui/badge/teacher-lesson-stats";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { getLeaderCapacity } from "@/getters/bookings-getter";
import { ENTITY_DATA } from "@/config/entities";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import type { BookingTableData } from "@/supabase/server/bookings";
import { getHMDuration } from "@/getters/duration-getter";
import { Calendar, TrendingUp, TrendingDown, Check } from "lucide-react";
import { StatItemUI } from "@/backend/data/StatsData";
import { BOOKING_STATUS_CONFIG, type BookingStatus } from "@/types/status";
import ReactCountryFlag from "react-country-flag";
import Link from "next/link";

import { TableGroupHeader, TableMobileGroupHeader } from "@/src/components/tables/TableGroupHeader";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";

import { filterBookings } from "@/types/searching-entities";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";

const HEADER_CLASSES = {
    yellow: "px-4 py-3 font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10",
    blue: "px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    green: "px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10",
    purple: "px-4 py-3 font-medium text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10",
    zinc: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    zincRight: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right",
} as const;

export function BookingsTable({ bookings = [] }: { bookings: BookingTableData[] }) {
    const { search, status, group } = useTablesController();
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;

    // Filter bookings by search AND status
    const filteredBookings = filterBookings(bookings, search).filter(booking => {
        if (status === "All") return true;
        if (status === "Active") return booking.booking.status === "active";
        if (status === "Inactive") return booking.booking.status !== "active";
        return true;
    });

    // Map controller group to MasterTable grouping
    const masterTableGroupBy: GroupingType = 
        group === "Weekly" ? "week" : 
        group === "Monthly" ? "month" :
        "all"; 

    const getGroupKey = (row: BookingTableData, groupBy: GroupingType) => {
        if (groupBy === "date") {
            return row.booking.dateStart; 
        } else if (groupBy === "week") {
            const date = new Date(row.booking.dateStart);
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            return `${date.getFullYear()}-W${weekNum}`;
        } else if (groupBy === "month") {
            const date = new Date(row.booking.dateStart);
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        }
        return "";
    };

    const calculateStats = (groupRows: BookingTableData[]): GroupStats => {
        return groupRows.reduce(
            (acc, curr) => {
                const bookingEvents = curr.stats.events.count;
                const bookingDuration = curr.stats.events.duration * 60; // back to minutes for accumulation

                const studentPayments = curr.stats.payments.student;
                const teacherPayments = curr.stats.payments.teacher;
                const teacherCommissions = curr.stats.commissions;
                const revenue = curr.stats.events.revenue;
                const balance = curr.stats.balance;

                const newStats = {
                    eventCount: acc.eventCount + 1,
                    studentCount: acc.studentCount + curr.package.capacityStudents,
                    totalDuration: acc.totalDuration + bookingDuration,
                    totalEventRevenue: (acc.totalEventRevenue || 0) + revenue,
                    totalStudentPayments: acc.totalStudentPayments + studentPayments,
                    totalTeacherPayments: acc.totalTeacherPayments + teacherPayments,
                    totalTeacherCommissions: acc.totalTeacherCommissions + teacherCommissions,
                    totalProfit: acc.totalProfit + balance,
                    completedCount: acc.completedCount + bookingEvents,
                    categoryStats: { ...acc.categoryStats }
                };

                // Aggregate category stats
                const cat = curr.package.categoryEquipment;
                if (!newStats.categoryStats[cat]) {
                    newStats.categoryStats[cat] = { count: 0 };
                }
                newStats.categoryStats[cat].count += bookingEvents;

                return newStats;
            },
            { totalDuration: 0, eventCount: 0, completedCount: 0, studentCount: 0, totalEventRevenue: 0, totalStudentPayments: 0, totalTeacherPayments: 0, totalTeacherCommissions: 0, totalProfit: 0, categoryStats: {} as Record<string, { count: number }> },
        );
    };

    const GroupHeaderStats = ({ stats, hideLabel = false }: { stats: GroupStats; hideLabel?: boolean }) => (
        <>
            <StatItemUI type="bookings" value={stats.eventCount} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="students" value={stats.studentCount} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="events" value={stats.completedCount} hideLabel={hideLabel} iconColor={false} />
            
            {/* Category Breakdowns */}
            {!hideLabel && Object.entries(stats.categoryStats as Record<string, { count: number }>).map(([catId, stat]) => {
                const config = EQUIPMENT_CATEGORIES.find(c => c.id === catId);
                const Icon = config?.icon || Calendar; 
                
                return (
                    <div key={catId} className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity" title={`${config?.label || catId} Events`}>
                        <span className="text-muted-foreground"><Icon size={12} /></span>
                        <span className="tabular-nums text-xs font-bold text-foreground">{stat.count}</span>
                    </div>
                );
            })}

            <StatItemUI type="duration" value={getHMDuration(stats.totalDuration)} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="revenue" value={stats.totalEventRevenue.toFixed(0)} hideLabel={hideLabel} variant="primary" iconColor={false} />
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

    const desktopColumns: ColumnDef<BookingTableData>[] = [
        {
            header: "Start Date",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => {
                const start = new Date(data.booking.dateStart);
                const end = new Date(data.booking.dateEnd);
                const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                const formattedDate = start.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });

                return (
                    <div className="flex items-center gap-2">
                        <Link 
                            href={`/bookings/${data.booking.id}`}
                            className="text-blue-900/60 dark:text-blue-100/60 bg-blue-50/[0.03] dark:bg-blue-900/[0.02] hover:text-blue-600 transition-colors font-bold"
                        >
                            {formattedDate}
                        </Link>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-black text-[10px] whitespace-nowrap uppercase">
                            {diffDays === 0 ? "Single" : `+${diffDays}D`}
                        </span>
                    </div>
                );
            },
        },
        {
            header: "Students",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => getLeaderCapacity(data.booking.leaderStudentName, data.package.capacityStudents),
        },
        {
            header: "Package",
            headerClassName: HEADER_CLASSES.orange,
            render: (data) => (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-orange-900/80 dark:text-orange-100/80 italic truncate max-w-[200px]">{data.package.description}</span>
                    <EquipmentStudentPackagePriceBadge
                        categoryEquipment={data.package.categoryEquipment}
                        equipmentCapacity={data.package.capacityEquipment}
                        studentCapacity={data.package.capacityStudents}
                        packageDurationHours={data.package.durationMinutes / 60}
                        pricePerHour={data.package.durationMinutes > 0 ? data.package.pricePerStudent / (data.package.durationMinutes / 60) : 0}
                    />
                </div>
            ),
        },
        {
            header: "Teachers",
            headerClassName: HEADER_CLASSES.green,
            render: (data) => (
                <div className="flex flex-wrap gap-2">
                    {data.lessons.map((lesson) => (
                        <TeacherLessonStatsBadge
                            key={lesson.id}
                            teacherId={lesson.teacherId}
                            teacherUsername={lesson.teacherUsername}
                            eventCount={lesson.events.totalCount}
                            durationMinutes={lesson.events.totalDuration}
                            showCommission={true}
                            commission={lesson.commission}
                            currency={data.currency}
                        />
                    ))}
                </div>
            ),
        },
        {
            header: "Financials",
            headerClassName: HEADER_CLASSES.zinc,
            render: (data) => {
                const balance = data.stats.balance;
                return (
                    <div className="flex items-center gap-4">
                        <StatItemUI type="payments" value={data.stats.events.revenue.toFixed(0)} labelOverride="Revenue" iconColor={true} hideLabel={true} desc={`Revenue for ${data.booking.leaderStudentName}`} />
                        <StatItemUI type="commission" value={data.stats.commissions.toFixed(0)} iconColor={true} hideLabel={true} desc="Teacher Commissions" />
                        <StatItemUI type={balance >= 0 ? "profit" : "loss"} value={Math.abs(balance).toFixed(0)} iconColor={true} hideLabel={true} desc={balance >= 0 ? "Total Profit" : "Total Deficit"} />
                    </div>
                );
            },
        },
        {
            header: "Status",
            headerClassName: "px-4 py-3 font-medium text-center",
            render: (data) => {
                const statusConfig = BOOKING_STATUS_CONFIG[data.booking.status as BookingStatus];
                return statusConfig ? (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter" style={{ backgroundColor: `${statusConfig.color}15`, color: statusConfig.color }}>
                        {data.booking.status === "completed" && <Check size={10} strokeWidth={4} />}
                        {statusConfig.label}
                    </div>
                ) : null;
            },
        },
    ];

    const mobileColumns: MobileColumnDef<BookingTableData>[] = [
        {
            label: "Booking",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => {
                const start = new Date(data.booking.dateStart);
                const end = new Date(data.booking.dateEnd);
                const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                const formattedDate = start.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });

                return (
                    <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-2">
                            <Link 
                                href={`/bookings/${data.booking.id}`} 
                                className="text-blue-900/60 dark:text-blue-100/60 bg-blue-50/[0.03] dark:bg-blue-900/[0.02] font-bold"
                            >
                                {formattedDate}
                            </Link>
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-black text-[8px] whitespace-nowrap uppercase">
                                {diffDays === 0 ? "Single" : `+${diffDays}D`}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-black uppercase">
                            <span>{getLeaderCapacity(data.booking.leaderStudentName, data.package.capacityStudents)}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            label: "Teachers",
            headerClassName: HEADER_CLASSES.green,
            render: (data) => (
                <div className="flex flex-col gap-1.5">
                    {data.lessons.map((lesson) => (
                        <div key={lesson.id} className="scale-90 origin-left">
                            <TeacherLessonStatsBadge teacherId={lesson.teacherId} teacherUsername={lesson.teacherUsername} eventCount={lesson.events.totalCount} durationMinutes={lesson.events.totalDuration} />
                        </div>
                    ))}
                </div>
            ),
        },
        {
            label: "Financials",
            headerClassName: HEADER_CLASSES.zinc,
            render: (data) => {
                const balance = data.stats.balance;
                return (
                    <div className="flex flex-col gap-1 scale-90 origin-right items-end">
                        <StatItemUI type="payments" value={data.stats.events.revenue.toFixed(0)} labelOverride="Revenue" iconColor={true} hideLabel={true} desc={`Revenue for ${data.booking.leaderStudentName}`} />
                        <StatItemUI type="commission" value={data.stats.commissions.toFixed(0)} iconColor={true} hideLabel={true} desc="Teacher Commissions" />
                        <StatItemUI type={balance >= 0 ? "profit" : "loss"} value={Math.abs(balance).toFixed(0)} iconColor={true} hideLabel={true} desc={balance >= 0 ? "Total Profit" : "Total Deficit"} />
                    </div>
                );
            },
        },
    ];

    return (
        <MasterTable 
            rows={filteredBookings} 
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