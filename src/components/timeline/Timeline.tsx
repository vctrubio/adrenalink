"use client";

import { motion } from "framer-motion";
import { TimelineDateGroup } from "./TimelineDateGroup";
import type { TimelineEvent, TimelineDateGroup as DateGroupType } from "./types";

interface TimelineProps {
    events: TimelineEvent[];
    currency: string;
    formatCurrency: (num: number) => string;
    showTeacher?: boolean;
    showFinancials?: boolean;
}

export function Timeline({ events, currency, formatCurrency, showTeacher = true, showFinancials = true }: TimelineProps) {
    // Group events by date
    const eventsByDate = events.reduce((acc, event) => {
        const dateKey = event.date.toDateString();
        if (!acc[dateKey]) {
            acc[dateKey] = { date: event.date, dateLabel: event.dateLabel, dayOfWeek: event.dayOfWeek, events: [] };
        }
        acc[dateKey].events.push(event);
        return acc;
    }, {} as Record<string, DateGroupType>);

    const sortedDates = Object.values(eventsByDate).sort((a, b) => a.date.getTime() - b.date.getTime());

    if (events.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
                No events found
            </div>
        );
    }

    return (
        <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {sortedDates.map((dateGroup) => (
                <TimelineDateGroup key={dateGroup.date.toISOString()} dateGroup={dateGroup} currency={currency} formatCurrency={formatCurrency} showTeacher={showTeacher} showFinancials={showFinancials} />
            ))}
        </motion.div>
    );
}
