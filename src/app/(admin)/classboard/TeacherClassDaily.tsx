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
import { useClassboardShareExportData } from "@/src/hooks/useClassboardShareExportData";
import { ShareContentBoard } from "./ShareContentBoard";
import { StatItemUI } from "@/backend/data/StatsData";

// Muted green - softer than entity color
const TEACHER_COLOR = "#16a34a";
const STATUS_DARK = "#6b7280"; // For inactive/sold statuses
const ACTION_CYAN = "#06b6d4";

type TeacherFilter = "active" | "all";
export default function TeacherClassDaily() {
    // 1. Context & Hook Data
    const { teacherQueues, globalFlag, selectedDate } = useClassboardContext();
    const { adminViewData, adminStats, studentViewData, teacherViewData } = useClassboardShareExportData();

    // 2. Controller & Sharing State
    const controller = globalFlag.getController();
    const sharingMode = globalFlag.getSharingMode();
    const isSharing = !!sharingMode;

    // 3. Local UI State
    const [filter, setFilter] = useState<TeacherFilter>("active");
    const [collapsedTeachers, setCollapsedTeachers] = useState<Set<string>>(new Set());

    // 4. Handlers
    const toggleCollapsed = (teacherId: string) => {
        setCollapsedTeachers((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(teacherId)) newSet.delete(teacherId);
            else newSet.add(teacherId);
            return newSet;
        });
    };

    const handleTimeIncrement = () => {
        const [hours, minutes] = controller.submitTime.split(":").map(Number);
        const newTime = `${String((hours + 1) % 24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        globalFlag.updateController({ submitTime: newTime });
    };

    const handleTimeDecrement = () => {
        const [hours, minutes] = controller.submitTime.split(":").map(Number);
        const newTime = `${String((hours - 1 + 24) % 24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        globalFlag.updateController({ submitTime: newTime });
    };

    // 5. Derived Values
    const earliestTime = useMemo(() => {
        const earliestTimes = teacherQueues.map((queue) => queue.getEarliestTime()).filter((time) => time != null);
        return earliestTimes.length === 0 ? null : earliestTimes.sort()[0];
    }, [teacherQueues.map((q) => q.getEarliestTime()).join(",")]);

    const isEarliestTimeSet = earliestTime && earliestTime === controller?.submitTime;
    const flagColor = isEarliestTimeSet ? ACTION_CYAN : STATUS_DARK;

    const handleFlagClick = () => {
        if (earliestTime) globalFlag.updateController({ submitTime: earliestTime });
    };

    const { filteredQueues, counts } = useMemo(() => {
        const onboardQueues = teacherQueues.filter((q) => q.getAllEvents().length > 0);
        return {
            filteredQueues: filter === "active" ? onboardQueues : teacherQueues,
            counts: { active: onboardQueues.length, all: teacherQueues.length },
        };
    }, [teacherQueues, filter]);

    return (
        <div className="flex flex-col h-full">
            {/* Header: Global Toggles & Filter */}
            <div className="h-16 px-6 border-b-2 border-background bg-card flex items-center gap-4 transition-colors select-none flex-shrink-0">
                {isSharing ? (
                    <>
                        <div className="text-secondary">
                            <BookingIcon className="w-7 h-7 flex-shrink-0" />
                        </div>
                        <div className="flex items-center justify-between flex-1">
                            <span className="text-lg font-bold text-foreground">
                                {new Date(selectedDate).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>

                            {adminStats && (
                                <div className="flex items-center gap-4 scale-90 origin-right">
                                    <StatItemUI type="students" value={adminStats.studentCount} iconColor={false} />
                                    <StatItemUI
                                        type="events"
                                        value={`${adminStats.completedCount}/${adminStats.eventCount}`}
                                        iconColor={false}
                                    />
                                    <StatItemUI type="duration" value={adminStats.totalDuration} iconColor={false} />
                                    <StatItemUI type="commission" value={adminStats.totalCommissions} iconColor={false} />
                                    <StatItemUI type="revenue" value={adminStats.totalRevenue} iconColor={false} />
                                    <StatItemUI
                                        type={adminStats.totalProfit >= 0 ? "profit" : "loss"}
                                        value={Math.abs(adminStats.totalProfit)}
                                        variant="primary"
                                        iconColor={false}
                                    />
                                </div>
                            )}
                        </div>
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

            {/* Main Content */}
            <div className="overflow-auto flex-1 min-h-0">
                <div className={`p-2 transition-colors ${filteredQueues.length > 0 ? "bg-card" : ""}`}>
                    {isSharing ? (
                        <ShareContentBoard
                            mode={sharingMode as "admin" | "student" | "teacher"}
                            adminData={adminViewData}
                            studentData={studentViewData}
                            teacherData={teacherViewData}
                            selectedDate={selectedDate}
                        />
                    ) : (
                        <div className="flex flex-col divide-y-2 divide-background">
                            <AnimatePresence mode="popLayout" initial={false}>
                                {filteredQueues.length > 0 &&
                                    filteredQueues.map((queue) => {
                                        const queueController = globalFlag.getQueueController(queue.teacher.id);
                                        const viewMode = !!queueController
                                            ? "adjustment"
                                            : collapsedTeachers.has(queue.teacher.id)
                                              ? "collapsed"
                                              : "expanded";

                                        return (
                                            <motion.div
                                                layout="position"
                                                key={queue.teacher.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                                className="py-2 transition-colors"
                                            >
                                                <TeacherQueueRow
                                                    queue={queue}
                                                    viewMode={viewMode}
                                                    isCollapsed={collapsedTeachers.has(queue.teacher.id)}
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

function StartTimeSection({
    controller,
    flagColor,
    onFlagClick,
    onTimeIncrement,
    onTimeDecrement,
}: {
    controller: typeof controller;
    flagColor: string;
    onFlagClick: () => void;
    onTimeIncrement: () => void;
    onTimeDecrement: () => void;
}) {
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
            <button onClick={onTimeDecrement} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Decrease hour">
                <ChevronLeft size={18} className="text-foreground" />
            </button>
            <span className="font-mono text-xl font-bold text-foreground w-12 text-center">{controller?.submitTime || "00:00"}</span>
            <button onClick={onTimeIncrement} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Increase hour">
                <ChevronRight size={18} className="text-foreground" />
            </button>
        </div>
    );
}
