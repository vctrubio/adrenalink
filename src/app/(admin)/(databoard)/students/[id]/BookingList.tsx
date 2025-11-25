"use client";

import { formatDate } from "@/getters/date-getter";
import type { BookingStatsData } from "@/getters/student-booking-stats-getter";

interface BookingListProps {
    bookings: BookingStatsData[];
    selectedBookingId: string | null;
    onSelectBooking: (id: string | null) => void;
}

const BOOKING_COLOR = "#3b82f6";

export function BookingList({ bookings, selectedBookingId, onSelectBooking }: BookingListProps) {
    return (
        <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Bookings ({bookings.length})</h3>
            <div className="space-y-2">
                {bookings.map((booking) => {
                    const isSelected = selectedBookingId === booking.bookingId;

                    return (
                        <div
                            key={booking.bookingId}
                            className="p-3 rounded-lg border border-border cursor-pointer transition-colors"
                            style={{
                                backgroundColor: isSelected ? `${BOOKING_COLOR}30` : "transparent",
                            }}
                            onClick={() => onSelectBooking(isSelected ? null : booking.bookingId)}
                            onMouseEnter={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.backgroundColor = `${BOOKING_COLOR}15`;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }
                            }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-sm font-medium text-foreground">
                                    {formatDate(booking.dateStart)} - {formatDate(booking.dateEnd)}
                                </p>
                                <span
                                    className="text-xs px-2 py-0.5 rounded"
                                    style={{
                                        backgroundColor: isSelected ? BOOKING_COLOR : "var(--muted)",
                                        color: isSelected ? "white" : "var(--muted-foreground)",
                                    }}
                                >
                                    {booking.status}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                                <div>
                                    <span className="font-medium">{booking.eventsCount}</span> events
                                </div>
                                <div>
                                    <span className="font-medium">{booking.durationHours.toFixed(1)}h</span> duration
                                </div>
                                <div>
                                    <span className="font-medium">{booking.paymentsCount}</span> payments
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
