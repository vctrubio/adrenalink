"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Lock, LockOpen, MapPin } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";
import type { TeacherQueue } from "@/backend/TeacherQueue";
import type { GlobalFlag } from "@/backend/models/GlobalFlag";

const MIN_TIME_MINUTES = 0;
const MAX_TIME_MINUTES = 1380;
const LOCATIONS = ["Beach", "Bay", "Lake", "River", "Pool", "Indoor"];

interface LessonFlagClassDailyProps {
    globalFlag: GlobalFlag;
    teacherQueues: TeacherQueue[];
    onSubmit: () => Promise<void>;
}

function TimeAdjustmentSection({ stepDuration, adjustmentTime, isLockFlagTime, lockCount, totalTeachers, onAdjustTime, onLockToggle }: { stepDuration: number; adjustmentTime: string | null; isLockFlagTime: boolean; lockCount: number; totalTeachers: number; onAdjustTime: (increment: boolean) => void; onLockToggle: () => void }) {
    return (
        <div className="flex items-center gap-3">
            <FlagIcon className="w-8 h-8 text-foreground flex-shrink-0" />

            <button onClick={() => onAdjustTime(false)} className="p-2 rounded hover:bg-muted transition-colors" title={`${stepDuration} minutes earlier`}>
                <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>

            <div className="text-center min-w-[70px]">
                <div className="text-xl font-semibold text-foreground">{adjustmentTime}</div>
                <div className="text-xs text-muted-foreground">
                    {lockCount}/{totalTeachers} Sync
                </div>
            </div>

            <button onClick={() => onAdjustTime(true)} className="p-2 rounded hover:bg-muted transition-colors" title={`${stepDuration} minutes later`}>
                <ChevronRight className="w-5 h-5 text-foreground" />
            </button>

            <button
                onClick={onLockToggle}
                disabled={isLockFlagTime}
                className={`p-2 rounded transition-colors ${isLockFlagTime ? "border border-foreground text-foreground opacity-50 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                title={isLockFlagTime ? "All teachers synchronized" : "Lock all teachers to adjustment time"}
            >
                {isLockFlagTime ? <Lock className="w-5 h-5" /> : <LockOpen className="w-5 h-5" />}
            </button>
        </div>
    );
}

function LocationAdjustmentSection({ locationIndex, adjustmentLocation, isLockFlagLocation, lockLocationCount, totalLocationEventsForLock, onAdjustLocationIndex, onCustomLocationEdit, onLockLocationToggle }: { locationIndex: number; adjustmentLocation: string | null; isLockFlagLocation: boolean; lockLocationCount: number; totalLocationEventsForLock: number; onAdjustLocationIndex: (increment: boolean) => void; onCustomLocationEdit: (newLocation: string) => void; onLockLocationToggle: () => void }) {
    return (
        <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-foreground flex-shrink-0" />

            <button onClick={() => onAdjustLocationIndex(false)} className="p-2 rounded hover:bg-muted transition-colors" title="Previous location">
                <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>

            <div className="text-center min-w-[90px]">
                <input
                    type="text"
                    value={adjustmentLocation || ""}
                    onChange={(e) => onCustomLocationEdit(e.target.value)}
                    className="px-2 py-1 text-sm rounded border border-input bg-background text-foreground text-center w-full text-xl font-semibold"
                    title="Click to edit custom location"
                />
            </div>

            <button onClick={() => onAdjustLocationIndex(true)} className="p-2 rounded hover:bg-muted transition-colors" title="Next location">
                <ChevronRight className="w-5 h-5 text-foreground" />
            </button>

            <button
                onClick={onLockLocationToggle}
                className={`p-2 rounded transition-colors ${isLockFlagLocation ? "border border-foreground text-foreground opacity-50 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                disabled={isLockFlagLocation}
                title={isLockFlagLocation ? "All events synchronized" : "Lock all teachers to adjustment location"}
            >
                {isLockFlagLocation ? <Lock className="w-5 h-5" /> : <LockOpen className="w-5 h-5" />}
            </button>

            <div className="text-center">
                <div className="text-xs text-muted-foreground">
                    {lockLocationCount}/{totalLocationEventsForLock} Sync
                </div>
            </div>
        </div>
    );
}

function ActionButtons({ isSubmitting, onSubmit, onReset, onCancel }: { isSubmitting: boolean; onSubmit: () => Promise<void>; onReset: () => void; onCancel: () => void }) {
    return (
        <div className="flex gap-2">
            <button onClick={onSubmit} disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? "Saving..." : "Submit"}
            </button>
            <button onClick={onReset} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
                Reset
            </button>
            <button onClick={onCancel} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium">
                Cancel
            </button>
        </div>
    );
}

function TimeSection({ globalEarliestTime, globalAdaptedCount, globalTotalTeachers, onEnterAdjustmentMode }: { globalEarliestTime: string | null; globalAdaptedCount: number; globalTotalTeachers: number; onEnterAdjustmentMode: () => void }) {
    return (
        <button onClick={onEnterAdjustmentMode} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted rounded-lg transition-colors flex-1" title="Click to adjust all event times and locations">
            <FlagIcon className="w-8 h-8 text-foreground flex-shrink-0" />
            <div className="text-left flex-1">
                <div className="text-xl font-semibold text-foreground">{globalEarliestTime}</div>
                <div className="text-xs text-muted-foreground">
                    {globalAdaptedCount}/{globalTotalTeachers} Adapted
                </div>
            </div>
        </button>
    );
}

function LocationSection({ globalLocation, adaptedLocationCount, totalLocationEvents, onEnterAdjustmentMode }: { globalLocation: string | null; adaptedLocationCount: number; totalLocationEvents: number; onEnterAdjustmentMode: () => void }) {
    return (
        <button onClick={onEnterAdjustmentMode} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted rounded-lg transition-colors flex-1" title="Click to adjust all event times and locations">
            <MapPin className="w-8 h-8 text-foreground flex-shrink-0" />
            <div className="text-left flex-1">
                <div className="text-xl font-semibold text-foreground">{globalLocation || "-"}</div>
                <div className="text-xs text-muted-foreground">
                    {adaptedLocationCount}/{totalLocationEvents} Adapted
                </div>
            </div>
        </button>
    );
}

export default function LessonFlagClassDaily({ globalFlag, teacherQueues, onSubmit }: LessonFlagClassDailyProps) {
    const [adjustmentTime, setAdjustmentTime] = useState<string | null>(null);
    const [adjustmentLocation, setAdjustmentLocation] = useState<string | null>(null);
    const [locationIndex, setLocationIndex] = useState(0);
    const [originalLocationIndex, setOriginalLocationIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLockFlagTime, setIsLockFlagTime] = useState(false);
    const [isLockFlagLocation, setIsLockFlagLocation] = useState(false);
    const [lockCount, setLockCount] = useState(0);
    const [lockLocationCount, setLockLocationCount] = useState(0);
    const [totalLocationEventsForLock, setTotalLocationEventsForLock] = useState(0);

    const isAdjustmentMode = globalFlag.isAdjustmentMode();
    const stepDuration = globalFlag.getController().stepDuration || 30;
    const globalEarliestTime = globalFlag.getGlobalEarliestTime();
    const globalLocation = globalFlag.getGlobalLocation();
    const globalTime = globalFlag.getGlobalTime();

    useEffect(() => {
        if (globalTime && isAdjustmentMode && !adjustmentTime) {
            setAdjustmentTime(globalTime);
        }
    }, [isAdjustmentMode, globalTime, adjustmentTime]);

    useEffect(() => {
        if (globalLocation && isAdjustmentMode && !adjustmentLocation) {
            setAdjustmentLocation(globalLocation);
            const index = LOCATIONS.indexOf(globalLocation);
            setLocationIndex(index >= 0 ? index : 0);
            setOriginalLocationIndex(index >= 0 ? index : 0);
        }
    }, [isAdjustmentMode, globalLocation, adjustmentLocation]);

    const pendingTeachers = globalFlag.getPendingTeachers();
    const totalTeachers = pendingTeachers.size;
    const teachersEarliestTimesKey = teacherQueues.map((q) => `${q.teacher.username}:${q.getEarliestEventTime()}`).join("|");

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

    useEffect(() => {
        setIsLockFlagTime(computedIsLockFlagTime);
        setLockCount(computedLockCount);
    }, [computedIsLockFlagTime, computedLockCount]);

    useEffect(() => {
        if (isAdjustmentMode) {
            const currentGlobalEarliest = globalEarliestTime;
            if (currentGlobalEarliest && currentGlobalEarliest !== adjustmentTime) {
                setAdjustmentTime(currentGlobalEarliest);
            }
        }
    }, [globalEarliestTime, isAdjustmentMode]);

    const teachersLocationsKey = teacherQueues
        .map((q) => {
            const events = q.getAllEvents();
            const locations = events.map((e) => e.eventData.location).join(",") || "none";
            return `${q.teacher.username}:${locations}`;
        })
        .join("|");

    const { isLockFlagLocation: computedIsLockFlagLocation, lockLocationCount: computedLockLocationCount, totalLocationEventsForLock: computedTotalLocationEventsForLock } = useMemo(() => {
        let totalEventsForLock = 0;
        let synchronizedEventsCount = 0;
        const pendingTeachersLocations: Array<{ username: string; location: string | null }> = [];

        teacherQueues
            .filter((q) => pendingTeachers.has(q.teacher.username))
            .forEach((q) => {
                const events = q.getAllEvents();
                const allLocations = events.map((e) => e.eventData.location).filter((l) => l !== null && l !== undefined);
                const allMatch = allLocations.length > 0 && allLocations.every((l) => l === allLocations[0]);

                totalEventsForLock += events.length;

                if (allMatch) {
                    pendingTeachersLocations.push({ username: q.teacher.username, location: allLocations[0] });
                } else {
                    pendingTeachersLocations.push({ username: q.teacher.username, location: null });
                }
            });

        const firstSynchronizedTeacher = pendingTeachersLocations.find((t) => t.location !== null);
        const newGlobalLocation = firstSynchronizedTeacher?.location;

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

    useEffect(() => {
        setIsLockFlagLocation(computedIsLockFlagLocation);
        setLockLocationCount(computedLockLocationCount);
        setTotalLocationEventsForLock(computedTotalLocationEventsForLock);
    }, [computedIsLockFlagLocation, computedLockLocationCount, computedTotalLocationEventsForLock]);

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
        const currentGlobalLocation = globalFlag.getGlobalLocation();
        setAdjustmentLocation(currentGlobalLocation);
        setLocationIndex(originalLocationIndex);
        const currentGlobalTime = globalFlag.getGlobalEarliestTime();
        setAdjustmentTime(currentGlobalTime);
    };

    const handleCancel = () => {
        globalFlag.discardChanges();
        const currentGlobalLocation = globalFlag.getGlobalLocation();
        setAdjustmentLocation(currentGlobalLocation);
        setLocationIndex(originalLocationIndex);
        const currentGlobalTime = globalFlag.getGlobalEarliestTime();
        setAdjustmentTime(currentGlobalTime);
        globalFlag.exitAdjustmentMode();
    };

    const handleLockToggle = () => {
        if (!isLockFlagTime && adjustmentTime) {
            globalFlag.lockToAdjustmentTime(adjustmentTime);
        }
    };

    const handleAdjustLocationIndex = (increment: boolean) => {
        let newIndex = increment ? locationIndex + 1 : locationIndex - 1;
        if (newIndex < 0) newIndex = LOCATIONS.length - 1;
        if (newIndex >= LOCATIONS.length) newIndex = 0;

        const newLocation = LOCATIONS[newIndex];
        setLocationIndex(newIndex);
        setAdjustmentLocation(newLocation);
        globalFlag.adjustLocation(newLocation);
    };

    const handleCustomLocationEdit = (newLocation: string) => {
        if (newLocation !== adjustmentLocation) {
            setAdjustmentLocation(newLocation);
            globalFlag.adjustLocation(newLocation);
        }
    };

    const handleLockLocationToggle = () => {
        if (adjustmentLocation) {
            globalFlag.lockToLocation(adjustmentLocation);
        }
    };

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

    if (!globalEarliestTime && !globalLocation) {
        return null;
    }

    if (isAdjustmentMode) {
        return (
            <div className="space-y-4">
                <TimeAdjustmentSection stepDuration={stepDuration} adjustmentTime={adjustmentTime} isLockFlagTime={isLockFlagTime} lockCount={lockCount} totalTeachers={totalTeachers} onAdjustTime={handleAdjustTime} onLockToggle={handleLockToggle} />
                <LocationAdjustmentSection locationIndex={locationIndex} adjustmentLocation={adjustmentLocation} isLockFlagLocation={isLockFlagLocation} lockLocationCount={lockLocationCount} totalLocationEventsForLock={totalLocationEventsForLock} onAdjustLocationIndex={handleAdjustLocationIndex} onCustomLocationEdit={handleCustomLocationEdit} onLockLocationToggle={handleLockLocationToggle} />
                <ActionButtons isSubmitting={isSubmitting} onSubmit={handleSubmit} onReset={handleReset} onCancel={handleCancel} />
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-4">
            <TimeSection globalEarliestTime={globalEarliestTime} globalAdaptedCount={globalAdaptedCount} globalTotalTeachers={globalTotalTeachers} onEnterAdjustmentMode={() => globalFlag.enterAdjustmentMode()} />
            <LocationSection globalLocation={globalLocation} adaptedLocationCount={adaptedLocationCount} totalLocationEvents={totalLocationEvents} onEnterAdjustmentMode={() => globalFlag.enterAdjustmentMode()} />
        </div>
    );
}
