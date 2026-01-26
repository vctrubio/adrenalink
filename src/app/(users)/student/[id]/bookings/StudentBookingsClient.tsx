"use client";

import { useStudentUser } from "@/src/providers/student-user-provider";
import { BOOKING_STATUS_CONFIG, type BookingStatus } from "@/types/status";
import { StatItemUI } from "@/backend/data/StatsData";
import { Package } from "lucide-react";
import { getHMDuration } from "@/getters/duration-getter";

export function StudentBookingsClient() {
    const { data: studentUser, schoolHeader } = useStudentUser();
    const currency = schoolHeader?.currency || "YEN";
    const hasBookings = studentUser.bookings.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground">My Bookings</h2>
            </div>

            {!hasBookings ? (
                <div className="text-center py-20 bg-card border border-border rounded-[2.5rem] shadow-sm">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                        <Package size={32} />
                    </div>
                    <h3 className="text-xl font-bold">No bookings found</h3>
                    <p className="text-muted-foreground">You don't have any active bookings yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {studentUser.bookings.map((booking) => (
                        <BookingProgressCard key={booking.id} booking={booking} currency={currency} />
                    ))}
                </div>
            )}
        </div>
    );
}

// Sub-component: Booking Progress Card
function BookingProgressCard({ booking, currency }: { booking: any; currency: string }) {
    const startDate = new Date(booking.dateStart);
    const endDate = new Date(booking.dateEnd);
    const statusConfig = BOOKING_STATUS_CONFIG[booking.status as BookingStatus] || BOOKING_STATUS_CONFIG.active;

    const totalMinutes = booking.stats.events.statusCounts.planned + booking.stats.events.statusCounts.tbc + booking.stats.events.statusCounts.completed + booking.stats.events.statusCounts.uncompleted;
    const completedMinutes = booking.stats.events.statusCounts.completed;
    const progressPercent = totalMinutes > 0 ? (completedMinutes / totalMinutes) * 100 : 0;

    return (
        <div className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-all">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-foreground">{booking.packageName}</h3>
                        <span
                            className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{
                                backgroundColor: `${statusConfig.color}20`,
                                color: statusConfig.color,
                            }}
                        >
                            {statusConfig.label}
                        </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                        {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                        {booking.packageDetails.pricePerStudent} {currency}
                    </div>
                    <p className="text-xs text-muted-foreground">per student</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{progressPercent.toFixed(0)}% Complete</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-x-6 gap-y-2 py-3 border-t border-border/30">
                <StatItemUI type="events" value={booking.stats.events.count} hideLabel={false} iconColor={false} />
                <StatItemUI type="duration" value={booking.stats.events.duration * 60} hideLabel={false} iconColor={false} />
                <StatItemUI type="revenue" value={booking.stats.events.revenue} hideLabel={false} variant="primary" iconColor={false} />
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border/30">
                <StatusPill label="Planned" minutes={booking.stats.events.statusCounts.planned} color="#6b7280" />
                <StatusPill label="TBC" minutes={booking.stats.events.statusCounts.tbc} color="#a855f7" />
                <StatusPill label="Done" minutes={booking.stats.events.statusCounts.completed} color="#22c55e" />
                <StatusPill label="Missed" minutes={booking.stats.events.statusCounts.uncompleted} color="#fbbf24" />
            </div>
        </div>
    );
}

// Sub-component: Status Pill
function StatusPill({ label, minutes, color }: { label: string; minutes: number; color: string }) {
    return (
        <div className="flex flex-col items-center py-2 px-2 rounded-lg bg-muted/30">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
            <span className="text-sm font-bold mt-1" style={{ color }}>
                {getHMDuration(minutes)}
            </span>
        </div>
    );
}