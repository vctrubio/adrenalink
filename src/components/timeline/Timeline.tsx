"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TimelineDateGroup } from "./TimelineDateGroup";
import type { TimelineEvent, TimelineDateGroup as DateGroupType } from "./types";
import type { TimelineStats } from "@/types/timeline-stats";

interface TimelineProps {
    events: TimelineEvent[];
    currency: string;
    formatCurrency: (num: number) => string;
    showTeacher?: boolean;
    showFinancials?: boolean;
}

export function Timeline({
    events,
    currency,
    formatCurrency,
    showTeacher = true,
    showFinancials = true,
}: TimelineProps) {

    // Events are already filtered and sorted upstream
    const filteredEvents = useMemo(() => {
        return events;
    }, [events]);

    // Calculate Stats
    const stats: TimelineStats = useMemo(() => {
        return filteredEvents.reduce(
            (acc, event) => ({
                eventCount: acc.eventCount + 1,
                totalDuration: acc.totalDuration + event.duration,
                totalCommission: acc.totalCommission + event.teacherEarning,
                totalRevenue: acc.totalRevenue + event.schoolRevenue,
            }),
            { eventCount: 0, totalDuration: 0, totalCommission: 0, totalRevenue: 0 },
        );
    }, [filteredEvents]);

    // Group events by date
    const eventsByDate = useMemo(() => {
        return filteredEvents.reduce(
            (acc, event) => {
                const dateKey = event.date.toDateString();
                if (!acc[dateKey]) {
                    acc[dateKey] = { date: event.date, dateLabel: event.dateLabel, dayOfWeek: event.dayOfWeek, events: [] };
                }
                acc[dateKey].events.push(event);
                return acc;
            },
            {} as Record<string, DateGroupType>,
        );
    }, [filteredEvents]);

    // Convert grouped object to array (already sorted from upstream)
    const dateGroups = useMemo(() => {
        return Object.values(eventsByDate);
    }, [eventsByDate]);

    return (
        <div className="space-y-4">
            {filteredEvents.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">No events found</div>
            ) : (
                <motion.div
                    key="timeline"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                >
                    {dateGroups.map((dateGroup) => (
                        <TimelineDateGroup
                            key={dateGroup.date.toISOString()}
                            dateGroup={dateGroup}
                            currency={currency}
                            formatCurrency={formatCurrency}
                            showTeacher={showTeacher}
                            showFinancials={showFinancials}
                        />
                    ))}
                </motion.div>
            )}
        </div>
    );
}
