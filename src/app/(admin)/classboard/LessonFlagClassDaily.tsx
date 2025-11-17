"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Lock, LockOpen, MapPin } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";
import type { TeacherQueue } from "@/backend/TeacherQueue";
import type { GlobalFlag } from "@/backend/models/GlobalFlag";

// Constants for time boundaries (in minutes from 00:00)
const MIN_TIME_MINUTES = 0; // 00:00
const MAX_TIME_MINUTES = 1380; // 23:00

interface StatusCardProps {
    count: number;
    total: number;
    label: string;
}

function StatusCard({ count, total, label }: StatusCardProps) {
    return (
        <div className="bg-muted/40 rounded-lg px-3 py-2 text-center">
            <div className="text-sm font-semibold text-foreground">
                {count}/{total}
            </div>
            <div className="text-xs text-muted-foreground">{label}</div>
        </div>
    );
}

interface LessonFlagClassDailyProps {
    globalFlag: GlobalFlag;
    teacherQueues: TeacherQueue[];
    onSubmit: () => Promise<void>;
}

export default function LessonFlagClassDaily({ globalFlag, teacherQueues, onSubmit }: LessonFlagClassDailyProps) {
    const [adjustmentTime, setAdjustmentTime] = useState<string | null>(null);
    const [adjustmentLocation, setAdjustmentLocation] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLockFlagTime, setIsLockFlagTime] = useState(false);
    const [isLockFlagLocation, setIsLockFlagLocation] = useState(false);
    const [lockCount, setLockCount] = useState(0);
    const [lockLocationCount, setLockLocationCount] = useState(0);
    const [totalLocationEventsForLock, setTotalLocationEventsForLock] = useState(0);

    // Get current state from globalFlag
    const isAdjustmentMode = globalFlag.isAdjustmentMode();
    const stepDuration = globalFlag.getController().stepDuration || 30;

    // Recalculate global earliest time on every render to reflect queue changes
    const globalEarliestTime = globalFlag.getGlobalEarliestTime();
    const globalLocation = globalFlag.getGlobalLocation();

    const globalTime = globalFlag.getGlobalTime();

    // Initialize and sync adjustmentTime when entering adjustment mode
    useEffect(() => {
        if (globalTime && isAdjustmentMode && !adjustmentTime) {
            setAdjustmentTime(globalTime);
        }
    }, [isAdjustmentMode, globalTime, adjustmentTime]);

    // Initialize and sync adjustmentLocation when entering adjustment mode
    useEffect(() => {
        if (globalLocation && isAdjustmentMode && !adjustmentLocation) {
            setAdjustmentLocation(globalLocation);
        }
    }, [isAdjustmentMode, globalLocation, adjustmentLocation]);

    const pendingTeachers = globalFlag.getPendingTeachers();
    const totalTeachers = pendingTeachers.size;

    // Create a key from all teacher queue earliest times to detect when they change
    const teachersEarliestTimesKey = teacherQueues.map((q) => `${q.teacher.username}:${q.getEarliestEventTime()}`).join("|");

    // Memoize lock state calculation to prevent double-render flicker
    const { isLockFlagTime: computedIsLockFlagTime, lockCount: computedLockCount } = useMemo(() => {
        const pendingTeachersTimes = teacherQueues
            .filter((q) => pendingTeachers.has(q.teacher.username))
            .map((q) => ({ username: q.teacher.username, earliestTime: q.getEarliestEventTime() }))
            .filter((t) => t.earliestTime !== null) as Array<{ username: string; earliestTime: string }>;

        if (pendingTeachersTimes.length === 0 || totalTeachers === 0) {
            return { isLockFlagTime: false, lockCount: 0 };
        }

        const newGlobalEarliest = pendingTeachersTimes.reduce((min, t) => {
            const minMinutes = timeToMinutes(min);
            const tMinutes = timeToMinutes(t.earliestTime);
            return tMinutes < minMinutes ? t.earliestTime : min;
        }, pendingTeachersTimes[0].earliestTime);

        const synchronizedCount = pendingTeachersTimes.filter((t) => t.earliestTime === newGlobalEarliest).length;

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

    // Create a key from all teacher queue locations to detect when they change
    const teachersLocationsKey = teacherQueues
        .map((q) => {
            const events = q.getAllEvents();
            const locations = events.map((e) => e.eventData.location).join(",") || "none";
            return `${q.teacher.username}:${locations}`;
        })
        .join("|");

    // Memoize location lock state calculation
    // Check if ALL events in each queue match the same location, count by events
    const { isLockFlagLocation: computedIsLockFlagLocation, lockLocationCount: computedLockLocationCount, totalLocationEventsForLock: computedTotalLocationEventsForLock } = useMemo(() => {
        let totalEventsForLock = 0;
        let synchronizedEventsCount = 0;
        const pendingTeachersLocations: Array<{ username: string; location: string | null }> = [];

        teacherQueues
            .filter((q) => pendingTeachers.has(q.teacher.username))
            .forEach((q) => {
                const events = q.getAllEvents();
                // All events must have the same location
                const allLocations = events.map((e) => e.eventData.location).filter((l) => l !== null && l !== undefined);
                const allMatch = allLocations.length > 0 && allLocations.every((l) => l === allLocations[0]);

                totalEventsForLock += events.length;

                if (allMatch) {
                    pendingTeachersLocations.push({ username: q.teacher.username, location: allLocations[0] });
                } else {
                    pendingTeachersLocations.push({ username: q.teacher.username, location: null });
                }
            });

        // Get the global location from first synchronized teacher
        const firstSynchronizedTeacher = pendingTeachersLocations.find((t) => t.location !== null);
        const newGlobalLocation = firstSynchronizedTeacher?.location;

        // Count events that match the target location from synchronized teachers
        if (newGlobalLocation) {
            teacherQueues
                .filter((q) => pendingTeachers.has(q.teacher.username))
                .forEach((q) => {
                    const events = q.getAllEvents();
                    const queueSynchronized = pendingTeachersLocations.find((t) => t.username === q.teacher.username)?.location === newGlobalLocation;
                    if (queueSynchronized) {
                        synchronizedEventsCount += events.length;
                    }
                });
        }

        const allSynchronized = pendingTeachersLocations.every((t) => t.location === newGlobalLocation && t.location !== null);

        return {
            isLockFlagLocation: allSynchronized && newGlobalLocation !== null,
            lockLocationCount: synchronizedEventsCount,
            totalLocationEventsForLock: totalEventsForLock,
        };
    }, [teachersLocationsKey, pendingTeachers, totalTeachers]);

    // Sync computed location values to state
    useEffect(() => {
        setIsLockFlagLocation(computedIsLockFlagLocation);
        setLockLocationCount(computedLockLocationCount);
        setTotalLocationEventsForLock(computedTotalLocationEventsForLock);
    }, [computedIsLockFlagLocation, computedLockLocationCount, computedTotalLocationEventsForLock]);

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

    const handleReset = () => {
        globalFlag.discardChanges();
        // Reset location input to current global location
        const currentGlobalLocation = globalFlag.getGlobalLocation();
        setAdjustmentLocation(currentGlobalLocation);
        // Reset time to current global earliest time
        const currentGlobalTime = globalFlag.getGlobalEarliestTime();
        setAdjustmentTime(currentGlobalTime);
    };

    const handleCancel = () => {
        globalFlag.discardChanges();
        // Reset inputs to original values
        const currentGlobalLocation = globalFlag.getGlobalLocation();
        setAdjustmentLocation(currentGlobalLocation);
        const currentGlobalTime = globalFlag.getGlobalEarliestTime();
        setAdjustmentTime(currentGlobalTime);
        globalFlag.exitAdjustmentMode();
    };

    const handleLockToggle = () => {
        if (!isLockFlagTime && adjustmentTime) {
            // Not synchronized yet - sync all teachers to adjustment time
            globalFlag.lockToAdjustmentTime(adjustmentTime);
        }
        // If already synchronized, do nothing (button disabled anyway)
    };

    const handleAdjustLocation = (newLocation: string) => {
        if (newLocation !== adjustmentLocation) {
            setAdjustmentLocation(newLocation);
            globalFlag.adjustLocation(newLocation);
        }
    };

    const handleLockLocationToggle = () => {
        if (adjustmentLocation) {
            // Always set all teachers' events to the adjustment location
            globalFlag.lockToLocation(adjustmentLocation);
        }
    };

    // Calculate adapted count for location in NORMAL MODE
    // Count individual events that match the global location
    const { adaptedLocationCount, totalLocationEvents } = useMemo(() => {
        let totalEvents = 0;
        let adaptedEvents = 0;

        teacherQueues.forEach((queue) => {
            const events = queue.getAllEvents();
            events.forEach((event) => {
                totalEvents++;
                if (event.eventData.location === globalLocation) {
                    adaptedEvents++;
                }
            });
        });

        return {
            adaptedLocationCount: adaptedEvents,
            totalLocationEvents: totalEvents,
        };
    }, [teacherQueues, globalFlag, globalLocation]);

    // Only render if there are events
    if (!globalEarliestTime && !globalLocation) {
        return null;
    }

    if (isAdjustmentMode) {
        return (
            <div className="space-y-4">
                {/* Time Adjustment Section */}
                <div className="flex items-center gap-3">
                    <FlagIcon className="w-7 h-7 text-foreground flex-shrink-0" />

                    <button onClick={() => handleAdjustTime(false)} className="p-2 rounded hover:bg-muted transition-colors" title={`${stepDuration} minutes earlier`}>
                        <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>

                    <div className="text-center min-w-[70px]">
                        <div className="text-sm font-semibold text-foreground">{adjustmentTime}</div>
                    </div>

                    <button onClick={() => handleAdjustTime(true)} className="p-2 rounded hover:bg-muted transition-colors" title={`${stepDuration} minutes later`}>
                        <ChevronRight className="w-5 h-5 text-foreground" />
                    </button>

                    <button
                        onClick={handleLockToggle}
                        disabled={isLockFlagTime}
                        className={`p-2 rounded transition-colors ${isLockFlagTime ? "border border-foreground text-foreground opacity-50 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                        title={isLockFlagTime ? "All teachers synchronized" : "Lock all teachers to adjustment time"}
                    >
                        {isLockFlagTime ? <Lock className="w-5 h-5" /> : <LockOpen className="w-5 h-5" />}
                    </button>

                    <StatusCard count={lockCount} total={totalTeachers} label="Synchronized" />
                </div>

                {/* Location Adjustment Section */}
                <div className="flex items-center gap-3">
                    <MapPin className="w-7 h-7 text-foreground flex-shrink-0" />

                    <input
                        type="text"
                        value={adjustmentLocation || ""}
                        onChange={(e) => handleAdjustLocation(e.target.value)}
                        placeholder="Location"
                        className="px-2 py-1 text-sm rounded border border-input bg-background text-foreground min-w-[150px]"
                    />

                    <button
                        onClick={handleLockLocationToggle}
                        className={`p-2 rounded transition-colors ${isLockFlagLocation ? "border border-foreground text-foreground opacity-50 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                        disabled={isLockFlagLocation}
                        title={isLockFlagLocation ? "All events synchronized" : "Lock all teachers to adjustment location"}
                    >
                        {isLockFlagLocation ? <Lock className="w-5 h-5" /> : <LockOpen className="w-5 h-5" />}
                    </button>

                    <StatusCard count={lockLocationCount} total={totalLocationEventsForLock} label="Synchronized" />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? "Saving..." : "Submit"}
                    </button>
                    <button onClick={handleReset} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
                        Reset
                    </button>
                    <button onClick={handleCancel} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium">
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Time Section - Normal Mode */}
            <div className="flex items-center gap-6">
                <button onClick={() => globalFlag.enterAdjustmentMode()} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted rounded-lg transition-colors flex-1" title="Click to adjust all event times and locations">
                    <FlagIcon className="w-7 h-7 text-foreground flex-shrink-0" />
                    <div>
                        <div className="text-sm font-semibold text-foreground">{globalEarliestTime}</div>
                        <div className="text-xs text-muted-foreground">Global Earliest</div>
                    </div>
                </button>

                <StatusCard count={globalAdaptedCount} total={globalTotalTeachers} label="Adapted" />
            </div>

            {/* Location Section - Normal Mode */}
            <div className="flex items-center gap-6">
                <button onClick={() => globalFlag.enterAdjustmentMode()} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted rounded-lg transition-colors flex-1" title="Click to adjust all event times and locations">
                    <MapPin className="w-7 h-7 text-foreground flex-shrink-0" />
                    <div>
                        <div className="text-sm font-semibold text-foreground">{globalLocation || "-"}</div>
                        <div className="text-xs text-muted-foreground">Global Location</div>
                    </div>
                </button>

                <StatusCard count={adaptedLocationCount} total={totalLocationEvents} label="Adapted" />
            </div>
        </div>
    );
}
