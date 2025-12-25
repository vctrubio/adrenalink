"use client";

import { TrendingUp } from "lucide-react";
import { DateSinceBadge } from "@/src/components/ui/badge/datesince";
import { getHMDuration } from "@/getters/duration-getter";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { TimelineEventCard } from "./TimelineEventCard";
import type { TimelineDateGroup as DateGroupType, TimelineEvent } from "./types";

interface TimelineDateGroupProps {
    dateGroup: DateGroupType;
    currency: string;
    formatCurrency: (num: number) => string;
    showTeacher?: boolean;
    showFinancials?: boolean;
}

export function TimelineDateGroup({ dateGroup, currency, formatCurrency, showTeacher = true, showFinancials = true }: TimelineDateGroupProps) {
    const { date, dayOfWeek, events } = dateGroup;
    const totalDuration = events.reduce((sum, e) => sum + e.duration, 0);
    const totalSchoolRevenue = events.reduce((sum, e) => sum + e.schoolRevenue, 0);

    return (
        <div className="relative">
            <div className="flex items-center gap-3 mb-3">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-muted/50 border border-border/50">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide leading-none">{dayOfWeek}</span>
                    <span className="text-xl font-black leading-none text-foreground mt-0.5">{date.getDate()}</span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <DateSinceBadge date={date} />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FlagIcon size={14} />
                    <span>{events.length}</span>
                    <DurationIcon size={14} />
                    <span>{getHMDuration(totalDuration)}</span>
                    {showFinancials && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                            <TrendingUp size={14} />
                            <span>{(Math.round(totalSchoolRevenue * 100) / 100).toString()}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="ml-7 border-l-2 border-border pl-6 space-y-3">
                {events.map((event) => (
                    <TimelineEventCard key={event.eventId} event={event} currency={currency} formatCurrency={formatCurrency} showTeacher={showTeacher} showFinancials={showFinancials} />
                ))}
            </div>
        </div>
    );
}
