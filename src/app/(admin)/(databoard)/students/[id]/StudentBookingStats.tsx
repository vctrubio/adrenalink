"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ENTITY_DATA } from "@/config/entities";
import { getPrettyDuration } from "@/getters/duration-getter";
import { formatDate, prettyDateSpan } from "@/getters/date-getter";
import type { BookingStatsData, GlobalStatsType } from "@/getters/student-booking-stats-getter";

interface StudentBookingStatsProps {
    bookings: BookingStatsData[];
    globalStats: GlobalStatsType;
}

export function StudentBookingStats({ bookings, globalStats }: StudentBookingStatsProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");
    const packageColor = packageEntity?.color || "#fb923c";

    if (bookings.length === 0) {
        return (
            <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground">No bookings found</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">Bookings</h2>
            {bookings.map((booking) => {
                const isExpanded = expandedId === booking.bookingId;
                const dateRange = prettyDateSpan(booking.dateStart, booking.dateEnd);
                return (
                    <div key={booking.bookingId} className="border border-border rounded-lg overflow-hidden">
                        <button
                            onClick={() => setExpandedId(isExpanded ? null : booking.bookingId)}
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                        >
                            <div className="flex-1">
                                <p className="font-medium text-foreground">{dateRange}</p>
                                <p className="text-xs text-muted-foreground mt-1">{booking.packageDescription}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-foreground">{booking.eventsCount} events</p>
                                    <p className="text-xs text-muted-foreground">{booking.durationHours.toFixed(1)}h</p>
                                </div>
                                <ChevronDown size={20} className="text-muted-foreground" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="border-t border-border p-4 bg-muted/10 space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-muted-foreground">Status</p>
                                        <p className="font-medium text-foreground capitalize">{booking.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Events</p>
                                        <p className="font-medium text-foreground">{booking.eventsCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Duration</p>
                                        <p className="font-medium text-foreground">{getPrettyDuration(Math.round(booking.durationHours * 60))}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Payments</p>
                                        <p className="font-medium text-foreground">{booking.paymentsCount}</p>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-3 font-mono">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-muted-foreground">{booking.durationHours.toFixed(1)}h × ${booking.packagePricePerHour.toFixed(2)}/hr</span>
                                        <span className="text-foreground">${booking.moneyToPay.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-muted-foreground">Money Paid:</span>
                                        <span className="text-foreground">${booking.moneyPaid.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-border">
                                        <span className="font-semibold text-foreground">Balance:</span>
                                        <span
                                            className="font-bold"
                                            style={{
                                                color:
                                                    booking.balance < 0
                                                        ? "#10b981"
                                                        : booking.balance > 0
                                                          ? "#ef4444"
                                                          : "#78716c",
                                            }}
                                        >
                                            ${Math.abs(booking.balance).toFixed(2)} {booking.balance < 0 ? "Credit" : booking.balance > 0 ? "Owed" : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
