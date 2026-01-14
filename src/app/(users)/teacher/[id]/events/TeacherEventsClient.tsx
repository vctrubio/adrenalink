"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import type { TeacherData } from "@/backend/data/TeacherData";
import { buildEventModels, type EventModel } from "@/backend/data/EventModel";
import { TeacherEventCard } from "./TeacherEventCard";
import { StatItemUI } from "@/backend/data/StatsData";
import { getTodayDateString } from "@/getters/date-getter";
import { getClientConnection } from "@/supabase/connection";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";

interface TeacherEventsClientProps {
    teacher: TeacherData;
    schoolId?: string;
    currency: string;
    timezone?: string;
}

export function TeacherEventsClient({ teacher, schoolId, currency, timezone }: TeacherEventsClientProps) {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

    // Date Logic
    const dateObj = new Date(selectedDate + "T00:00:00");
    const today = new Date(getTodayDateString() + "T00:00:00");

    // Formatters
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const dayNumber = dateObj.getDate();
    const monthShort = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

    // Time difference logic
    const diffTime = dateObj.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const isToday = diffDays === 0;

    const formatDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handlePreviousDay = () => {
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(formatDateString(newDate));
    };

    const handleNextDay = () => {
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(formatDateString(newDate));
    };

    const handleToday = () => {
        setSelectedDate(getTodayDateString());
    };

    // Format relative days badge text
    const showBadge = diffDays !== 0;
    const badgeText =
        diffDays === 1 ? "Tomorrow" : diffDays === -1 ? "Yesterday" : `${diffDays > 0 ? "+" : "-"}${Math.abs(diffDays)}d`;

    // Build all event models from teacher's lessons
    const allEvents = useMemo(() => {
        const lessons = teacher.relations?.lesson || [];
        return buildEventModels(lessons, {
            id: teacher.schema.id,
            first_name: teacher.schema.first_name,
            username: teacher.schema.username,
        });
    }, [teacher]);

    // Filter events for selected date
    const eventsForDate = useMemo(() => {
        return allEvents.filter((event) => {
            const eventDateStr = event.date.toISOString().split("T")[0];
            return eventDateStr === selectedDate;
        });
    }, [allEvents, selectedDate]);

    // Sort by time
    const sortedEvents = useMemo(() => {
        return [...eventsForDate].sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [eventsForDate]);

    // Calculate stats for the day
    const stats = useMemo(() => {
        let totalDuration = 0;
        let totalEarning = 0;
        let completedCount = 0;

        sortedEvents.forEach((event) => {
            totalDuration += event.duration;
            totalEarning += event.teacherEarning;
            if (event.eventStatus === "completed") {
                completedCount++;
            }
        });

        return {
            eventCount: sortedEvents.length,
            completedCount,
            totalDuration,
            totalHours: totalDuration / 60,
            totalEarning,
        };
    }, [sortedEvents]);

    // Real-time subscription for event updates
    useEffect(() => {
        if (!schoolId) return;

        const supabase = getClientConnection();

        const channel = supabase
            .channel(`teacher_events_${teacher.schema.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "event",
                    filter: `school_id=eq.${schoolId}`,
                },
                (payload) => {
                    console.log("[TeacherEventsClient] Event change detected:", payload);
                    // Refresh the page data
                    router.refresh();
                },
            )
            .subscribe((status) => {
                console.log(`[TeacherEventsClient] Subscription status: ${status}`);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [schoolId, teacher.schema.id, router]);

    const handleEquipmentUpdate = useCallback(() => {
        router.refresh();
    }, [router]);

    const handleStatusChange = useCallback(() => {
        router.refresh();
    }, [router]);

    return (
        <div className="space-y-6">
            {/* Date Picker Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">My Schedule</h2>
            </div>

            {/* Date Picker */}
            <div className="w-full flex items-stretch border border-border/30 rounded-lg overflow-hidden shadow-sm select-none min-h-32 bg-card">
                {/* Main Content: Navigation & Date */}
                <div className="flex-1 flex items-center justify-center gap-6 py-4 px-4 relative">
                    {/* Previous Button */}
                    <button
                        onClick={handlePreviousDay}
                        className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-slate-800 dark:hover:border-slate-200 bg-transparent flex items-center justify-center transition-all group active:scale-95"
                    >
                        <Play
                            size={16}
                            className="rotate-180 text-slate-400 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-slate-200 fill-current transition-colors"
                            strokeWidth={3}
                        />
                    </button>

                    {/* Date Display */}
                    <div className="flex items-center gap-6">
                        {/* Date Number Block */}
                        <div className="flex flex-col items-center leading-none">
                            <span className="text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tighter">
                                {dayNumber}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 ml-1">{monthShort}</span>
                        </div>

                        {/* Day Info Block */}
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-none">{dayName}</span>

                            <div className="flex items-center gap-2 h-4">
                                {/* Relative Badge (Tomorrow, Yesterday, or -Xd/Xd) */}
                                {showBadge && (
                                    <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-full min-w-[28px] text-center">
                                        {badgeText}
                                    </span>
                                )}

                                {/* Today Label (Underlined when active) */}
                                {isToday && (
                                    <span className="text-[10px] font-black text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white pb-0.5 tracking-wider">
                                        TODAY
                                    </span>
                                )}

                                {/* Always show Today button as a shortcut if not today */}
                                {!isToday && (
                                    <button
                                        onClick={handleToday}
                                        className="text-[9px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider border-b border-transparent hover:border-slate-900 dark:hover:border-white"
                                    >
                                        Today
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={handleNextDay}
                        className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-slate-800 dark:hover:border-slate-200 bg-transparent flex items-center justify-center transition-all group active:scale-95"
                    >
                        <Play
                            size={12}
                            className="text-slate-400 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-slate-200 fill-current transition-colors"
                            strokeWidth={3}
                        />
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-6 py-3 px-4 bg-card rounded-xl border border-border">
                <StatItemUI type="events" value={`${stats.completedCount}/${stats.eventCount}`} hideLabel={false} iconColor={false} />
                <StatItemUI type="duration" value={stats.totalDuration} hideLabel={false} iconColor={false} />
                <StatItemUI type="commission" value={stats.totalEarning} hideLabel={false} variant="primary" iconColor={false} />
            </div>

            {/* Events List */}
            <div className="space-y-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedDate}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                    >
                        {sortedEvents.length > 0 ? (
                            sortedEvents.map((event) => (
                                <TeacherEventCard
                                    key={event.eventId}
                                    event={event}
                                    teacherId={teacher.schema.id}
                                    teacherUsername={teacher.schema.username}
                                    currency={currency}
                                    onStatusChange={handleStatusChange}
                                    onEquipmentAssign={handleEquipmentUpdate}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 bg-card rounded-2xl border-2 border-dashed border-border text-muted-foreground">
                                No events scheduled for this day.
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
