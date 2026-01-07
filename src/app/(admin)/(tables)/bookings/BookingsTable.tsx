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

const HEADER_CLASSES = {
    yellow: "px-4 py-3 font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10",
    blue: "px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    green: "px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10",
    purple: "px-4 py-3 font-medium text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10",
    zinc: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    zincRight: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right",
} as const;

export function BookingsTable({ bookings = [] }: { bookings: BookingTableData[] }) {
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;

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
                            className="text-blue-900/60 dark:text-blue-100/60 bg-blue-50/[0.03] dark:bg-blue-900/[0.02] hover:text-blue-600 transition-colors"
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
                        <StatItemUI type="payments" value={data.stats.events.revenue.toFixed(0)} labelOverride="Revenue" iconColor={true} desc={`Revenue for ${data.booking.leaderStudentName}`} />
                        <StatItemUI type="commission" value={data.stats.commissions.toFixed(0)} iconColor={true} desc="Teacher Commissions" />
                        <StatItemUI type={balance >= 0 ? "profit" : "loss"} value={Math.abs(balance).toFixed(0)} iconColor={true} desc={balance >= 0 ? "Total Profit" : "Total Deficit"} />
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
                                className="text-blue-900/60 dark:text-blue-100/60 bg-blue-50/[0.03] dark:bg-blue-900/[0.02]"
                            >
                                {formattedDate}
                            </Link>
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded font-black text-[8px] whitespace-nowrap uppercase">
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
                        <StatItemUI type="payments" value={data.stats.events.revenue.toFixed(0)} labelOverride="Revenue" iconColor={true} desc={`Revenue for ${data.booking.leaderStudentName}`} />
                        <StatItemUI type="commission" value={data.stats.commissions.toFixed(0)} iconColor={true} desc="Teacher Commissions" />
                        <StatItemUI type={balance >= 0 ? "profit" : "loss"} value={Math.abs(balance).toFixed(0)} iconColor={true} desc={balance >= 0 ? "Total Profit" : "Total Deficit"} />
                    </div>
                );
            },
        },
    ];

    const getGroupKey = (row: BookingTableData, groupBy: GroupingType) => {
        if (groupBy === "date") {
            return row.booking.dateStart; // Group by start date
        } else if (groupBy === "week") {
            const date = new Date(row.booking.dateStart);
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            return `${date.getFullYear()}-W${weekNum}`;
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

                return {
                    eventCount: acc.eventCount + 1,
                    studentCount: acc.studentCount + curr.package.capacityStudents,
                    totalDuration: acc.totalDuration + bookingDuration,
                    totalEventRevenue: (acc.totalEventRevenue || 0) + revenue,
                    totalStudentPayments: acc.totalStudentPayments + studentPayments,
                    totalTeacherPayments: acc.totalTeacherPayments + teacherPayments,
                    totalTeacherCommissions: acc.totalTeacherCommissions + teacherCommissions,
                    totalProfit: acc.totalProfit + balance,
                    completedCount: acc.completedCount + bookingEvents,
                };
            },
            { totalDuration: 0, eventCount: 0, completedCount: 0, studentCount: 0, totalEventRevenue: 0, totalStudentPayments: 0, totalTeacherPayments: 0, totalTeacherCommissions: 0, totalProfit: 0 },
        );
    };

    const GroupHeaderStats = ({ stats, hideLabel = false }: { stats: GroupStats; hideLabel?: boolean }) => (
        <>
            <StatItemUI type="bookings" value={stats.eventCount} hideLabel={hideLabel} />
            <StatItemUI type="students" value={stats.studentCount} hideLabel={hideLabel} />
            <StatItemUI type="events" value={stats.completedCount} hideLabel={hideLabel} />
            <StatItemUI type="duration" value={stats.totalDuration} hideLabel={hideLabel} />

            <StatItemUI type="revenue" value={stats.totalEventRevenue.toFixed(0)} hideLabel={hideLabel} labelOverride="Revenue" />
            <StatItemUI type="commission" value={stats.totalTeacherCommissions.toFixed(0)} hideLabel={hideLabel} />
            <StatItemUI type="profit" value={stats.totalProfit.toFixed(0)} hideLabel={hideLabel} variant="profit" labelOverride="Profit" />
        </>
    );

    const renderGroupHeader = (title: string, stats: GroupStats, groupBy: GroupingType) => {
        const displayTitle = groupBy === "date" ? new Date(title).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short", year: "numeric" }) : groupBy === "week" ? `Week ${title.split("-W")[1]} of ${title.split("-W")[0]}` : title;

        return (
            <tr key={`header-${title}`} className="bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent border-y border-primary/10">
                <td colSpan={6} className="px-4 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <Calendar size={14} strokeWidth={2.5} />
                            </div>
                            <span className="text-sm font-black text-foreground uppercase tracking-tight">{displayTitle}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                            <GroupHeaderStats stats={stats} />
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    const renderMobileGroupHeader = (title: string, stats: GroupStats, groupBy: GroupingType) => {
        const displayTitle = groupBy === "date" ? new Date(title).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : groupBy === "week" ? `Week ${title.split("-W")[1]}` : title;

        return (
            <tr key={`mobile-header-${title}`} className="bg-primary/[0.03]">
                <td colSpan={3} className="px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-primary/10 text-primary">
                                <Calendar size={12} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-black text-foreground">{displayTitle}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <GroupHeaderStats stats={stats} hideLabel />
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    return <MasterTable rows={bookings} columns={desktopColumns} mobileColumns={mobileColumns} getGroupKey={getGroupKey} calculateStats={calculateStats} renderGroupHeader={renderGroupHeader} renderMobileGroupHeader={renderMobileGroupHeader} showGroupToggle={true} />;
}
