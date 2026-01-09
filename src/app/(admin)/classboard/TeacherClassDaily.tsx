"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import TeacherQueueRow from "./TeacherQueueRow";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import type { TeacherQueue } from "@/backend/classboard/TeacherQueue";

// Muted green - softer than entity color
const TEACHER_COLOR = "#16a34a";

type TeacherFilter = "active" | "all";
export default function TeacherClassDaily() {
    const { teacherQueues, draggedBooking, globalFlag, selectedDate } = useClassboardContext();

    // Get gapMinutes from GlobalFlag (single source of truth)
    const gapMinutes = globalFlag.getController().gapMinutes;

    const [filter, setFilter] = useState<TeacherFilter>("active");
    const [collapsedTeachers, setCollapsedTeachers] = useState<Set<string>>(new Set());

    const toggleCollapsed = (teacherId: string) => {
        setCollapsedTeachers((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(teacherId)) {
                newSet.delete(teacherId);
            } else {
                newSet.add(teacherId);
            }
            return newSet;
        });
    };

    // Filter teachers based on whether they have events
    const { filteredQueues, counts } = useMemo(() => {
        const activeQueues: TeacherQueue[] = [];
        const allQueues: TeacherQueue[] = teacherQueues;

        teacherQueues.forEach((queue) => {
            // TeacherQueue now handles its own active/optimistic events
            const events = queue.getAllEvents();
            if (events.length > 0) {
                activeQueues.push(queue);
            }
        });

        const counts = {
            active: activeQueues.length,
            all: allQueues.length,
        };

        return {
            filteredQueues: filter === "active" ? activeQueues : allQueues,
            counts,
        };
    }, [teacherQueues, filter, selectedDate]);

    return (
        <div className={`flex flex-col h-full transition-colors ${draggedBooking ? "bg-green-500/10" : ""}`}>
            {/* Header: Global Toggles & Filter */}
            <div className="p-4 px-6 border-b-2 border-background bg-card flex items-center gap-4 transition-colors select-none flex-shrink-0">
                <div style={{ color: TEACHER_COLOR }}>
                    <HeadsetIcon className="w-7 h-7 flex-shrink-0" />
                </div>
                <span className="text-lg font-bold text-foreground">Teachers</span>
                <div className="ml-auto flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <ToggleSwitch value={filter} onChange={(newFilter) => setFilter(newFilter as TeacherFilter)} values={{ left: "active", right: "all" }} counts={counts} tintColor={TEACHER_COLOR} />
                </div>
            </div>

            {/* Teacher List Content */}

            <div className="overflow-auto flex-1 min-h-0">
                <div className={`p-2 transition-colors ${filteredQueues.length > 0 ? "bg-card" : ""}`}>
                    <div className="flex flex-col divide-y-2 divide-background">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {filteredQueues.length > 0 &&
                                filteredQueues.map((queue) => {
                                    const isCollapsed = collapsedTeachers.has(queue.teacher.id);

                                    const queueController = globalFlag.getQueueController(queue.teacher.id);

                                    const isAdjustmentMode = !!queueController;

                                    const viewMode = isAdjustmentMode ? "adjustment" : isCollapsed ? "collapsed" : "expanded";

                                    return (
                                        <motion.div
                                            layout="position"
                                            key={queue.teacher.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{
                                                duration: 0.6,

                                                ease: [0.22, 1, 0.36, 1],
                                            }}
                                            className="py-2 transition-colors"
                                        >
                                            <TeacherQueueRow queue={queue} viewMode={viewMode} isCollapsed={isCollapsed} onToggleCollapse={() => toggleCollapsed(queue.teacher.id)} />
                                        </motion.div>
                                    );
                                })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
