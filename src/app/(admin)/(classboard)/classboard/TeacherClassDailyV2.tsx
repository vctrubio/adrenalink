"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import type { TeacherQueue } from "@/backend/TeacherQueue";

// Muted green - softer than entity color
const TEACHER_COLOR = "#16a34a";

interface TeacherClassDailyV2Props {
    teacherQueues: TeacherQueue[];
    selectedDate: string;
}

type TeacherFilter = "pending" | "completed";

export default function TeacherClassDailyV2({ 
    teacherQueues, 
    selectedDate 
}: TeacherClassDailyV2Props) {
    const [filter, setFilter] = useState<TeacherFilter>("pending");
    const [isExpanded, setIsExpanded] = useState(true);

    const { filteredQueues, counts } = useMemo(() => {
        // Filter queues based on event status
        const pendingQueues: TeacherQueue[] = [];
        const completedQueues: TeacherQueue[] = [];

        teacherQueues.forEach((queue) => {
            const events = queue.getAllEvents();
            const todayEvents = events.filter((event) => {
                if (!event.eventData.date) return false;
                const eventDate = new Date(event.eventData.date).toISOString().split("T")[0];
                return eventDate === selectedDate;
            });

            // Check if all today's events are completed
            const allCompleted = todayEvents.length > 0 && todayEvents.every((e) => e.eventData.status === "COMPLETED");
            const hasPending = todayEvents.some((e) => e.eventData.status !== "COMPLETED");

            if (allCompleted) {
                completedQueues.push(queue);
            } else if (hasPending || todayEvents.length === 0) {
                pendingQueues.push(queue);
            }
        });

        const counts = {
            pending: pendingQueues.length,
            completed: completedQueues.length,
        };

        return { 
            filteredQueues: filter === "pending" ? pendingQueues : completedQueues, 
            counts 
        };
    }, [teacherQueues, selectedDate, filter]);

    return (
        <div className="flex flex-col">
            {/* Header with Icon and Switch */}
            <div 
                className="p-4 px-6 border-b border-border flex items-center gap-4 cursor-pointer hover:bg-muted/30 active:bg-muted/50 transition-colors select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div style={{ color: TEACHER_COLOR }}>
                    <HeadsetIcon className="w-7 h-7 flex-shrink-0" />
                </div>
                <span className="text-lg font-bold text-foreground">Teachers</span>
                <div className="ml-auto flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <ToggleSwitch 
                        value={filter} 
                        onChange={(newFilter) => setFilter(newFilter as TeacherFilter)} 
                        values={{ left: "pending", right: "completed" }} 
                        counts={counts} 
                        tintColor={TEACHER_COLOR}
                    />
                </div>
            </div>

            {/* Collapsible Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-4">
                            <div className="flex flex-row flex-wrap gap-3">
                                {filteredQueues.length > 0 ? (
                                    filteredQueues.map((queue) => (
                                        <TeacherQueueCard 
                                            key={queue.teacher.username} 
                                            queue={queue} 
                                            selectedDate={selectedDate}
                                        />
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center w-full h-16 text-xs text-muted-foreground/20">
                                        No {filter} teachers
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Simple teacher queue card component
function TeacherQueueCard({ queue, selectedDate }: { queue: TeacherQueue; selectedDate: string }) {
    const events = queue.getAllEvents();
    const todayEvents = events.filter((event) => {
        if (!event.eventData.date) return false;
        const eventDate = new Date(event.eventData.date).toISOString().split("T")[0];
        return eventDate === selectedDate;
    });

    const completedCount = todayEvents.filter((e) => e.eventData.status === "COMPLETED").length;
    const pendingCount = todayEvents.filter((e) => e.eventData.status !== "COMPLETED").length;
    const totalDuration = todayEvents.reduce((sum, e) => sum + (e.eventData.duration || 0), 0);

    return (
        <div className="w-[200px] flex-shrink-0 bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-4 space-y-3">
                {/* Teacher Name */}
                <div className="flex items-center gap-2">
                    <HeadsetIcon size={16} style={{ color: TEACHER_COLOR }} />
                    <span className="font-semibold text-foreground truncate">{queue.teacher.username}</span>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            {pendingCount}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {completedCount}
                        </span>
                    </div>
                    <span className="font-medium">{totalDuration}m</span>
                </div>
            </div>
        </div>
    );
}
