"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import TeacherQueueRow from "./TeacherQueueRow";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import type { TeacherQueue } from "@/backend/classboard/TeacherQueue";

// Muted green - softer than entity color
const TEACHER_COLOR = "#16a34a";
const STATUS_DARK = "#6b7280"; // For inactive/sold statuses
const ACTION_CYAN = "#06b6d4";

type TeacherFilter = "active" | "all";
export default function TeacherClassDaily() {
    const { teacherQueues, draggedBooking, globalFlag, selectedDate, controller, setController } = useClassboardContext();

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

    const handleTimeIncrement = () => {
        if (!controller) return;
        const [hours, minutes] = controller.submitTime.split(":").map(Number);
        const newHours = (hours + 1) % 24;
        const newTime = `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        setController({ ...controller, submitTime: newTime });
    };

    const handleTimeDecrement = () => {
        if (!controller) return;
        const [hours, minutes] = controller.submitTime.split(":").map(Number);
        const newHours = (hours - 1 + 24) % 24;
        const newTime = `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        setController({ ...controller, submitTime: newTime });
    };

    // Get earliest time from queues array
    const earliestTime = useMemo(() => {
        const earliestTimes = teacherQueues
            .map((queue) => queue.getEarliestTime())
            .filter((time) => time != null);
        if (earliestTimes.length === 0) return null;
        return earliestTimes.sort()[0]; // Return earliest alphabetically (HH:MM format sorts correctly)
    }, [teacherQueues]);

    const isEarliestTimeSet = earliestTime && earliestTime === controller?.submitTime;
    const flagColor = isEarliestTimeSet ? ACTION_CYAN : STATUS_DARK; // Cyan if matches earliest time, else muted

    const handleFlagClick = () => {
        if (earliestTime && controller) {
            setController({ ...controller, submitTime: earliestTime });
        }
    };

    // Filter teachers based on their registry status and current activity
    const { filteredQueues, counts } = useMemo(() => {
        const onboardQueues: TeacherQueue[] = [];
        const allQueues: TeacherQueue[] = teacherQueues;

        teacherQueues.forEach((queue) => {
            const hasEvents = queue.getAllEvents().length > 0;

            // 'Active' view now strictly means: Has events today
            if (hasEvents) {
                onboardQueues.push(queue);
            }
        });

        const counts = {
            active: onboardQueues.length,
            all: allQueues.length,
        };

        return {
            filteredQueues: filter === "active" ? onboardQueues : allQueues,
            counts,
        };
    }, [teacherQueues, filter, selectedDate]);

    return (
        <div className="flex flex-col h-full bg-card">
            {/* Header: Global Toggles & Filter */}
            <div className="p-4 px-6 border-b-2 border-background bg-card flex items-center gap-4 transition-colors select-none flex-shrink-0">
                <div style={{ color: TEACHER_COLOR }}>
                    <HeadsetIcon className="w-7 h-7 flex-shrink-0" />
                </div>
                <span className="text-lg font-bold text-foreground">Teachers</span>

                {/* Start Time Section - Grouped */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleFlagClick}
                        style={{ color: flagColor }}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title="Set to earliest time from queues"
                    >
                        <FlagIcon className="w-5 h-5 flex-shrink-0" />
                    </button>
                    <button
                        onClick={handleTimeDecrement}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title="Decrease hour"
                    >
                        <ChevronLeft size={18} className="text-foreground" />
                    </button>
                    <span className="font-mono text-xl font-bold text-foreground w-12 text-center">{controller?.submitTime || "00:00"}</span>
                    <button
                        onClick={handleTimeIncrement}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title="Increase hour"
                    >
                        <ChevronRight size={18} className="text-foreground" />
                    </button>
                </div>

                <div className="ml-auto flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <ToggleSwitch
                        value={filter}
                        onChange={(newFilter) => setFilter(newFilter as TeacherFilter)}
                        values={{ left: "active", right: "all" }}
                        counts={counts}
                        tintColor={TEACHER_COLOR}
                    />
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
                                            <TeacherQueueRow
                                                queue={queue}
                                                viewMode={viewMode}
                                                isCollapsed={isCollapsed}
                                                onToggleCollapse={() => toggleCollapsed(queue.teacher.id)}
                                            />
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
