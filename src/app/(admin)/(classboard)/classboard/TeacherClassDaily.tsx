"use client";

import { useState, useMemo, useRef } from "react";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import TeacherQueueRow from "./TeacherQueueRow";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import type { TeacherQueue } from "@/src/app/(admin)/(classboard)/TeacherQueue";

// Muted green - softer than entity color
const TEACHER_COLOR = "#16a34a";

type TeacherFilter = "active" | "all";

/**
 * TeacherClassDaily - Displays teacher queues in a list
 * Teachers are never removed, just filtered by "active" (has events) vs "all"
 *
 * Reads teacherQueues from hook context for proper re-render tracking
 * Gets gapMinutes from GlobalFlag (single source of truth)
 */
export default function TeacherClassDaily() {
    const { teacherQueues, draggedBooking, globalFlag } = useClassboardContext();
    const renderCount = useRef(0);
    renderCount.current++;

    // Get gapMinutes from GlobalFlag (single source of truth)
    const gapMinutes = globalFlag.getController().gapMinutes;

    console.log(`🏫 [TeacherClassDaily] Render #${renderCount.current} | Queues: ${teacherQueues.length} | Gap: ${gapMinutes}min`);

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
            const events = queue.getAllEvents();
            const hasEvents = events.length > 0;

            if (hasEvents) {
                activeQueues.push(queue);
            }
        });

        const counts = {
            active: activeQueues.length,
            all: allQueues.length,
        };

        console.log(`👨‍🏫 [TeacherClassDaily] Filter: "${filter}" | Active: ${counts.active}/${counts.all} teachers with events`);

        return {
            filteredQueues: filter === "active" ? activeQueues : allQueues,
            counts,
        };
    }, [teacherQueues, filter]);

    return (
        <div className={`flex flex-col h-full transition-colors ${draggedBooking ? "bg-green-500/10" : ""}`}>
            {/* Header: Global Toggles & Filter */}
            <div className="p-4 px-6 border-b-2 border-background bg-card flex items-center gap-4 transition-colors select-none flex-shrink-0">
                <div style={{ color: TEACHER_COLOR }}>
                    <HeadsetIcon className="w-7 h-7 flex-shrink-0" />
                </div>
                <span className="text-lg font-bold text-foreground">Teachers</span>
                <div className="ml-auto flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <ToggleSwitch
                        value={filter}
                        onChange={(newFilter) => {
                            console.log("🔄 [TeacherClassDaily] Filter changed to:", newFilter);
                            setFilter(newFilter as TeacherFilter);
                        }}
                        values={{ left: "active", right: "all" }}
                        counts={counts}
                        tintColor={TEACHER_COLOR}
                    />
                </div>
            </div>

            {/* Teacher List Content */}
            <div className="overflow-auto flex-1 min-h-0">
                <div className="p-2 bg-card">
                    <div className="flex flex-col divide-y-2 divide-background">
                        {filteredQueues.length > 0 ? (
                            filteredQueues.map((queue, index) => {
                                const isCollapsed = collapsedTeachers.has(queue.teacher.id);
                                const queueController = globalFlag.getQueueController(queue.teacher.id);
                                const isAdjustmentMode = !!queueController;
                                const viewMode = isAdjustmentMode ? "adjustment" : isCollapsed ? "collapsed" : "expanded";

                                return (
                                    <div key={index} className={"py-2 transition-colors"}>
                                        <TeacherQueueRow
                                            queue={queue}
                                            viewMode={viewMode}
                                            isCollapsed={isCollapsed}
                                            onToggleCollapse={() => toggleCollapsed(queue.teacher.id)}
                                        />
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex items-center justify-center w-full h-16 text-xs text-muted-foreground/20">No {filter} teachers</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
