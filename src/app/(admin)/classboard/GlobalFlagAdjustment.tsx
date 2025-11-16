"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Lock, LockOpen } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";
import type { TeacherQueue } from "@/backend/TeacherQueue";
import type { GlobalFlag } from "@/backend/models/GlobalFlag";

// Constants for time boundaries (in minutes from 00:00)
const MIN_TIME_MINUTES = 0; // 00:00
const MAX_TIME_MINUTES = 1380; // 23:00

interface GlobalFlagAdjustmentProps {
    globalFlag: GlobalFlag;
    teacherQueues: TeacherQueue[];
    onSubmit: () => Promise<void>;
}

export default function GlobalFlagAdjustment({
    globalFlag,
    teacherQueues,
    onSubmit,
}: GlobalFlagAdjustmentProps) {
    const [adjustmentTime, setAdjustmentTime] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get current state from globalFlag
    const globalEarliestTime = globalFlag.getGlobalEarliestTime();
    const isAdjustmentMode = globalFlag.isAdjustmentMode();
    const isAdjustmentLocked = globalFlag.isAdjustmentLocked();
    const stepDuration = globalFlag.getController().stepDuration || 30;

    // Sync adjustmentTime when globalFlag time changes
    useEffect(() => {
        const newTime = globalFlag.getGlobalTime();
        if (newTime) {
            setAdjustmentTime(newTime);
        }
    }, [globalFlag]);

    // Calculate the current earliest time from all pending teacher queues
    // This updates in real-time when pending teachers edit their queues
    const currentEarliestFromPending = useMemo(() => {
        const pendingTimes: string[] = [];
        const pendingTeachers = globalFlag.getPendingTeachers();
        const globalEarliestTime = globalFlag.getGlobalEarliestTime();

        teacherQueues.forEach((queue) => {
            if (pendingTeachers.has(queue.teacher.username)) {
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
    }, [teacherQueues, globalFlag]);

    // Calculate adapted count for ADJUSTMENT MODE
    // Only count teachers in the pending parent update set
    const { adaptedCount, totalTeachers, needsAdaptation } = useMemo(() => {
        const pendingTeachers = globalFlag.getPendingTeachers();
        const adapted = teacherQueues.filter((queue) => {
            if (!pendingTeachers.has(queue.teacher.username)) return false;
            const earliestTime = queue.getEarliestEventTime();
            return earliestTime === currentEarliestFromPending;
        }).length;

        const total = pendingTeachers.size;
        return {
            adaptedCount: adapted,
            totalTeachers: total,
            needsAdaptation: adapted < total,
        };
    }, [teacherQueues, globalFlag, currentEarliestFromPending]);

    // Calculate adapted count for NORMAL MODE
    // Count all teachers with events, not just pending ones
    const { adaptedCount: globalAdaptedCount, totalTeachers: globalTotalTeachers } = useMemo(() => {
        const globalEarliestTime = globalFlag.getGlobalEarliestTime();
        const teachersWithEvents = teacherQueues.filter((queue) => queue.getAllEvents().length > 0);
        const adapted = teachersWithEvents.filter((queue) => {
            const earliestTime = queue.getEarliestEventTime();
            return earliestTime === globalEarliestTime;
        }).length;

        return {
            adaptedCount: adapted,
            totalTeachers: teachersWithEvents.length,
        };
    }, [teacherQueues, globalFlag]);

    const handleAdjustTime = (increment: boolean) => {
        if (!adjustmentTime) return;

        const currentMinutes = timeToMinutes(adjustmentTime);
        const newMinutes = increment ? currentMinutes + stepDuration : currentMinutes - stepDuration;

        if (newMinutes < MIN_TIME_MINUTES || newMinutes > MAX_TIME_MINUTES) return;

        const newTime = minutesToTime(newMinutes);
        setAdjustmentTime(newTime);
        globalFlag.adjustTime(newTime);
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
        globalFlag.exitAdjustmentMode();
    };

    const handleLockToggle = () => {
        globalFlag.adapt();
    };

    if (!globalEarliestTime) return null;

    if (isAdjustmentMode) {
        return (
            <div className="flex items-center gap-3">
                <FlagIcon className="w-7 h-7 text-foreground flex-shrink-0" />

                <button
                    onClick={() => handleAdjustTime(false)}
                    className="p-2 rounded hover:bg-muted transition-colors"
                    title={`${stepDuration} minutes earlier`}
                >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>

                <div className="text-center min-w-[70px]">
                    <div className="text-sm font-semibold text-foreground">{adjustmentTime}</div>
                </div>

                <button
                    onClick={() => handleAdjustTime(true)}
                    className="p-2 rounded hover:bg-muted transition-colors"
                    title={`${stepDuration} minutes later`}
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
                        onClick={handleLockToggle}
                        className={`p-2 rounded transition-colors ${
                            adaptedCount === totalTeachers
                                ? "border border-foreground text-foreground hover:bg-muted/50"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                        title={adaptedCount === totalTeachers ? "Unlock all teachers" : "Lock all teachers to adjustment time"}
                    >
                        {adaptedCount === totalTeachers ? (
                            <Lock className="w-5 h-5" />
                        ) : (
                            <LockOpen className="w-5 h-5" />
                        )}
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
                onClick={() => globalFlag.enterAdjustmentMode()}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted rounded-lg transition-colors flex-1"
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
