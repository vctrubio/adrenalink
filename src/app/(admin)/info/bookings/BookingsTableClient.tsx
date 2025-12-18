"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookingStats, getBookingDurationHours } from "@/getters/bookings-getter";
import { formatDate } from "@/getters/date-getter";
import { BOOKING_STATUS_CONFIG } from "@/types/status";
import type { BookingModel } from "@/backend/models";
import { ChevronDownIcon, ArrowTrendingUpIcon, CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { ENTITY_DATA } from "@/config/entities";

type SortColumn = "leader" | "startDate" | "days" | "status" | "packageHours" | "lessons" | "hours" | "studentPayments";
type SortDirection = "asc" | "desc";

interface BookingsTableClientProps {
    bookings: BookingModel[];
}

const SortButton = ({ column, active, direction, onClick, label }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 hover:text-accent transition-colors font-medium ${
            active ? "text-accent" : "text-muted-foreground"
        }`}
    >
        {label}
        {active && (
            <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${direction === "desc" ? "rotate-180" : ""}`}
            />
        )}
    </button>
);

export function BookingsTableClient({ bookings }: BookingsTableClientProps) {
    const [sortColumn, setSortColumn] = useState<SortColumn>("startDate");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("desc");
        }
    };

    const calculateDays = (startDate: string, endDate: string): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    };

    const sortedBookings = useMemo(() => {
        const sorted = [...bookings].sort((a, b) => {
            let comparison = 0;

            switch (sortColumn) {
                case "leader":
                    comparison = (a.schema.leaderStudentName || "").localeCompare(b.schema.leaderStudentName || "");
                    break;
                case "startDate":
                    comparison = new Date(a.schema.dateStart).getTime() - new Date(b.schema.dateStart).getTime();
                    break;
                case "days":
                    const daysA = calculateDays(a.schema.dateStart, a.schema.dateEnd);
                    const daysB = calculateDays(b.schema.dateStart, b.schema.dateEnd);
                    comparison = daysA - daysB;
                    break;
                case "status":
                    comparison = a.schema.status.localeCompare(b.schema.status);
                    break;
                case "packageHours":
                    const pkgHoursA = (a.relations?.schoolPackage?.durationMinutes || 0) / 60;
                    const pkgHoursB = (b.relations?.schoolPackage?.durationMinutes || 0) / 60;
                    comparison = pkgHoursA - pkgHoursB;
                    break;
                case "lessons":
                    const lessonsA = a.relations?.lessons?.length || 0;
                    const lessonsB = b.relations?.lessons?.length || 0;
                    comparison = lessonsA - lessonsB;
                    break;
                case "hours":
                    const hoursA = getBookingDurationHours(a);
                    const hoursB = getBookingDurationHours(b);
                    comparison = hoursA - hoursB;
                    break;
                case "studentPayments":
                    const paymentsA = BookingStats.getStudentPayments(a);
                    const paymentsB = BookingStats.getStudentPayments(b);
                    comparison = paymentsA - paymentsB;
                    break;
                default:
                    return 0;
            }

            return sortDirection === "asc" ? comparison : -comparison;
        });

        return sorted;
    }, [bookings, sortColumn, sortDirection]);

    if (bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <CalendarIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No bookings found</p>
            </div>
        );
    }

    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking");

    return (
        <div className="w-full space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="rounded-lg bg-card/50 border border-border/30 p-4">
                    <div className="text-xs text-muted-foreground font-medium mb-1">Total Bookings</div>
                    <div className="text-2xl font-bold" style={{ color: bookingEntity?.color }}>
                        {bookings.length}
                    </div>
                </div>
                <div className="rounded-lg bg-card/50 border border-border/30 p-4">
                    <div className="text-xs text-muted-foreground font-medium mb-1">Total Hours</div>
                    <div className="text-2xl font-bold text-blue-500">
                        {bookings.reduce((sum, b) => sum + getBookingDurationHours(b), 0)}h
                    </div>
                </div>
                <div className="rounded-lg bg-card/50 border border-border/30 p-4">
                    <div className="text-xs text-muted-foreground font-medium mb-1">Total Lessons</div>
                    <div className="text-2xl font-bold text-purple-500">
                        {bookings.reduce((sum, b) => sum + (b.relations?.lessons?.length || 0), 0)}
                    </div>
                </div>
                <div className="rounded-lg bg-card/50 border border-border/30 p-4">
                    <div className="text-xs text-muted-foreground font-medium mb-1">Total Revenue</div>
                    <div className="text-2xl font-bold text-green-500">
                        ${bookings.reduce((sum, b) => sum + BookingStats.getStudentPayments(b), 0).toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border/30 overflow-hidden bg-gradient-to-b from-card/50 to-background/50 backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        {/* Header */}
                        <thead>
                            <tr className="border-b border-border/30 bg-gradient-to-r from-card/60 to-card/30">
                                <th className="px-6 py-4 text-left">
                                    <SortButton
                                        column="leader"
                                        active={sortColumn === "leader"}
                                        direction={sortDirection}
                                        onClick={() => handleSort("leader")}
                                        label="Leader"
                                    />
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <SortButton
                                        column="startDate"
                                        active={sortColumn === "startDate"}
                                        direction={sortDirection}
                                        onClick={() => handleSort("startDate")}
                                        label="Start"
                                    />
                                </th>
                                <th className="px-6 py-4 text-center">
                                    <SortButton
                                        column="days"
                                        active={sortColumn === "days"}
                                        direction={sortDirection}
                                        onClick={() => handleSort("days")}
                                        label="Days"
                                    />
                                </th>
                                <th className="px-6 py-4 text-center">
                                    <SortButton
                                        column="status"
                                        active={sortColumn === "status"}
                                        direction={sortDirection}
                                        onClick={() => handleSort("status")}
                                        label="Status"
                                    />
                                </th>
                                <th className="px-6 py-4 text-center">
                                    <SortButton
                                        column="packageHours"
                                        active={sortColumn === "packageHours"}
                                        direction={sortDirection}
                                        onClick={() => handleSort("packageHours")}
                                        label="Pkg"
                                    />
                                </th>
                                <th className="px-6 py-4 text-center">
                                    <SortButton
                                        column="lessons"
                                        active={sortColumn === "lessons"}
                                        direction={sortDirection}
                                        onClick={() => handleSort("lessons")}
                                        label="Lessons"
                                    />
                                </th>
                                <th className="px-6 py-4 text-center">
                                    <SortButton
                                        column="hours"
                                        active={sortColumn === "hours"}
                                        direction={sortDirection}
                                        onClick={() => handleSort("hours")}
                                        label="Hours"
                                    />
                                </th>
                                <th className="px-6 py-4 text-right">
                                    <SortButton
                                        column="studentPayments"
                                        active={sortColumn === "studentPayments"}
                                        direction={sortDirection}
                                        onClick={() => handleSort("studentPayments")}
                                        label="Revenue"
                                    />
                                </th>
                            </tr>
                        </thead>

                        {/* Body */}
                        <tbody>
                            <AnimatePresence>
                                {sortedBookings.map((booking, index) => {
                                    const statusConfig = BOOKING_STATUS_CONFIG[booking.schema.status];
                                    const days = calculateDays(booking.schema.dateStart, booking.schema.dateEnd);
                                    const packageHours = (booking.relations?.schoolPackage?.durationMinutes || 0) / 60;
                                    const lessonsCount = booking.relations?.lessons?.length || 0;
                                    const totalHours = getBookingDurationHours(booking);
                                    const studentPayments = BookingStats.getStudentPayments(booking);

                                    return (
                                        <motion.tr
                                            key={booking.schema.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="border-b border-border/20 hover:bg-card/40 transition-colors group"
                                        >
                                            {/* Leader Name */}
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/info/bookings/${booking.schema.id}`}
                                                    className="font-semibold group-hover:text-accent transition-colors"
                                                    style={{
                                                        color: bookingEntity?.color,
                                                    }}
                                                >
                                                    {booking.schema.leaderStudentName || "Unknown"}
                                                </Link>
                                            </td>

                                            {/* Start Date */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-foreground">
                                                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm">{formatDate(booking.schema.dateStart)}</span>
                                                </div>
                                            </td>

                                            {/* Days */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-block bg-blue-500/10 text-blue-500 px-3 py-1 rounded-lg font-semibold text-sm">
                                                    {days}d
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide"
                                                    style={{
                                                        backgroundColor: `${statusConfig.color}20`,
                                                        color: statusConfig.color,
                                                    }}
                                                >
                                                    {statusConfig.label}
                                                </span>
                                            </td>

                                            {/* Package Hours */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2 text-foreground font-semibold">
                                                    <ClockIcon className="w-4 h-4 text-amber-500" />
                                                    {packageHours.toFixed(1)}h
                                                </div>
                                            </td>

                                            {/* Lessons Count */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-block bg-purple-500/10 text-purple-500 px-3 py-1 rounded-lg font-bold">
                                                    {lessonsCount}
                                                </div>
                                            </td>

                                            {/* Total Hours */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2 text-foreground font-semibold">
                                                    <ClockIcon className="w-4 h-4 text-cyan-500" />
                                                    {totalHours}h
                                                </div>
                                            </td>

                                            {/* Student Payments */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                                                    <span className="font-bold text-green-500 text-lg">
                                                        ${studentPayments.toFixed(2)}
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
