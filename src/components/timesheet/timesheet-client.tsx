"use client";

import { useState, useMemo } from "react";
import { Timesheet, TimesheetGroup, TimesheetEntry } from "../ui/timesheet";

type ViewMode = "daily" | "weekly" | "monthly";

export type TimesheetEntryData = {
    id: string;
    title: string;
    subtitle: string;
    tagLabel: string;
    tagColor: string;
    date: Date;
};

type TimesheetClientProps = {
    entries: TimesheetEntryData[];
};

type GroupedEntries = {
    [key: string]: {
        title: string;
        entries: TimesheetEntryData[];
        totalDuration: string;
    };
};

export function TimesheetClient({ entries }: TimesheetClientProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("daily");
    const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

    // Helper functions
    const formatDate = (date: Date): string => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        }
        return date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    };

    const getWeekRange = (date: Date): string => {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
        startOfWeek.setDate(diff);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    };

    const getMonthRange = (date: Date): string => {
        return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };

    const getWeekKey = (date: Date): string => {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        return startOfWeek.toISOString().split("T")[0];
    };

    const getMonthKey = (date: Date): string => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    };


    // Group entries based on view mode
    const groupedEntries = useMemo((): GroupedEntries => {
        const groups: GroupedEntries = {};

        entries.forEach((entry) => {
            let key: string;
            let title: string;

            switch (viewMode) {
                case "daily":
                    key = entry.date.toISOString().split("T")[0];
                    title = formatDate(entry.date);
                    break;
                case "weekly":
                    key = getWeekKey(entry.date);
                    title = `Week: ${getWeekRange(entry.date)}`;
                    break;
                case "monthly":
                    key = getMonthKey(entry.date);
                    title = getMonthRange(entry.date);
                    break;
            }

            if (!groups[key]) {
                groups[key] = {
                    title,
                    entries: [],
                    totalDuration: "0:00:00",
                };
            }

            groups[key].entries.push(entry);
        });

        return groups;
    }, [entries, viewMode]);

    // Sort groups by date (most recent first)
    const sortedGroupKeys = useMemo(() => {
        return Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));
    }, [groupedEntries]);

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedEntries);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedEntries(newSelected);
    };

    return (
        <div className="space-y-6">
            {/* Timesheet */}
            <Timesheet>
                {/* Header with Search and View Toggle */}
                <div className="border-b border-white/10 p-6">
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="What are you working on?"
                            className="flex-1 bg-transparent border border-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <div className="inline-flex rounded-lg bg-slate-800 p-1">
                            {[
                                { value: "daily" as ViewMode, label: "Daily" },
                                { value: "weekly" as ViewMode, label: "Weekly" },
                                { value: "monthly" as ViewMode, label: "Monthly" },
                            ].map((view) => (
                                <button
                                    key={view.value}
                                    onClick={() => setViewMode(view.value)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        viewMode === view.value
                                            ? "bg-blue-500 text-white"
                                            : "text-white/60 hover:text-white"
                                    }`}
                                >
                                    {view.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                {sortedGroupKeys.map((groupKey) => {
                    const group = groupedEntries[groupKey];
                    return (
                        <TimesheetGroup
                            key={groupKey}
                            title={group.title}
                            trackerCount={group.entries.length}
                            totalDuration={group.totalDuration}
                        >
                            {group.entries.map((entry, index) => (
                                <TimesheetEntry
                                    key={entry.id}
                                    number={index + 1}
                                    title={entry.title}
                                    subtitle={entry.subtitle}
                                    tagLabel={entry.tagLabel}
                                    tagColor={entry.tagColor}
                                    isSelected={selectedEntries.has(entry.id)}
                                    onSelect={() => toggleSelection(entry.id)}
                                />
                            ))}
                        </TimesheetGroup>
                    );
                })}
            </Timesheet>
        </div>
    );
}
