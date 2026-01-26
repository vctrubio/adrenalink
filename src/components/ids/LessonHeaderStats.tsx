"use client";

import { BOOKING_STATUS_CONFIG, LESSON_STATUS_CONFIG } from "@/types/status";
import type { BookingStatus, LessonStatus } from "@/types/status";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import { TrendingUpDown } from "lucide-react";
import { getPPP } from "@/getters/integer-getter";

export interface LessonHeaderStats {
    bookingStatus: string;
    lessonStatus: string;
    totalRevenue: number;
    totalPayments: number;
    currency: string;
}

interface LessonHeaderStatsProps {
    stats: LessonHeaderStats;
}

export function LessonHeaderStats({ stats }: LessonHeaderStatsProps) {
    const bookingStatusConfig = BOOKING_STATUS_CONFIG[stats.bookingStatus as BookingStatus] || BOOKING_STATUS_CONFIG.active;
    const lessonStatusConfig = LESSON_STATUS_CONFIG[stats.lessonStatus as LessonStatus] || LESSON_STATUS_CONFIG.active;

    return (
        <div className="bg-zinc-800 dark:bg-zinc-900 px-4 py-2.5">
            <div className="grid grid-cols-3 gap-4 text-sm">
                {/* Booking Status */}
                <div className="flex items-center gap-2">
                    <div style={{ color: bookingStatusConfig.color }}>
                        <BookingIcon size={14} />
                    </div>
                    <span
                        className="px-2 py-1 rounded text-xs font-bold uppercase"
                        style={{
                            backgroundColor: bookingStatusConfig.color + "20",
                            color: bookingStatusConfig.color,
                        }}
                    >
                        {bookingStatusConfig.label}
                    </span>
                </div>
                
                {/* Lesson Status */}
                <div className="flex items-center gap-2">
                    <div style={{ color: lessonStatusConfig.color }}>
                        <LessonIcon size={14} />
                    </div>
                    <span
                        className="px-2 py-1 rounded text-xs font-bold uppercase"
                        style={{
                            backgroundColor: lessonStatusConfig.color + "20",
                            color: lessonStatusConfig.color,
                        }}
                    >
                        {lessonStatusConfig.label}
                    </span>
                </div>
                
                {/* Payment Info - Right aligned */}
                <div className="flex items-center gap-2 justify-end">
                    <TrendingUpDown size={14} className="text-white/90" />
                    <span className="text-xs font-medium text-white/90">
                        <span className="font-bold">{getPPP(stats.totalRevenue)}</span>
                    </span>
                    <span className="text-white/60">/</span>
                    <CreditIcon size={14} className="text-white/90" />
                    <span className="text-xs font-medium text-white/90">
                        <span className="font-bold text-green-400">{getPPP(stats.totalPayments)}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
