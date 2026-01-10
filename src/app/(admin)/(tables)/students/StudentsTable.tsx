"use client";

import Link from "next/link";
import { MasterTable, type ColumnDef, type MobileColumnDef, type GroupingType, type GroupStats } from "../MasterTable";
import { StudentStatusBadge } from "@/src/components/ui/badge";
import { SchoolStudentStatus } from "@/types/status";
import type { StudentTableData } from "@/config/tables";
import ReactCountryFlag from "react-country-flag";
import { StudentBookingActivityCard } from "./StudentBookingActivityCard";
import { filterStudents } from "@/types/searching-entities";
import { useTableLogic } from "@/src/hooks/useTableLogic";
import { COUNTRIES } from "@/config/countries";
import { ENTITY_DATA } from "@/config/entities";
import { StatItemUI } from "@/backend/data/StatsData";
import { getHMDuration } from "@/getters/duration-getter";
import { TableGroupHeader, TableMobileGroupHeader } from "@/src/components/tables/TableGroupHeader";

const HEADER_CLASSES = {
    yellow: "px-4 py-3 font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10",
    blue: "px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    purple: "px-4 py-3 font-medium text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10",
    zinc: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    center: "px-4 py-3 font-medium text-center",
} as const;

export function StudentsTable({ students = [] }: { students: StudentTableData[] }) {
    const {
        filteredRows: filteredStudents,
        masterTableGroupBy,
        getGroupKey,
    } = useTableLogic({
        data: students,
        filterSearch: filterStudents,
        filterStatus: (student, status) => {
            if (status === "Active") return student.schoolStudentStatus === "active";
            if (status === "Inactive") return student.schoolStudentStatus !== "active";
            return true;
        },
        dateField: "createdAt",
    });

    const calculateStats = (groupRows: StudentTableData[]): GroupStats => {
        return groupRows.reduce(
            (acc, curr) => ({
                studentCount: acc.studentCount + 1,
                bookingCount: acc.bookingCount + curr.stats.totalBookings,
                eventCount: acc.eventCount + curr.stats.totalEvents,
                totalDuration: acc.totalDuration + curr.stats.totalDurationMinutes,
                totalRevenue: acc.totalRevenue + curr.stats.totalRevenue,
                totalPayments: acc.totalPayments + curr.stats.totalPayments,
            }),
            { studentCount: 0, bookingCount: 0, eventCount: 0, totalDuration: 0, totalRevenue: 0, totalPayments: 0 },
        );
    };

    const GroupHeaderStats = ({ stats, hideLabel = false }: { stats: GroupStats; hideLabel?: boolean }) => (
        <>
            <StatItemUI type="students" value={stats.studentCount} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="bookings" value={stats.bookingCount} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="events" value={stats.eventCount} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="duration" value={stats.totalDuration} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI
                type="studentPayments"
                value={stats.totalPayments}
                labelOverride="Paid"
                hideLabel={hideLabel}
                variant="primary"
                iconColor={false}
            />
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

    const desktopColumns: ColumnDef<StudentTableData>[] = [
        {
            header: "Student Profile",
            headerClassName: HEADER_CLASSES.yellow,
            render: (data) => {
                const isActive = data.schoolStudentStatus === "active";
                return (
                    <div className="flex flex-col gap-1 items-start max-w-[400px]">
                        <Link href={`students/${data.id}`} className="flex items-center gap-2 group">
                            <span className="font-bold text-foreground text-sm normal-case group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">
                                {data.firstName} {data.lastName}
                            </span>
                            <div
                                className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                                title={isActive ? "Active" : "Inactive"}
                            />
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-black uppercase tracking-tight">
                            <div className="flex items-center" title={data.country}>
                                <ReactCountryFlag
                                    countryCode={getCountryCode(data.country)}
                                    svg
                                    style={{ width: "1.2em", height: "1.2em" }}
                                />
                            </div>
                            <span className="tabular-nums">{data.phone}</span>
                            <span className="opacity-20 text-foreground">|</span>
                            <span className="tabular-nums">{data.id.slice(0, 8)}</span>
                        </div>
                        {data.schoolStudentDescription && (
                            <p className="text-xs text-muted-foreground/60 italic line-clamp-2 leading-relaxed">
                                {data.schoolStudentDescription}
                            </p>
                        )}
                    </div>
                );
            },
        },
        {
            header: "Bookings & Progress",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => (
                <div className="flex flex-col gap-3 min-w-[320px] pr-2">
                    {data.bookings.map((booking) => (
                        <StudentBookingActivityCard key={booking.id} booking={booking} stats={booking.stats} />
                    ))}
                    {data.bookings.length === 0 && <span className="text-xs text-muted-foreground italic">No bookings</span>}
                </div>
            ),
        },
        {
            header: "Status",
            headerClassName: HEADER_CLASSES.center,
            render: (data) => (
                <div className="flex justify-center">
                    <StudentStatusBadge
                        bookingCount={data.stats.totalBookings}
                        totalEventDuration={data.stats.totalDurationMinutes}
                        allBookingsCompleted={data.stats.allBookingsCompleted}
                        eventCount={data.stats.totalEvents}
                    />
                </div>
            ),
        },
    ];

    const mobileColumns: MobileColumnDef<StudentTableData>[] = [
        {
            label: "Student",
            headerClassName: HEADER_CLASSES.yellow,
            render: (data) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-1.5 h-1.5 rounded-full ${data.schoolStudentStatus === "active" ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                        />
                        <div className="font-bold text-sm">
                            {data.firstName} {data.lastName}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-black uppercase">
                        <ReactCountryFlag countryCode={getCountryCode(data.country)} svg style={{ width: "1em", height: "1em" }} />
                        <span className="opacity-20 text-foreground">|</span>
                        <span>{data.phone}</span>
                    </div>
                </div>
            ),
        },
        {
            label: "Progress",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => (
                <div className="flex flex-col gap-2 min-w-[200px] pr-1">
                    {data.bookings.map((booking) => (
                        <StudentBookingActivityCard key={booking.id} booking={booking} stats={booking.stats} />
                    ))}
                </div>
            ),
        },
        {
            label: "Status",
            headerClassName: HEADER_CLASSES.zinc,
            render: (data) => (
                <div className="scale-90 origin-right">
                    <StudentStatusBadge
                        bookingCount={data.stats.totalBookings}
                        totalEventDuration={data.stats.totalDurationMinutes}
                        allBookingsCompleted={data.stats.allBookingsCompleted}
                        eventCount={data.stats.totalEvents}
                    />
                </div>
            ),
        },
    ];

    return (
        <MasterTable
            rows={filteredStudents}
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

// Helper to attempt mapping country name to code (simple fallback)
function getCountryCode(countryName: string): string {
    const country = COUNTRIES.find(
        (c) => c.name.toLowerCase() === countryName.toLowerCase() || c.label.toLowerCase() === countryName.toLowerCase(),
    );
    return country?.code || "US";
}
