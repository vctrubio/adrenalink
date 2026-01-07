"use client";

import { useState } from "react";
import { MasterTable, type ColumnDef, type MobileColumnDef, type GroupingType, type GroupStats } from "../MasterTable";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { TeacherLessonStatsBadge } from "@/src/components/ui/badge/teacher-lesson-stats";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { getLeaderCapacity } from "@/getters/bookings-getter";
import type { BookingTableData } from "@/supabase/server/bookings";
import { getHMDuration } from "@/getters/duration-getter";
import { Calendar, TrendingUp, TrendingDown, Check } from "lucide-react";
import { StatHeaderItemUI } from "@/backend/RenderStats";
import { BOOKING_STATUS_CONFIG, type BookingStatus } from "@/types/status";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { StudentTeacherBookingLessonPaymentsBadge } from "@/src/components/ui/badge/student-teacher-booking-lesson-payments";

const HEADER_CLASSES = {
    blue: "px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    orange: "px-4 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10",
    green: "px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10",
    zinc: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    zincRight: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right",
} as const;

export function BookingsTable({ bookings = [] }: { bookings: BookingTableData[] }) {
    const desktopColumns: ColumnDef<BookingTableData>[] = [
        {
            header: "Date Range",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => <DateRangeBadge startDate={data.dateStart} endDate={data.dateEnd} />,
        },
        {
            header: "Students",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => getLeaderCapacity(data.leaderStudentName, data.capacityStudents),
        },
        {
            header: "Package",
            headerClassName: HEADER_CLASSES.orange,
            render: (data) => (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-orange-900/80 dark:text-orange-100/80 italic truncate max-w-[200px]">{data.packageName}</span>
                    <EquipmentStudentPackagePriceBadge 
                        categoryEquipment={data.packageDetails.categoryEquipment}
                        equipmentCapacity={data.packageDetails.capacityEquipment}
                        studentCapacity={data.capacityStudents}
                        packageDurationHours={data.packageDetails.durationMinutes / 60}
                        pricePerHour={data.packageDetails.durationMinutes > 0 ? data.packageDetails.pricePerStudent / (data.packageDetails.durationMinutes / 60) : 0}
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
                            eventCount={lesson.eventCount}
                            durationMinutes={lesson.totalDurationHours * 60}
                            showCommission={true}
                            commission={lesson.commission}
                            currency={data.currency}
                        />
                    ))}
                </div>
            ),
        },
        {
            header: "Payments",
            headerClassName: HEADER_CLASSES.zinc,
            render: (data) => (
                <div className="flex justify-start">
                    <StudentTeacherBookingLessonPaymentsBadge 
                        studentPayment={data.totalStudentPayments}
                        teacherPayment={data.totalTeacherPayments}
                        teacherCommission={data.totalTeacherCommissions}
                        currency={data.currency}
                    />
                </div>
            ),
        },
        {
            header: "Status",
            headerClassName: "px-4 py-3 font-medium text-center",
            render: (data) => {
                const statusConfig = BOOKING_STATUS_CONFIG[data.status as BookingStatus];
                return statusConfig ? (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter" style={{ backgroundColor: `${statusConfig.color}15`, color: statusConfig.color }}>
                        {data.status === "completed" && <Check size={10} strokeWidth={4} />}
                        {statusConfig.label}
                    </div>
                ) : null;
            },
        },
    ];

    const mobileColumns: MobileColumnDef<BookingTableData>[] = [
        {
            label: "Booking",
            render: (data) => (
                <div className="flex flex-col gap-2">
                    <DateRangeBadge startDate={data.dateStart} endDate={data.dateEnd} />
                    <div className="flex items-center gap-2">
                        {getLeaderCapacity(data.leaderStudentName, data.capacityStudents)}
                    </div>
                    <div className="scale-90 origin-left">
                                            <EquipmentStudentPackagePriceBadge 
                                                categoryEquipment={data.packageDetails.categoryEquipment}
                                                equipmentCapacity={data.packageDetails.capacityEquipment}
                                                studentCapacity={data.capacityStudents}
                                                packageDurationHours={data.packageDetails.durationMinutes / 60}
                                                pricePerHour={data.packageDetails.durationMinutes > 0 ? data.packageDetails.pricePerStudent / (data.packageDetails.durationMinutes / 60) : 0}
                                            />                    </div>
                </div>
            ),
        },
        {
            label: "Teachers",
            render: (data) => (
                <div className="flex flex-col gap-1.5">
                    {data.lessons.map((lesson) => (
                        <div key={lesson.id} className="scale-90 origin-left">
                            <TeacherLessonStatsBadge
                                teacherId={lesson.teacherId}
                                teacherUsername={lesson.teacherUsername}
                                eventCount={lesson.eventCount}
                                durationMinutes={lesson.totalDurationHours * 60}
                            />
                        </div>
                    ))}
                </div>
            ),
        },
        {
            label: "Payments",
            render: (data) => (
                <div className="scale-90 origin-right">
                    <StudentTeacherBookingLessonPaymentsBadge 
                        studentPayment={data.totalStudentPayments}
                        teacherPayment={data.totalTeacherPayments}
                        teacherCommission={data.totalTeacherCommissions}
                        currency={data.currency}
                    />
                </div>
            ),
        },
    ];

    const getGroupKey = (row: BookingTableData, groupBy: GroupingType) => {
        if (groupBy === "date") {
            return row.dateStart; // Group by start date
        } else if (groupBy === "week") {
            const date = new Date(row.dateStart);
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
                const bookingEvents = curr.lessons.reduce((sum, l) => sum + l.eventCount, 0);
                const bookingDuration = curr.lessons.reduce((sum, l) => sum + l.totalDurationHours * 60, 0);
                
                // Explicitly tracking actual payments
                const studentPayments = curr.totalStudentPayments;
                // Use actual teacher payments if available, otherwise fallback to calculated commission for estimation
                // But prompt said "want student and teacher payments", implying actual payments from the table.
                // However, if no payments made yet, maybe we show 0? Or the liability (commission)?
                // "teacher comission ok calculate that, but then we teacherLessonPayments... this is what we want"
                // I will track both separately in stats if needed, but for "Teacher Payments" header I'll use the one that represents cost.
                // If I use actual payments, and none are made, Profit looks huge. 
                // Usually Net = Revenue - Cost (Commission Liability). 
                // But prompt says "Student and Teacher Payments". 
                // I will track them as named.
                
                const teacherPayments = curr.totalTeacherPayments;
                const teacherLiabilities = curr.totalTeacherCommissions; 

                // For Net calculation, we usually want (Money In) - (Money Out OR Money Owed).
                // If we want cash flow net: Student Payments - Teacher Payments.
                // If we want profit net: Student Payments - Teacher Commissions.
                // The badge uses `studentPayment - (teacherPayment || teacherCommission)`.
                // I will follow the badge logic for the group stats to match.
                const effectiveTeacherCost = teacherPayments || teacherLiabilities;

                return {
                    eventCount: acc.eventCount + 1,
                    studentCount: acc.studentCount + curr.capacityStudents,
                    totalDuration: acc.totalDuration + bookingDuration,
                    totalEventRevenue: (acc.totalEventRevenue || 0) + curr.totalEventRevenue,
                    totalStudentPayments: acc.totalStudentPayments + studentPayments,
                    totalTeacherPayments: acc.totalTeacherPayments + teacherPayments,
                    totalTeacherCommissions: acc.totalTeacherCommissions + teacherLiabilities,
                    totalProfit: acc.totalProfit + (studentPayments - effectiveTeacherCost),
                    completedCount: acc.completedCount + bookingEvents,
                };
            },
            { totalDuration: 0, eventCount: 0, completedCount: 0, studentCount: 0, totalEventRevenue: 0, totalStudentPayments: 0, totalTeacherPayments: 0, totalTeacherCommissions: 0, totalProfit: 0 }
        );
    };

    const GroupHeaderStats = ({ stats, hideLabel = false }: { stats: GroupStats; hideLabel?: boolean }) => (
        <>
            <div className="flex items-center gap-1.5 opacity-80">
                <BookingIcon size={12} className="text-muted-foreground" />
                {!hideLabel && <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bookings:</span>}
                <span className="text-xs font-bold tabular-nums text-foreground">{stats.eventCount}</span>
            </div>

            <StatHeaderItemUI statType="students" value={stats.studentCount} hideLabel={hideLabel} />
            
            <div className="flex items-center gap-1.5 opacity-80">
                <FlagIcon size={12} className="text-muted-foreground" />
                {!hideLabel && <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Events:</span>}
                <span className="text-xs font-bold tabular-nums text-foreground">{stats.completedCount}</span>
            </div>

            <div className="flex items-center gap-1.5 opacity-80">
                <DurationIcon size={12} className="text-muted-foreground" />
                {!hideLabel && <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration:</span>}
                <span className="text-xs font-bold tabular-nums text-foreground">{getHMDuration(stats.totalDuration)}</span>
            </div>

            <StatHeaderItemUI statType="revenue" value={stats.totalEventRevenue.toFixed(0)} hideLabel={hideLabel} labelOverride="Revenue" />
            <StatHeaderItemUI statType="studentPayments" value={stats.totalStudentPayments.toFixed(0)} hideLabel={hideLabel} />
            <StatHeaderItemUI statType="teacherPayments" value={stats.totalTeacherPayments.toFixed(0)} hideLabel={hideLabel} />
            <StatHeaderItemUI statType="profit" value={stats.totalProfit.toFixed(0)} hideLabel={hideLabel} variant="profit" labelOverride="Profit" />
        </>
    );

    const renderGroupHeader = (title: string, stats: GroupStats, groupBy: GroupingType) => {
        const displayTitle = groupBy === "date" 
            ? new Date(title).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short", year: "numeric" }) 
            : groupBy === "week" ? `Week ${title.split("-W")[1]} of ${title.split("-W")[0]}` : title;

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
        const displayTitle = groupBy === "date" 
            ? new Date(title).toLocaleDateString(undefined, { day: "numeric", month: "short" })
            : groupBy === "week" ? `Week ${title.split("-W")[1]}` : title;

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

    return (
        <MasterTable
            rows={bookings}
            columns={desktopColumns}
            mobileColumns={mobileColumns}
            getGroupKey={getGroupKey}
            calculateStats={calculateStats}
            renderGroupHeader={renderGroupHeader}
            renderMobileGroupHeader={renderMobileGroupHeader}
            showGroupToggle={true}
        />
    );
}
