"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
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
    const { teacherQueues, draggedBooking, globalFlag, selectedDate } = useClassboardContext();
    const controller = globalFlag.getController();
    const sharingMode = globalFlag.getSharingMode();

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
        globalFlag.updateController({ submitTime: newTime });
    };

    const handleTimeDecrement = () => {
        if (!controller) return;
        const [hours, minutes] = controller.submitTime.split(":").map(Number);
        const newHours = (hours - 1 + 24) % 24;
        const newTime = `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        globalFlag.updateController({ submitTime: newTime });
    };

    // Get earliest time from queues array (recalculate when any queue's head node changes)
    const earliestTime = useMemo(() => {
        const earliestTimes = teacherQueues
            .map((queue) => queue.getEarliestTime())
            .filter((time) => time != null);
        if (earliestTimes.length === 0) return null;
        return earliestTimes.sort()[0]; // Return earliest alphabetically (HH:MM format sorts correctly)
    }, [teacherQueues.map((q) => q.getEarliestTime()).join(",")]);

    const isEarliestTimeSet = earliestTime && earliestTime === controller?.submitTime;
    const flagColor = isEarliestTimeSet ? ACTION_CYAN : STATUS_DARK; // Cyan if matches earliest time, else muted

    const handleFlagClick = () => {
        if (earliestTime && controller) {
            globalFlag.updateController({ submitTime: earliestTime });
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
                {sharingMode ? (
                    <>
                        <div className="text-secondary">
                            <BookingIcon className="w-7 h-7 flex-shrink-0" />
                        </div>
                        <span className="text-lg font-bold text-foreground">
                            {new Date(selectedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                    </>
                ) : (
                    <>
                        <div style={{ color: TEACHER_COLOR }}>
                            <HeadsetIcon className="w-7 h-7 flex-shrink-0" />
                        </div>
                        <span className="text-lg font-bold text-foreground">Teachers</span>

                        <StartTimeSection
                            controller={controller}
                            flagColor={flagColor}
                            onFlagClick={handleFlagClick}
                            onTimeIncrement={handleTimeIncrement}
                            onTimeDecrement={handleTimeDecrement}
                        />

                        <div className="ml-auto flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                            <ToggleSwitch
                                value={filter}
                                onChange={(newFilter) => setFilter(newFilter as TeacherFilter)}
                                values={{ left: "active", right: "all" }}
                                counts={counts}
                                tintColor={TEACHER_COLOR}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Teacher List Content */}

            <div className="overflow-auto flex-1 min-h-0">
                <div className={`p-2 transition-colors ${filteredQueues.length > 0 ? "bg-card" : ""}`}>
                    {sharingMode ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 gap-4">
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                                Viewing {sharingMode} Share Mode
                            </p>
                            <div className="w-full max-w-md p-6 rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center gap-2">
                                <span className="text-xs text-muted-foreground text-center">
                                    This section will display the synchronized classboard view for {sharingMode}s.
                                </span>
                            </div>
                        </div>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
}

function StartTimeSection({ controller, flagColor, onFlagClick, onTimeIncrement, onTimeDecrement }: { controller: typeof controller; flagColor: string; onFlagClick: () => void; onTimeIncrement: () => void; onTimeDecrement: () => void }) {
    return (
        <div className="flex items-center gap-1">
            <button
                onClick={onFlagClick}
                style={{ color: flagColor }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Set to earliest time from queues"
            >
                <FlagIcon className="w-5 h-5 flex-shrink-0" />
            </button>
            <button
                onClick={onTimeDecrement}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Decrease hour"
            >
                <ChevronLeft size={18} className="text-foreground" />
            </button>
            <span className="font-mono text-xl font-bold text-foreground w-12 text-center">{controller?.submitTime || "00:00"}</span>
            <button
                onClick={onTimeIncrement}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Increase hour"
            >
                <ChevronRight size={18} className="text-foreground" />
            </button>
        </div>
    );
}
