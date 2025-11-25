"use client";

import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import type { BookingStatsData } from "@/getters/student-booking-stats-getter";
import { BOOKING_BAR_CHART_CONFIG } from "@/config/barchart";

interface BookingBarChartProps {
    bookings: BookingStatsData[];
    selectedBookingId: string | null;
    onSelectBooking: (id: string | null) => void;
}

type MetricType = "events" | "duration" | "payments";

interface MetricConfig {
    label: string;
    icon: typeof FlagIcon;
    color: string;
    getValue: (booking: BookingStatsData) => number;
    maxScale: number;
}

export function BookingBarChart({ bookings, selectedBookingId, onSelectBooking }: BookingBarChartProps) {
    const metrics: Record<MetricType, MetricConfig> = {
        events: {
            label: "Events",
            icon: FlagIcon,
            color: BOOKING_BAR_CHART_CONFIG.colors.events,
            getValue: (b) => b.eventsCount,
            maxScale: BOOKING_BAR_CHART_CONFIG.scales.eventsCount.max,
        },
        duration: {
            label: "Duration (hours)",
            icon: DurationIcon,
            color: BOOKING_BAR_CHART_CONFIG.colors.duration,
            getValue: (b) => b.durationHours,
            maxScale: BOOKING_BAR_CHART_CONFIG.scales.durationHours.max,
        },
        payments: {
            label: "Payments",
            icon: CreditIcon,
            color: BOOKING_BAR_CHART_CONFIG.colors.payments,
            getValue: (b) => b.paymentsCount,
            maxScale: BOOKING_BAR_CHART_CONFIG.scales.paymentsCount.max,
        },
    };

    const renderMetricBar = (metric: MetricType) => {
        const config = metrics[metric];
        const MetricIcon = config.icon;

        const values = bookings.map((b) => config.getValue(b));
        const totalValue = values.reduce((sum, v) => sum + v, 0);

        if (totalValue === 0) {
            return null;
        }

        const exceedsScale = totalValue > config.maxScale;

        return (
            <div key={metric} className="space-y-2">
                {/* Label + Icon */}
                <div className="flex items-center gap-2">
                    <MetricIcon size={16} style={{ color: config.color }} />
                    <span className="text-sm font-medium text-foreground">{config.label}</span>
                    {exceedsScale && (
                        <span className="text-xs text-muted-foreground">+{totalValue.toFixed(1)}</span>
                    )}
                </div>

                {/* Stacked Bar */}
                <div className="relative h-10 w-full bg-muted/30 rounded-lg overflow-hidden">
                    {bookings.map((booking, index) => {
                        const value = values[index];
                        if (value === 0) return null;

                        const startPercent =
                            (values.slice(0, index).reduce((s, v) => s + v, 0) / totalValue) * 100;
                        const widthPercent = (value / totalValue) * 100;
                        const isSelected = selectedBookingId === booking.bookingId;

                        return (
                            <div
                                key={booking.bookingId}
                                className="absolute h-full cursor-pointer transition-all flex items-center justify-between px-2"
                                style={{
                                    left: `${startPercent}%`,
                                    width: `${widthPercent}%`,
                                    backgroundColor: isSelected ? `${config.color}50` : `${config.color}30`,
                                    borderRight: "1px solid rgba(255,255,255,0.2)",
                                }}
                                onClick={() => onSelectBooking(isSelected ? null : booking.bookingId)}
                                onMouseEnter={(e) => {
                                    if (!isSelected) {
                                        e.currentTarget.style.backgroundColor = `${config.color}40`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSelected) {
                                        e.currentTarget.style.backgroundColor = `${config.color}30`;
                                    }
                                }}
                            >
                                {/* Icon on left (if segment wide enough) */}
                                {widthPercent > 10 && (
                                    <BookingIcon
                                        size={16}
                                        style={{ color: config.color, flexShrink: 0 }}
                                    />
                                )}

                                {/* Value on right (positioned outside bar) */}
                                <span
                                    className="absolute text-xs font-medium whitespace-nowrap"
                                    style={{
                                        left: "100%",
                                        marginLeft: "4px",
                                        color: "var(--foreground)",
                                    }}
                                >
                                    {metric === "duration" ? value.toFixed(1) : Math.round(value)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {renderMetricBar("events")}
            {renderMetricBar("duration")}
            {renderMetricBar("payments")}
        </div>
    );
}
