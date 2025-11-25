"use client";

import { useState } from "react";
import type { StudentModel } from "@/backend/models";
import { getBookingStatsData, getGlobalStats } from "@/getters/student-booking-stats-getter";
import { BookingBarChart } from "./BookingBarChart";
import { BookingList } from "./BookingList";
import { StatsDisplay } from "./StatsDisplay";
import { BookingDetailCard } from "./BookingDetailCard";

export function StudentBookingStats({ student }: { student: StudentModel }) {
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    const bookings = getBookingStatsData(student);
    const globalStats = getGlobalStats(bookings);
    const selectedBooking = bookings.find((b) => b.bookingId === selectedBookingId) || null;
    const isGlobal = selectedBookingId === null;

    if (bookings.length === 0) {
        return (
            <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground">No bookings found</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Booking Statistics</h2>

            {/* Horizontal stacked bars for metrics */}
            <BookingBarChart
                bookings={bookings}
                selectedBookingId={selectedBookingId}
                onSelectBooking={setSelectedBookingId}
            />

            {/* Stats grid with highlighting */}
            <StatsDisplay globalStats={globalStats} selectedBooking={selectedBooking} />

            {/* Package info + Balance info */}
            <BookingDetailCard booking={selectedBooking} globalStats={globalStats} isGlobal={isGlobal} />

            {/* List of bookings with date ranges */}
            <BookingList
                bookings={bookings}
                selectedBookingId={selectedBookingId}
                onSelectBooking={setSelectedBookingId}
            />
        </div>
    );
}
