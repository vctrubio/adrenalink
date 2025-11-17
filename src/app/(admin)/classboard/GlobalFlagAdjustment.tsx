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
    const [isLockFlagTime, setIsLockFlagTime] = useState(false);
    const [lockCount, setLockCount] = useState(0);

    // Get current state from globalFlag
    const isAdjustmentMode = globalFlag.isAdjustmentMode();
    const isAdjustmentLocked = globalFlag.isAdjustmentLocked();
    const stepDuration = globalFlag.getController().stepDuration || 30;

    // Recalculate global earliest time on every render to reflect queue changes
    const globalEarliestTime = globalFlag.getGlobalEarliestTime();

    const globalTime = globalFlag.getGlobalTime();

    // Initialize and sync adjustmentTime when entering adjustment mode
    useEffect(() => {
        if (globalTime && isAdjustmentMode && !adjustmentTime) {
            setAdjustmentTime(globalTime);
        }
    }, [isAdjustmentMode, globalTime, adjustmentTime]);

    const pendingTeachers = globalFlag.getPendingTeachers();
    const totalTeachers = pendingTeachers.size;

    // Create a key from all teacher queue earliest times to detect when they change
    const teachersEarliestTimesKey = teacherQueues
        .map((q) => `${q.teacher.username}:${q.getEarliestEventTime()}`)
        .join("|");

    // Memoize lock state calculation to prevent double-render flicker
    const { isLockFlagTime: computedIsLockFlagTime, lockCount: computedLockCount } = useMemo(() => {
        const pendingTeachersTimes = teacherQueues
            .filter((q) => pendingTeachers.has(q.teacher.username))
            .map((q) => ({ username: q.teacher.username, earliestTime: q.getEarliestEventTime() }))
            .filter((t) => t.earliestTime !== null) as Array<{ username: string; earliestTime: string }>;

        if (pendingTeachersTimes.length === 0 || totalTeachers === 0) {
            return { isLockFlagTime: false, lockCount: 0 };
        }

        const newGlobalEarliest = pendingTeachersTimes.reduce(
            (min, t) => {
                const minMinutes = timeToMinutes(min);
                const tMinutes = timeToMinutes(t.earliestTime);
                return tMinutes < minMinutes ? t.earliestTime : min;
            },
            pendingTeachersTimes[0].earliestTime
        );

        const synchronizedCount = pendingTeachersTimes.filter(
            (t) => t.earliestTime === newGlobalEarliest
        ).length;

        return {
            isLockFlagTime: synchronizedCount === totalTeachers,
            lockCount: synchronizedCount,
        };
    }, [teachersEarliestTimesKey, pendingTeachers, totalTeachers]);

    // Sync computed values to state
    useEffect(() => {
        setIsLockFlagTime(computedIsLockFlagTime);
        setLockCount(computedLockCount);
    }, [computedIsLockFlagTime, computedLockCount]);

    // Update adjustment time to reflect the current global earliest time from pending teachers
    useEffect(() => {
        if (isAdjustmentMode) {
            const currentGlobalEarliest = globalEarliestTime;
            if (currentGlobalEarliest && currentGlobalEarliest !== adjustmentTime) {
                setAdjustmentTime(currentGlobalEarliest);
            }
        }
    }, [globalEarliestTime, isAdjustmentMode]);

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
    }, [teacherQueues, globalFlag, globalEarliestTime]);

    const handleAdjustTime = (increment: boolean) => {
        if (!adjustmentTime) return;

        const currentMinutes = timeToMinutes(adjustmentTime);
        const newMinutes = increment ? currentMinutes + stepDuration : currentMinutes - stepDuration;

        if (newMinutes < MIN_TIME_MINUTES || newMinutes > MAX_TIME_MINUTES) return;

        const newTime = minutesToTime(newMinutes);
        setAdjustmentTime(newTime);

        // Always adjust time - in unlocked mode, only teachers at or before the new time move
        // In locked mode, all pending teachers move
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
        const earliestFromPending = globalFlag.getEarliestTimeFromPending();
        setAdjustmentTime(earliestFromPending);
        globalFlag.exitAdjustmentMode();
    };

    const handleLockToggle = () => {
        if (!isLockFlagTime && adjustmentTime) {
            // Not synchronized yet - sync all teachers to adjustment time
            globalFlag.lockToAdjustmentTime(adjustmentTime);
        }
        // If already synchronized, do nothing (button disabled anyway)
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
                        disabled={isLockFlagTime}
                        className={`p-2 rounded transition-colors ${
                            isLockFlagTime
                                ? "border border-foreground text-foreground opacity-50 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                        title={isLockFlagTime ? "All teachers synchronized" : "Lock all teachers to adjustment time"}
                    >
                        {isLockFlagTime ? (
                            <Lock className="w-5 h-5" />
                        ) : (
                            <LockOpen className="w-5 h-5" />
                        )}
                    </button>
                </div>

                <div className="text-center">
                    <div className="text-sm font-semibold text-foreground">{lockCount}/{totalTeachers}</div>
                    <div className="text-xs text-muted-foreground">Synchronized</div>
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
