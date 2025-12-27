"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Lock, LockOpen, MapPin } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";
import { SubmitCancelReset } from "@/src/components/ui/SubmitCancelReset";
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

function TimeAdjustmentSection({ 
    stepDuration, 
    adjustmentTime, 
    isLockFlagTime, 
    lockCount, 
    totalTeachers, 
    onAdjustTime, 
    onLockToggle, 
    onCustomTimeEdit 
}: { 
    stepDuration: number; 
    adjustmentTime: string | null; 
    isLockFlagTime: boolean; 
    lockCount: number; 
    totalTeachers: number; 
    onAdjustTime: (increment: boolean) => void; 
    onLockToggle: () => void; 
    onCustomTimeEdit: (newTime: string) => void 
}) {
    return (
        <div className="flex flex-col gap-2 p-3 bg-muted/20 rounded-xl border border-border">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg text-cyan-600 dark:text-cyan-400">
                        <FlagIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Start Time</div>
                        <div className="text-[10px] text-muted-foreground">{lockCount} / {totalTeachers} Synchronized</div>
                    </div>
                </div>
                <button
                    onClick={onLockToggle}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${isLockFlagTime ? "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                    title={isLockFlagTime ? "Unlock time synchronization" : "Lock all teachers to adjustment time"}
                >
                    {isLockFlagTime ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex items-center justify-between gap-2 bg-background p-1 rounded-lg border border-border shadow-sm">
                <button 
                    onClick={() => onAdjustTime(false)} 
                    className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    title={`${stepDuration} minutes earlier`}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <input
                    type="text"
                    value={adjustmentTime || ""}
                    onChange={(e) => onCustomTimeEdit(e.target.value)}
                    className="flex-1 min-w-0 text-center text-lg font-black bg-transparent outline-none text-foreground font-mono tracking-tight"
                    title="Click to edit time directly"
                />

                <button 
                    onClick={() => onAdjustTime(true)} 
                    className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    title={`${stepDuration} minutes later`}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

function LocationAdjustmentSection({ 
    locationIndex, 
    adjustmentLocation, 
    isLockFlagLocation, 
    lockLocationCount, 
    totalLocationEventsForLock, 
    onAdjustLocationIndex, 
    onCustomLocationEdit, 
    onLockLocationToggle 
}: { 
    locationIndex: number; 
    adjustmentLocation: string | null; 
    isLockFlagLocation: boolean; 
    lockLocationCount: number; 
    totalLocationEventsForLock: number; 
    onAdjustLocationIndex: (increment: boolean) => void; 
    onCustomLocationEdit: (newLocation: string) => void; 
    onLockLocationToggle: () => void 
}) {
    return (
        <div className="flex flex-col gap-2 p-3 bg-muted/20 rounded-xl border border-border">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Location</div>
                        <div className="text-[10px] text-muted-foreground">{lockLocationCount} / {totalLocationEventsForLock} Synchronized</div>
                    </div>
                </div>
                <button
                    onClick={onLockLocationToggle}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${isLockFlagLocation ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                    title={isLockFlagLocation ? "Unlock location synchronization" : "Lock all events to adjustment location"}
                >
                    {isLockFlagLocation ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex items-center justify-between gap-2 bg-background p-1 rounded-lg border border-border shadow-sm">
                <button 
                    onClick={() => onAdjustLocationIndex(false)} 
                    className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    title="Previous location"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <input
                    type="text"
                    value={adjustmentLocation || ""}
                    onChange={(e) => onCustomLocationEdit(e.target.value)}
                    className="flex-1 min-w-0 text-center text-sm font-bold bg-transparent outline-none text-foreground truncate"
                    title="Click to edit custom location"
                />

                <button 
                    onClick={() => onAdjustLocationIndex(true)} 
                    className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    title="Next location"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

function TimeSection({ globalEarliestTime, globalAdaptedCount, globalTotalTeachers, onEnterAdjustmentMode }: { globalEarliestTime: string | null; globalAdaptedCount: number; globalTotalTeachers: number; onEnterAdjustmentMode: () => void }) {
    return (
        <button 
            onClick={onEnterAdjustmentMode} 
            className="flex flex-col gap-2 p-3 bg-card hover:bg-muted/50 rounded-xl border border-border hover:border-cyan-500/30 transition-all group text-left w-full h-full"
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                        <FlagIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">Start Time</span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md">
                    {globalAdaptedCount}/{globalTotalTeachers}
                </div>
            </div>
            <div className="text-2xl font-black text-foreground font-mono tracking-tight pl-1">
                {globalEarliestTime || "--:--"}
            </div>
        </button>
    );
}

function LocationSection({ globalLocation, adaptedLocationCount, totalLocationEvents, onEnterAdjustmentMode }: { globalLocation: string | null; adaptedLocationCount: number; totalLocationEvents: number; onEnterAdjustmentMode: () => void }) {
    return (
        <button 
            onClick={onEnterAdjustmentMode} 
            className="flex flex-col gap-2 p-3 bg-card hover:bg-muted/50 rounded-xl border border-border hover:border-slate-500/30 transition-all group text-left w-full h-full"
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">Location</span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md">
                    {adaptedLocationCount}/{totalLocationEvents}
                </div>
            </div>
            <div className="text-lg font-bold text-foreground truncate pl-1">
                {globalLocation || "-"}
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
    
    // Derived state from model
    const pendingTeachers = globalFlag.getPendingTeachers();
    const totalTeachers = pendingTeachers.size;
    const { isLockFlagTime, lockCount } = globalFlag.getLockStatusTime(adjustmentTime);
    const { isLockFlagLocation, lockLocationCount, totalLocationEventsForLock } = globalFlag.getLockStatusLocation(adjustmentLocation);

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

    useEffect(() => {
        if (isAdjustmentMode) {
            const currentGlobalEarliest = globalEarliestTime;
            if (currentGlobalEarliest && currentGlobalEarliest !== adjustmentTime) {
                setAdjustmentTime(currentGlobalEarliest);
            }
        }
    }, [globalEarliestTime, isAdjustmentMode]);

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

    const handleReset = useCallback(() => {
        globalFlag.discardChanges();
        const currentGlobalLocation = globalFlag.getGlobalLocation();
        setAdjustmentLocation(currentGlobalLocation);
        setLocationIndex(originalLocationIndex);
        const currentGlobalTime = globalFlag.getGlobalEarliestTime();
        setAdjustmentTime(currentGlobalTime);
    }, [globalFlag, originalLocationIndex]);

    const handleCancel = useCallback(() => {
        globalFlag.discardChanges();
        const currentGlobalLocation = globalFlag.getGlobalLocation();
        setAdjustmentLocation(currentGlobalLocation);
        setLocationIndex(originalLocationIndex);
        const currentGlobalTime = globalFlag.getGlobalEarliestTime();
        setAdjustmentTime(currentGlobalTime);
        globalFlag.exitAdjustmentMode();
    }, [globalFlag, originalLocationIndex]);

    useEffect(() => {
        if (!isAdjustmentMode) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleCancel();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isAdjustmentMode, handleCancel]);

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

    // Calculate total updates for the submit button badge
    const updatesCount = globalFlag.getChangedEventsCount();
    
    const hasChanges = updatesCount > 0;

    return (
        <div className="w-full">
            {isAdjustmentMode ? (
                <div className="flex flex-col gap-3 p-4 bg-card rounded-2xl border border-border shadow-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <TimeAdjustmentSection 
                            stepDuration={stepDuration} 
                            adjustmentTime={adjustmentTime} 
                            isLockFlagTime={isLockFlagTime} 
                            lockCount={lockCount} 
                            totalTeachers={totalTeachers} 
                            onAdjustTime={handleAdjustTime} 
                            onLockToggle={handleLockToggle} 
                            onCustomTimeEdit={handleCustomTimeEdit} 
                        />
                        <LocationAdjustmentSection 
                            locationIndex={locationIndex} 
                            adjustmentLocation={adjustmentLocation} 
                            isLockFlagLocation={isLockFlagLocation} 
                            lockLocationCount={lockLocationCount} 
                            totalLocationEventsForLock={totalLocationEventsForLock} 
                            onAdjustLocationIndex={handleAdjustLocationIndex} 
                            onCustomLocationEdit={handleCustomLocationEdit} 
                            onLockLocationToggle={handleLockLocationToggle} 
                        />
                    </div>
                    
                    <div className="pt-2 border-t border-border/50 mt-1">
                        <SubmitCancelReset 
                            isSubmitting={isSubmitting} 
                            onSubmit={handleSubmit} 
                            onReset={handleReset} 
                            onCancel={handleCancel}
                            hasChanges={hasChanges} // Or simply true if we want them always active in this mode
                            submitLabel="Update Daily Class"
                            extraContent={updatesCount > 0 && (
                                <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-white/25 text-white text-[10px] font-extrabold ml-1.5 shadow-sm border border-white/10">
                                    {updatesCount}
                                </span>
                            )}
                        />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 w-full">
                    <TimeSection 
                        globalEarliestTime={globalEarliestTime} 
                        globalAdaptedCount={globalAdaptedCount} 
                        globalTotalTeachers={globalTotalTeachers} 
                        onEnterAdjustmentMode={() => globalFlag.enterAdjustmentMode()} 
                    />
                    <LocationSection 
                        globalLocation={globalLocation} 
                        adaptedLocationCount={adaptedLocationCount} 
                        totalLocationEvents={totalLocationEvents} 
                        onEnterAdjustmentMode={() => globalFlag.enterAdjustmentMode()} 
                    />
                </div>
            )}
        </div>
    );
}
