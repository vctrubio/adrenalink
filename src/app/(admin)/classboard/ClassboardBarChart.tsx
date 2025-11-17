"use client";

import { TrendingUp } from "lucide-react";
import BookingIcon from "@/public/appSvgs/BookingIcon.jsx";
import DurationIcon from "@/public/appSvgs/DurationIcon.jsx";
import FlagIcon from "@/public/appSvgs/FlagIcon.jsx";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { GlobalStats } from "@/backend/ClassboardStats";

interface ClassboardBarChartProps {
    stats: GlobalStats;
    totalBookings: number;
}

export default function ClassboardBarChart({ stats, totalBookings }: ClassboardBarChartProps) {
    const BAR_CHART_ENTITIES = [
        {
            id: "bookings",
            name: "Bookings",
            icon: BookingIcon,
            color: "#3b82f6",
            value: totalBookings,
        },
        {
            id: "events",
            name: "Events",
            icon: FlagIcon,
            color: "#0ea5e9",
            value: stats.totalEvents,
        },
        {
            id: "duration",
            name: "Duration",
            icon: DurationIcon,
            color: "#777777",
            value: getPrettyDuration(stats.totalHours * 60),
        },
        {
            id: "revenue",
            name: "Revenue",
            icon: TrendingUp,
            color: "#10b981",
            value: `${Math.round(stats.totalEarnings.total)}€`,
        },
    ];

    return (
        <div className="grid grid-cols-4 gap-2">
            {BAR_CHART_ENTITIES.map((entity) => {
                const IconComponent = entity.icon;
                return (
                    <div key={entity.id} className="border border-border rounded-md p-4 flex flex-col items-center gap-3">
                        <div className="text-center">
                            <div className="text-base font-bold" style={{ color: entity.color }}>
                                {entity.value}
                            </div>
                        </div>
                        <div style={{ color: entity.color }}>
                            {IconComponent && <IconComponent className="w-6 h-6" />}
                        </div>
                        <span className="text-xs text-muted-foreground text-center truncate">{entity.name}</span>
                    </div>
                );
            })}
        </div>
    );
}
