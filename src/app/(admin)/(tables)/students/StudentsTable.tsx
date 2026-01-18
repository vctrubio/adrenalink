"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MasterTable, type ColumnDef, type MobileColumnDef, type GroupingType, type GroupStats } from "../MasterTable";
import { StudentStatusBadge } from "@/src/components/ui/badge";
import type { StudentTableData } from "@/config/tables";
import ReactCountryFlag from "react-country-flag";
import { StudentBookingActivityCard } from "./StudentBookingActivityCard";
import { filterStudents } from "@/types/searching-entities";
import { useTableLogic } from "@/src/hooks/useTableLogic";
import { COUNTRIES } from "@/config/countries";
import { StatItemUI } from "@/backend/data/StatsData";
import { TableGroupHeader, TableMobileGroupHeader } from "@/src/components/tables/TableGroupHeader";
import { TableActions } from "../MasterTable";
import { AnimatePresence, motion } from "framer-motion";
import { useTablesController } from "../layout";
import { ENTITY_DATA } from "@/config/entities";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";

const HEADER_CLASSES = {
    yellow: "px-4 py-3 font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10",
    blue: "px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    purple: "px-4 py-3 font-medium text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10",
    zinc: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    center: "px-4 py-3 font-medium text-center",
} as const;

interface StudentDisplayProps {
    student: {
        id: string;
        firstName: string;
        lastName: string;
        country: string;
        phone?: string;
        languages?: string[];
        schoolStudentStatus?: string;
        schoolStudentDescription?: string;
    };
    variant?: "full" | "compact" | "icon-only";
    iconSize?: number;
    showCountry?: boolean;
    showLanguages?: boolean;
    showDescription?: boolean;
    rental?: boolean;
}

export function StudentDisplay({
    student,
    variant = "full",
    iconSize = 16,
    showCountry = true,
    showLanguages = true,
    showDescription = true,
    rental = false,
}: StudentDisplayProps) {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const rentalEntity = ENTITY_DATA.find((e) => e.id === "rental");
    const studentColor = studentEntity?.color || "#eab308";
    const rentalColor = rentalEntity?.color || "#ef4444";

    const isActive = student.schoolStudentStatus === "active";
    const hasRentals = rental;
    let iconColor = "#9ca3af"; // muted
    if (isActive && hasRentals) {
        iconColor = rentalColor; // red from rental entity
    } else if (isActive) {
        iconColor = studentColor; // yellow from student entity
    }

    if (variant === "icon-only") {
        return (
            <div style={{ color: iconColor }} title={isActive ? (hasRentals ? "Active with Rental" : "Active") : "Inactive"}>
                <HelmetIcon size={iconSize} />
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <div className="flex items-center gap-2">
                <div style={{ color: iconColor }}>
                    <HelmetIcon size={iconSize} />
                </div>
                <Link href={`students/${student.id}`}>
                    <span className="font-bold text-foreground hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">
                        {student.firstName} {student.lastName}
                    </span>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1 items-start max-w-[400px]">
            <Link href={`students/${student.id}`} className="flex items-center gap-2 group">
                <div style={{ color: iconColor }} title={isActive ? (hasRentals ? "Active with Rental" : "Active") : "Inactive"}>
                    <HelmetIcon size={iconSize} />
                </div>
                <span className="font-bold text-foreground text-sm normal-case group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">
                    {student.firstName} {student.lastName}
                </span>
            </Link>
            {showCountry && showLanguages && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-black uppercase tracking-tight">
                    {showCountry && (
                        <div className="flex items-center" title={student.country}>
                            <ReactCountryFlag countryCode={getCountryCode(student.country)} svg style={{ width: "1.2em", height: "1.2em" }} />
                        </div>
                    )}
                    {showLanguages && student.languages && student.languages.length > 0 && (
                        <div className="flex gap-1.5 overflow-hidden normal-case">
                            {student.languages.map((lang) => (
                                <span key={lang} className="truncate">
                                    {lang}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {showDescription && student.schoolStudentDescription && (
                <p className="text-xs text-muted-foreground/60 italic line-clamp-2 leading-relaxed">{student.schoolStudentDescription}</p>
            )}
        </div>
    );
}

export function StudentsTable({ students = [] }: { students: StudentTableData[] }) {
    const { showActions } = useTablesController();
    const {
        filteredRows: filteredStudents,
        masterTableGroupBy,
        getGroupKey,
    } = useTableLogic({
        data: students,
        filterSearch: filterStudents,
        filterStatus: (student, status) => {
            if (status === "New") return student.stats.totalBookings === 0;
            if (status === "Ongoing") return student.bookings?.some((b) => b.status === "active") ?? false;
            if (status === "Available") return student.stats.allBookingsCompleted === true;
            return true; // "All"
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

    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const rentalEntity = ENTITY_DATA.find((e) => e.id === "rental");
    const studentColor = studentEntity?.color || "#eab308";
    const rentalColor = rentalEntity?.color || "#ef4444";

    const desktopColumns: ColumnDef<StudentTableData>[] = [
        {
            header: "Student Profile",
            headerClassName: HEADER_CLASSES.yellow,
            render: (data) => (
                <StudentDisplay
                    student={{
                        id: data.id,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        country: data.country,
                        phone: data.phone,
                        languages: data.languages,
                        schoolStudentStatus: data.schoolStudentStatus,
                        schoolStudentDescription: data.schoolStudentDescription,
                    }}
                    variant="full"
                    rental={(data as any).rentals && (data as any).rentals.length > 0}
                />
            ),
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
                <div className="flex justify-center min-w-[100px]">
                    <AnimatePresence mode="wait">
                        {showActions ? (
                            <motion.div
                                key="actions"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                <TableActions id={data.id} type="student" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="status"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.15 }}
                            >
                                <StudentStatusBadge
                                    bookingCount={data.stats.totalBookings}
                                    totalEventDuration={data.stats.totalDurationMinutes}
                                    allBookingsCompleted={data.stats.allBookingsCompleted}
                                    eventCount={data.stats.totalEvents}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                    <StudentDisplay
                        student={{
                            id: data.id,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            country: data.country,
                            phone: data.phone,
                            languages: data.languages,
                            schoolStudentStatus: data.schoolStudentStatus,
                            schoolStudentDescription: data.schoolStudentDescription,
                        }}
                        variant="compact"
                        iconSize={14}
                        showCountry={false}
                        showLanguages={false}
                        showDescription={false}
                        rental={(data as any).rentals && (data as any).rentals.length > 0}
                    />
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
                <div className="scale-90 origin-right flex justify-end">
                    <AnimatePresence mode="wait">
                        {showActions ? (
                            <motion.div
                                key="actions"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                            >
                                <TableActions id={data.id} type="student" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="status"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                            >
                                <StudentStatusBadge
                                    bookingCount={data.stats.totalBookings}
                                    totalEventDuration={data.stats.totalDurationMinutes}
                                    allBookingsCompleted={data.stats.allBookingsCompleted}
                                    eventCount={data.stats.totalEvents}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ),
        },
    ];

    return (
        <MasterTable
            rows={filteredStudents}
            columns={desktopColumns}
            mobileColumns={mobileColumns}
            populateType="student"
            groupBy={masterTableGroupBy}
            getGroupKey={getGroupKey}
            calculateStats={calculateStats}
            renderGroupHeader={renderGroupHeader}
            renderMobileGroupHeader={renderMobileGroupHeader}
            showGroupToggle={false}
        />
    );
}

function getCountryCode(countryName: string): string {
    const country = COUNTRIES.find(
        (c) => c.name.toLowerCase() === countryName.toLowerCase() || c.label.toLowerCase() === countryName.toLowerCase(),
    );
    return country?.code || "YEN";
}