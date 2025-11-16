"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Lock, LockOpen } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";
import type { TeacherQueue } from "@/backend/TeacherQueue";

interface GlobalFlagAdjustmentProps {
    globalEarliestTime: string | null;
    isAdjustmentMode: boolean;
    teacherQueues: TeacherQueue[];
    pendingParentUpdateTeachers: Set<string>;
    queueEditRefreshKey: number;
    onEnterAdjustmentMode: () => void;
    onExitAdjustmentMode: () => void;
    onTimeAdjustment: (newTime: string, isLocked: boolean) => void;
    onAdapt: () => void;
    onSubmit: () => Promise<void>;
}

export default function GlobalFlagAdjustment({
    globalEarliestTime,
    isAdjustmentMode,
    teacherQueues,
    pendingParentUpdateTeachers,
    queueEditRefreshKey,
    onEnterAdjustmentMode,
    onExitAdjustmentMode,
    onTimeAdjustment,
    onAdapt,
    onSubmit,
}: GlobalFlagAdjustmentProps) {
    const [adjustmentTime, setAdjustmentTime] = useState(globalEarliestTime);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocked, setIsLocked] = useState(true); // Locked by default - all queues match global time

    // Calculate the current earliest time from all pending teacher queues
    // This updates in real-time when pending teachers edit their queues
    const currentEarliestFromPending = useMemo(() => {
        const pendingTimes: string[] = [];
        teacherQueues.forEach((queue) => {
            if (pendingParentUpdateTeachers.has(queue.teacher.username)) {
                const earliestTime = queue.getEarliestEventTime();
                if (earliestTime) {
                    pendingTimes.push(earliestTime);
                }
            }
        });

        if (pendingTimes.length === 0) return globalEarliestTime;

        // Return the earliest time from pending teachers
        const minTimeInMinutes = Math.min(...pendingTimes.map((time) => timeToMinutes(time)));
        return minutesToTime(minTimeInMinutes);
    }, [teacherQueues, pendingParentUpdateTeachers, queueEditRefreshKey, globalEarliestTime]);

    // Sync adjustmentTime with currentEarliestFromPending when queue edits change
    // This keeps the display up-to-date while allowing the arrows to modify adjustmentTime
    useEffect(() => {
        if (currentEarliestFromPending) {
            setAdjustmentTime(currentEarliestFromPending);
        }
    }, [currentEarliestFromPending]);

    // Calculate adapted count for ADJUSTMENT MODE
    // Only count teachers in the pending parent update set
    const { adaptedCount, totalTeachers, needsAdaptation } = useMemo(() => {
        const adapted = teacherQueues.filter((queue) => {
            if (!pendingParentUpdateTeachers.has(queue.teacher.username)) return false;
            const earliestTime = queue.getEarliestEventTime();
            return earliestTime === currentEarliestFromPending;
        }).length;

        const total = pendingParentUpdateTeachers.size;
        return {
            adaptedCount: adapted,
            totalTeachers: total,
            needsAdaptation: adapted < total,
        };
    }, [teacherQueues, pendingParentUpdateTeachers, currentEarliestFromPending, queueEditRefreshKey]);

    // Calculate adapted count for NORMAL MODE
    // Count all teachers with events, not just pending ones
    const { adaptedCount: globalAdaptedCount, totalTeachers: globalTotalTeachers } = useMemo(() => {
        const teachersWithEvents = teacherQueues.filter((queue) => queue.getAllEvents().length > 0);
        const adapted = teachersWithEvents.filter((queue) => {
            const earliestTime = queue.getEarliestEventTime();
            return earliestTime === globalEarliestTime;
        }).length;

        return {
            adaptedCount: adapted,
            totalTeachers: teachersWithEvents.length,
        };
    }, [teacherQueues, globalEarliestTime]);

    const handleAdjustTime = (increment: boolean) => {
        if (!adjustmentTime) return;

        const currentMinutes = timeToMinutes(adjustmentTime);
        const newMinutes = increment ? currentMinutes + 30 : currentMinutes - 30;

        if (newMinutes < 0 || newMinutes > 1380) return;

        const newTime = minutesToTime(newMinutes);
        setAdjustmentTime(newTime);
        onTimeAdjustment(newTime, isLocked);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setAdjustmentTime(currentEarliestFromPending);
        onExitAdjustmentMode();
    };

    if (!globalEarliestTime) return null;

    if (isAdjustmentMode) {
        return (
            <div className="flex items-center gap-3">
                <FlagIcon className="w-7 h-7 text-foreground flex-shrink-0" />

                <button
                    onClick={() => handleAdjustTime(false)}
                    className="p-2 rounded hover:bg-muted transition-colors"
                    title="30 minutes earlier"
                >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>

                <div className="text-center min-w-[70px]">
                    <div className="text-sm font-semibold text-foreground">{adjustmentTime}</div>
                </div>

                <button
                    onClick={() => handleAdjustTime(true)}
                    className="p-2 rounded hover:bg-muted transition-colors"
                    title="30 minutes later"
                >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Saving..." : "Submit"}
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onAdapt();
                        }}
                        disabled={!needsAdaptation}
                        className={`px-6 py-2 rounded-md font-medium transition-colors ${
                            needsAdaptation
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "border border-foreground text-foreground hover:bg-muted/30"
                        }`}
                    >
                        Adapt
                    </button>
                </div>

                <div className="text-center">
                    <div className="text-sm font-semibold text-foreground">{adaptedCount}/{totalTeachers}</div>
                    <div className="text-xs text-muted-foreground">Adapted</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-6">
            <button
                onClick={onEnterAdjustmentMode}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg transition-colors flex-1"
                title="Click to adjust all event times globally"
            >
                <FlagIcon className="w-7 h-7 text-foreground flex-shrink-0" />
                <div>
                    <div className="text-sm font-semibold text-foreground">{globalEarliestTime}</div>
                    <div className="text-xs text-muted-foreground">Global Earliest</div>
                </div>
            </button>

            <div className="text-center">
                <div className="text-sm font-semibold text-foreground">{globalAdaptedCount}/{globalTotalTeachers}</div>
                <div className="text-xs text-muted-foreground">Adapted</div>
            </div>
        </div>
    );
}
