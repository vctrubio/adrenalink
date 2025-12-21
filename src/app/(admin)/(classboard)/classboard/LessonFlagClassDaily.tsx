"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Lock, LockOpen, MapPin } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";
import { ACTION_BUTTON_CONFIG } from "@/types/status";
import type { TeacherQueue } from "@/backend/TeacherQueue";
import type { GlobalFlag } from "@/backend/models/GlobalFlag";

const MIN_TIME_MINUTES = 0;
const MAX_TIME_MINUTES = 1380;
const LOCATIONS = ["Beach", "Bay", "Lake", "River", "Pool", "Indoor"];

interface LessonFlagClassDailyProps {
    globalFlag: GlobalFlag;
    teacherQueues: TeacherQueue[];
    onSubmit: () => Promise<void>;
    selectedDate: string;
}

function TimeAdjustmentSection({ stepDuration, adjustmentTime, isLockFlagTime, lockCount, totalTeachers, onAdjustTime, onLockToggle, onCustomTimeEdit }: { stepDuration: number; adjustmentTime: string | null; isLockFlagTime: boolean; lockCount: number; totalTeachers: number; onAdjustTime: (increment: boolean) => void; onLockToggle: () => void; onCustomTimeEdit: (newTime: string) => void }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 px-1">
                <FlagIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                <div className="text-xs text-muted-foreground font-medium">Start Time</div>
                <div className="text-[10px] text-muted-foreground ml-auto">
                    {lockCount}/{totalTeachers}
                </div>
            </div>
            <div className="flex items-center gap-1.5 bg-background rounded-md px-2 py-1.5 border border-border">
                <button onClick={() => onAdjustTime(false)} className="p-1 rounded hover:bg-muted transition-colors" title={`${stepDuration} minutes earlier`}>
                    <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>

                <input
                    type="text"
                    value={adjustmentTime || ""}
                    onChange={(e) => onCustomTimeEdit(e.target.value)}
                    className="px-2 py-0.5 text-sm rounded border border-input bg-background text-foreground text-center w-[60px] font-semibold focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    title="Click to edit time directly"
                />

                <button onClick={() => onAdjustTime(true)} className="p-1 rounded hover:bg-muted transition-colors" title={`${stepDuration} minutes later`}>
                    <ChevronRight className="w-4 h-4 text-foreground" />
                </button>

                <button
                    onClick={onLockToggle}
                    disabled={isLockFlagTime}
                    className={`p-1 rounded transition-colors ${isLockFlagTime ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-cyan-600 text-white hover:bg-cyan-700"}`}
                    title={isLockFlagTime ? "All teachers synchronized" : "Lock all teachers to adjustment time"}
                >
                    {isLockFlagTime ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}

function LocationAdjustmentSection({ locationIndex, adjustmentLocation, isLockFlagLocation, lockLocationCount, totalLocationEventsForLock, onAdjustLocationIndex, onCustomLocationEdit, onLockLocationToggle }: { locationIndex: number; adjustmentLocation: string | null; isLockFlagLocation: boolean; lockLocationCount: number; totalLocationEventsForLock: number; onAdjustLocationIndex: (increment: boolean) => void; onCustomLocationEdit: (newLocation: string) => void; onLockLocationToggle: () => void }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 px-1">
                <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                <div className="text-xs text-muted-foreground font-medium">Location</div>
                <div className="text-[10px] text-muted-foreground ml-auto">
                    {lockLocationCount}/{totalLocationEventsForLock}
                </div>
            </div>
            <div className="flex items-center gap-1.5 bg-background rounded-md px-2 py-1.5 border border-border">
                <button onClick={() => onAdjustLocationIndex(false)} className="p-1 rounded hover:bg-muted transition-colors" title="Previous location">
                    <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>

                <input
                    type="text"
                    value={adjustmentLocation || ""}
                    onChange={(e) => onCustomLocationEdit(e.target.value)}
                    className="px-2 py-0.5 text-sm rounded border border-input bg-background text-foreground text-center w-[80px] font-semibold focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    title="Click to edit custom location"
                />

                <button onClick={() => onAdjustLocationIndex(true)} className="p-1 rounded hover:bg-muted transition-colors" title="Next location">
                    <ChevronRight className="w-4 h-4 text-foreground" />
                </button>

                <button
                    onClick={onLockLocationToggle}
                    className={`p-1 rounded transition-colors ${isLockFlagLocation ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-cyan-600 text-white hover:bg-cyan-700"}`}
                    disabled={isLockFlagLocation}
                    title={isLockFlagLocation ? "All events synchronized" : "Lock all teachers to adjustment location"}
                >
                    {isLockFlagLocation ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}

function ActionButtons({ isSubmitting, onSubmit, onReset, onCancel }: { isSubmitting: boolean; onSubmit: () => Promise<void>; onReset: () => void; onCancel: () => void }) {
    return (
        <div className="flex flex-col gap-1.5">
            <button onClick={onCancel} className={`px-3 py-1 ${ACTION_BUTTON_CONFIG.cancel.className} font-medium text-xs whitespace-nowrap`}>
                {ACTION_BUTTON_CONFIG.cancel.label}
            </button>
            <button onClick={onReset} className={`px-3 py-1 ${ACTION_BUTTON_CONFIG.reset.className} font-medium text-xs whitespace-nowrap`}>
                {ACTION_BUTTON_CONFIG.reset.label}
            </button>
            <button onClick={onSubmit} disabled={isSubmitting} className={`px-3 py-1 ${ACTION_BUTTON_CONFIG.submit.className} font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}>
                {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
        </div>
    );
}

function TimeSection({ globalEarliestTime, globalAdaptedCount, globalTotalTeachers, onEnterAdjustmentMode }: { globalEarliestTime: string | null; globalAdaptedCount: number; globalTotalTeachers: number; onEnterAdjustmentMode: () => void }) {
    return (
        <button onClick={onEnterAdjustmentMode} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/50 rounded-lg transition-all border border-transparent hover:border-border flex-1 group" title="Click to adjust all event times and locations">
            <FlagIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div className="text-left flex-1">
                <div className="text-xs text-muted-foreground font-medium">Start Time</div>
                <div className="flex items-baseline gap-2">
                    <div className="text-lg font-bold text-foreground">{globalEarliestTime}</div>
                    <div className="text-xs text-muted-foreground">
                        {globalAdaptedCount}/{globalTotalTeachers}
                    </div>
                </div>
            </div>
        </button>
    );
}

function LocationSection({ globalLocation, adaptedLocationCount, totalLocationEvents, onEnterAdjustmentMode }: { globalLocation: string | null; adaptedLocationCount: number; totalLocationEvents: number; onEnterAdjustmentMode: () => void }) {
    return (
        <button onClick={onEnterAdjustmentMode} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/50 rounded-lg transition-all border border-transparent hover:border-border flex-1 group" title="Click to adjust all event times and locations">
            <MapPin className="w-6 h-6 text-cyan-600 dark:text-cyan-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div className="text-left flex-1">
                <div className="text-xs text-muted-foreground font-medium">Location</div>
                <div className="flex items-baseline gap-2">
                    <div className="text-lg font-bold text-foreground">{globalLocation || "-"}</div>
                    <div className="text-xs text-muted-foreground">
                        {adaptedLocationCount}/{totalLocationEvents}
                    </div>
                </div>
            </div>
        </button>
    );
}

export default function LessonFlagClassDaily({ globalFlag, teacherQueues, onSubmit, selectedDate }: LessonFlagClassDailyProps) {
    // Format selected date to show day of week
    const getDayOfWeek = (dateString: string) => {
        const date = new Date(dateString);
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[date.getDay()];
    };

    const dayOfWeek = getDayOfWeek(selectedDate);

    // Get current time
    const [currentTime, setCurrentTime] = useState<string>("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");
            setCurrentTime(`${hours}:${minutes}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

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
            .filter((t) => t.earliestTime !== null) as { username: string; earliestTime: string }[];

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
        const pendingTeachersLocations: { username: string; location: string | null }[] = [];

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

    const handleCustomTimeEdit = (newTime: string) => {
        if (newTime !== adjustmentTime) {
            setAdjustmentTime(newTime);
            globalFlag.adjustTime(newTime);
        }
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

    return (
        <div className="flex gap-4">
            {/* Day of Week Header */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-2xl font-bold text-foreground">{dayOfWeek}</div>
                <div className="text-sm text-muted-foreground font-medium">{currentTime}</div>
            </div>

            {/* Main Content */}
            {isAdjustmentMode ? (
                <div className="flex gap-3 flex-1">
                    <TimeAdjustmentSection stepDuration={stepDuration} adjustmentTime={adjustmentTime} isLockFlagTime={isLockFlagTime} lockCount={lockCount} totalTeachers={totalTeachers} onAdjustTime={handleAdjustTime} onLockToggle={handleLockToggle} onCustomTimeEdit={handleCustomTimeEdit} />
                    <LocationAdjustmentSection locationIndex={locationIndex} adjustmentLocation={adjustmentLocation} isLockFlagLocation={isLockFlagLocation} lockLocationCount={lockLocationCount} totalLocationEventsForLock={totalLocationEventsForLock} onAdjustLocationIndex={handleAdjustLocationIndex} onCustomLocationEdit={handleCustomLocationEdit} onLockLocationToggle={handleLockLocationToggle} />
                    <div className="ml-auto flex-shrink-0">
                        <ActionButtons isSubmitting={isSubmitting} onSubmit={handleSubmit} onReset={handleReset} onCancel={handleCancel} />
                    </div>
                </div>
            ) : (
                <div className="flex gap-3 flex-1">
                    <TimeSection globalEarliestTime={globalEarliestTime} globalAdaptedCount={globalAdaptedCount} globalTotalTeachers={globalTotalTeachers} onEnterAdjustmentMode={() => globalFlag.enterAdjustmentMode()} />
                    <LocationSection globalLocation={globalLocation} adaptedLocationCount={adaptedLocationCount} totalLocationEvents={totalLocationEvents} onEnterAdjustmentMode={() => globalFlag.enterAdjustmentMode()} />
                </div>
            )}
        </div>
    );
}