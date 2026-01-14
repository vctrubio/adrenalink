"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { TeacherData } from "@/backend/data/TeacherData";
import { buildEventModels, type EventModel } from "@/backend/data/EventModel";
import { ClassboardDatePicker } from "@/src/components/ui/ClassboardDatePicker";
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
            <ClassboardDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

            {/* Stats Row */}
            <div className="flex items-center gap-6 py-3 px-4 bg-card rounded-xl border border-border">
                <StatItemUI type="events" value={`${stats.completedCount}/${stats.eventCount}`} hideLabel={false} iconColor={false} />
                <StatItemUI type="duration" value={stats.totalDuration} hideLabel={false} iconColor={false} />
                <StatItemUI type="commission" value={stats.totalEarning} hideLabel={false} variant="primary" iconColor={false} />
            </div>

            {/* Events List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {sortedEvents.length > 0 ? (
                        sortedEvents.map((event, index) => (
                            <motion.div
                                key={event.eventId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <TeacherEventCard
                                    event={event}
                                    teacherId={teacher.schema.id}
                                    teacherUsername={teacher.schema.username}
                                    currency={currency}
                                    onStatusChange={handleStatusChange}
                                    onEquipmentAssign={handleEquipmentUpdate}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 bg-card rounded-2xl border-2 border-dashed border-border text-muted-foreground"
                        >
                            No events scheduled for this day.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
