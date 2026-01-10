"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TimelineDateGroup } from "./TimelineDateGroup";
import { TimelineHeader, type EventStatusFilter } from "./TimelineHeader";
import type { TimelineEvent, TimelineDateGroup as DateGroupType } from "./types";
import type { TimelineStats } from "@/types/timeline-stats";
import type { SortConfig } from "@/types/sort";

interface TimelineProps {
    events: TimelineEvent[];
    currency: string;
    formatCurrency: (num: number) => string;
    showTeacher?: boolean;
    showFinancials?: boolean;
    searchPlaceholder?: string;
}

export function Timeline({
    events,
    currency,
    formatCurrency,
    showTeacher = true,
    showFinancials = true,
    searchPlaceholder,
}: TimelineProps) {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortConfig>({ field: "date", direction: "desc" });
    const [filter, setFilter] = useState<EventStatusFilter>("all");

    // Filter and Sort Events
    const filteredEvents = useMemo(() => {
        let result = [...events];

        // Filter by status
        if (filter !== "all") {
            result = result.filter((event) => event.eventStatus === filter);
        }

        // Search filter
        if (search) {
            const query = search.toLowerCase();
            result = result.filter(
                (event) =>
                    event.teacherName.toLowerCase().includes(query) ||
                    event.teacherUsername.toLowerCase().includes(query) ||
                    event.location.toLowerCase().includes(query) ||
                    (event.bookingStudents &&
                        event.bookingStudents.some(
                            (s) => s.firstName.toLowerCase().includes(query) || s.lastName.toLowerCase().includes(query),
                        )),
            );
        }

        // Sort by date
        result.sort((a, b) => {
            const dateA = a.date.getTime();
            const dateB = b.date.getTime();
            return sort.direction === "desc" ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [events, filter, sort, search]);

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

    // Convert grouped object to sorted array based on sort order
    const sortedDateGroups = useMemo(() => {
        return Object.values(eventsByDate).sort((a, b) => {
            const dateA = a.date.getTime();
            const dateB = b.date.getTime();
            return sort.direction === "desc" ? dateB - dateA : dateA - dateB;
        });
    }, [eventsByDate, sort]);

    return (
        <div className="space-y-4">
            <TimelineHeader
                search={search}
                onSearchChange={setSearch}
                sort={sort}
                onSortChange={setSort}
                filter={filter}
                onFilterChange={setFilter}
                stats={stats}
                currency={currency}
                formatCurrency={formatCurrency}
                showFinancials={showFinancials}
                searchPlaceholder={searchPlaceholder}
            />

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
                    {sortedDateGroups.map((dateGroup) => (
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
