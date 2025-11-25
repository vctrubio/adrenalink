"use client";

import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import type { BookingStatsData, GlobalStatsType } from "@/getters/student-booking-stats-getter";

interface StatsDisplayProps {
    globalStats: GlobalStatsType;
    selectedBooking: BookingStatsData | null;
}

export function StatsDisplay({ globalStats, selectedBooking }: StatsDisplayProps) {
    const isSelected = selectedBooking !== null;

    return (
        <div className="grid grid-cols-3 gap-4">
            {/* Events Count */}
            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                <FlagIcon size={24} className="text-cyan-500 mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Events</p>
                {isSelected ? (
                    <p className="text-lg font-bold text-foreground">
                        {selectedBooking.eventsCount}
                        <span className="text-xs font-normal text-muted-foreground"> / {globalStats.eventsCount}</span>
                    </p>
                ) : (
                    <p className="text-2xl font-bold text-foreground">{globalStats.eventsCount}</p>
                )}
            </div>

            {/* Duration */}
            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                <DurationIcon size={24} className="text-sky-400 mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                {isSelected ? (
                    <p className="text-lg font-bold text-foreground">
                        {selectedBooking.durationHours.toFixed(1)}h
                        <span className="text-xs font-normal text-muted-foreground"> / {globalStats.durationHours.toFixed(1)}h</span>
                    </p>
                ) : (
                    <p className="text-2xl font-bold text-foreground">{globalStats.durationHours.toFixed(1)}h</p>
                )}
            </div>

            {/* Payments Count */}
            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                <CreditIcon size={24} className="text-stone-500 mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Payments</p>
                {isSelected ? (
                    <p className="text-lg font-bold text-foreground">
                        {selectedBooking.paymentsCount}
                        <span className="text-xs font-normal text-muted-foreground"> / {globalStats.paymentsCount}</span>
                    </p>
                ) : (
                    <p className="text-2xl font-bold text-foreground">{globalStats.paymentsCount}</p>
                )}
            </div>
        </div>
    );
}
