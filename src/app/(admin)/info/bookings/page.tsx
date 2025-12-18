"use client";

import { getBookings } from "@/actions/databoard-action";
import { InfoHeader } from "../InfoHeader";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { BookingStats, getBookingDurationHours } from "@/getters/bookings-getter";
import { formatDate } from "@/getters/date-getter";
import { BOOKING_STATUS_CONFIG } from "@/types/status";
import type { BookingModel } from "@/backend/models";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

type SortColumn = "leader" | "startDate" | "days" | "status" | "packageHours" | "lessons" | "hours" | "studentPayments";
type SortDirection = "asc" | "desc";

export default function BookingsPage() {
    const [bookings, setBookings] = useState<BookingModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortColumn, setSortColumn] = useState<SortColumn>("startDate");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const result = await getBookings();
            if (result.success) {
                setBookings(result.data);
            }
            setLoading(false);
        })();
    }, []);

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

    if (loading) {
        return (
            <>
                <InfoHeader title="Bookings" />
                <div className="text-center py-12">Loading bookings...</div>
            </>
        );
    }

    if (bookings.length === 0) {
        return (
            <>
                <InfoHeader title="Bookings" />
                <div className="text-center py-12 text-muted-foreground">No bookings found</div>
            </>
        );
    }

    return (
        <>
            <InfoHeader title={`Bookings (${bookings.length})`} />
            <div className="w-full overflow-x-auto rounded-lg border border-border/50">
                <table className="w-full text-sm">
                    {/* Header */}
                    <thead>
                        <tr className="border-b border-border/50 bg-card/50">
                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                                <button
                                    onClick={() => handleSort("leader")}
                                    className="flex items-center gap-2 hover:text-accent transition-colors"
                                >
                                    Leader Name
                                    <ChevronDownIcon
                                        className={`w-4 h-4 transition-transform ${
                                            sortColumn === "leader" && sortDirection === "desc" ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-foreground">
                                <button
                                    onClick={() => handleSort("startDate")}
                                    className="flex items-center gap-2 hover:text-accent transition-colors"
                                >
                                    Start Date
                                    <ChevronDownIcon
                                        className={`w-4 h-4 transition-transform ${
                                            sortColumn === "startDate" && sortDirection === "desc" ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-foreground">
                                <button
                                    onClick={() => handleSort("days")}
                                    className="flex items-center gap-2 hover:text-accent transition-colors w-full justify-center"
                                >
                                    Days
                                    <ChevronDownIcon
                                        className={`w-4 h-4 transition-transform ${
                                            sortColumn === "days" && sortDirection === "desc" ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-foreground">
                                <button
                                    onClick={() => handleSort("status")}
                                    className="flex items-center gap-2 hover:text-accent transition-colors w-full justify-center"
                                >
                                    Status
                                    <ChevronDownIcon
                                        className={`w-4 h-4 transition-transform ${
                                            sortColumn === "status" && sortDirection === "desc" ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-foreground">
                                <button
                                    onClick={() => handleSort("packageHours")}
                                    className="flex items-center gap-2 hover:text-accent transition-colors ml-auto"
                                >
                                    Package Hours
                                    <ChevronDownIcon
                                        className={`w-4 h-4 transition-transform ${
                                            sortColumn === "packageHours" && sortDirection === "desc" ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-foreground">
                                <button
                                    onClick={() => handleSort("lessons")}
                                    className="flex items-center gap-2 hover:text-accent transition-colors w-full justify-center"
                                >
                                    Lessons
                                    <ChevronDownIcon
                                        className={`w-4 h-4 transition-transform ${
                                            sortColumn === "lessons" && sortDirection === "desc" ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-foreground">
                                <button
                                    onClick={() => handleSort("hours")}
                                    className="flex items-center gap-2 hover:text-accent transition-colors w-full justify-center"
                                >
                                    Total Hours
                                    <ChevronDownIcon
                                        className={`w-4 h-4 transition-transform ${
                                            sortColumn === "hours" && sortDirection === "desc" ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-foreground">
                                <button
                                    onClick={() => handleSort("studentPayments")}
                                    className="flex items-center gap-2 hover:text-accent transition-colors ml-auto"
                                >
                                    Student Payments
                                    <ChevronDownIcon
                                        className={`w-4 h-4 transition-transform ${
                                            sortColumn === "studentPayments" && sortDirection === "desc" ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
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
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className={`border-b border-border/30 hover:bg-card/30 transition-colors cursor-pointer ${
                                            index % 2 === 0 ? "bg-background/50" : "bg-card/20"
                                        }`}
                                        onClick={() => setExpandedId(expandedId === booking.schema.id ? null : booking.schema.id)}
                                    >
                                        {/* Leader Name */}
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/info/bookings/${booking.schema.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="font-medium text-accent hover:underline"
                                            >
                                                {booking.schema.leaderStudentName || "Unknown"}
                                            </Link>
                                        </td>

                                        {/* Start Date */}
                                        <td className="px-4 py-3 text-muted-foreground">{formatDate(booking.schema.dateStart)}</td>

                                        {/* Days */}
                                        <td className="px-4 py-3 text-center font-medium">{days}</td>

                                        {/* Status */}
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
                                                style={{
                                                    backgroundColor: `${statusConfig.color}20`,
                                                    color: statusConfig.color,
                                                }}
                                            >
                                                {statusConfig.label}
                                            </span>
                                        </td>

                                        {/* Package Hours */}
                                        <td className="px-4 py-3 text-right font-medium">{packageHours.toFixed(1)}h</td>

                                        {/* Lessons Count */}
                                        <td className="px-4 py-3 text-center font-medium">{lessonsCount}</td>

                                        {/* Total Hours */}
                                        <td className="px-4 py-3 text-center font-medium">{totalHours}h</td>

                                        {/* Student Payments */}
                                        <td className="px-4 py-3 text-right font-semibold text-accent">${studentPayments.toFixed(2)}</td>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </>
    );
}
