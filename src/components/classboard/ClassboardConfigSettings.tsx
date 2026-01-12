"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, LockOpen, Zap, Timer, MapPin, Minus, Plus } from "lucide-react";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { TimePicker } from "@/src/components/ui/TimePicker";
import { LocationPicker } from "@/src/components/ui/LocationPicker";

export default function ClassboardConfigSettings() {
    const { globalFlag } = useClassboardContext();
    const controller = globalFlag.getController();

    // Configuration
    const MIN_TIME = controller.minTimeMinutes ?? 0;
    const MAX_TIME = controller.maxTimeMinutes ?? 1380;

    // Derived State from GlobalFlag (Single Source of Truth)
    const adjustmentTime = globalFlag.getGlobalTime();
    const adjustmentLocation = globalFlag.getGlobalLocation();

    // Manual unlock states (Local UI state)
    const [manuallyUnlockedTime, setManuallyUnlockedTime] = useState(false);
    const [manuallyUnlockedLocation, setManuallyUnlockedLocation] = useState(false);

    // UI States for Dropdown
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [locationDropdownRect, setLocationDropdownRect] = useState({ top: 0, left: 0, width: 0 });
    const locationRef = useRef<HTMLDivElement>(null);
    const locationButtonRef = useRef<HTMLButtonElement>(null);

    // Read locations from controller
    const locations = controller.locationOptions || ["Beach", "Bay", "Lake", "River", "Pool", "Indoor"];

    // Computed Lock Status
    const timeLock = globalFlag.getLockStatusTime(adjustmentTime);
    const locLock = globalFlag.getLockStatusLocation(adjustmentLocation);
    const isLockFlagTime = globalFlag.isLockedTime;
    const isLockFlagLocation = globalFlag.isLockedLocation;
    const optimisation = globalFlag.getOptimisationStats();
    const isOptimized = optimisation.optimised === optimisation.total && optimisation.total > 0;

    // Auto-lock Logic
    useEffect(() => {
        // Time Auto-Lock
        if (timeLock.lockCount === timeLock.totalTeachers && timeLock.totalTeachers > 0) {
            if (!isLockFlagTime && !manuallyUnlockedTime) {
                globalFlag.isLockedTime = true;
                globalFlag.triggerRefresh();
            }
        } else {
            if (manuallyUnlockedTime) setManuallyUnlockedTime(false);
            if (isLockFlagTime) globalFlag.unlockTime();
        }

        // Location Auto-Lock
        if (locLock.synchronizedTeachersCount === locLock.totalTeachers && locLock.totalTeachers > 0) {
            if (!isLockFlagLocation && !manuallyUnlockedLocation) {
                globalFlag.isLockedLocation = true;
                globalFlag.triggerRefresh();
            }
        } else {
            if (manuallyUnlockedLocation) setManuallyUnlockedLocation(false);
            if (isLockFlagLocation) globalFlag.unlockLocation();
        }
    }, [
        timeLock.lockCount, timeLock.totalTeachers, 
        locLock.synchronizedTeachersCount, locLock.totalTeachers, 
        isLockFlagTime, isLockFlagLocation, 
        manuallyUnlockedTime, manuallyUnlockedLocation,
        globalFlag
    ]);

    // Handlers
    const handleAdjustTime = (newTime: string) => {
        const totalMins = timeToMinutes(newTime);
        if (totalMins < MIN_TIME || totalMins > MAX_TIME) return;
        globalFlag.adjustTime(newTime);
    };

    const handleAdjustTimeStep = (increment: boolean) => {
        if (!adjustmentTime) return;
        const totalMins = timeToMinutes(adjustmentTime) + (increment ? controller.stepDuration : -controller.stepDuration);
        if (totalMins < MIN_TIME || totalMins > MAX_TIME) return;
        const newTime = minutesToTime(totalMins);
        globalFlag.adjustTime(newTime);
    };

    const handleToggleTimeLock = () => {
        if (isLockFlagTime) {
            setManuallyUnlockedTime(true);
            globalFlag.unlockTime();
        } else if (adjustmentTime) {
            setManuallyUnlockedTime(false);
            globalFlag.lockToAdjustmentTime(adjustmentTime);
        }
    };

    const handleToggleLocationLock = () => {
        if (isLockFlagLocation) {
            setManuallyUnlockedLocation(true);
            globalFlag.unlockLocation();
        } else if (adjustmentLocation) {
            setManuallyUnlockedLocation(false);
            globalFlag.lockToLocation(adjustmentLocation);
        }
    };

    const handleLocationSelect = (loc: string) => {
        globalFlag.adjustLocation(loc);
        setIsLocationOpen(false);
    };

    const handleOptionsChange = (newOptions: string[]) => {
        globalFlag.updateController({ locationOptions: newOptions });
    };

    const handleUpdateGap = (delta: number) => {
        globalFlag.updateController({ gapMinutes: Math.max(0, (controller.gapMinutes || 0) + delta) });
    };

    // Dropdown positioning
    useEffect(() => {
        if (isLocationOpen && locationButtonRef.current) {
            const rect = locationButtonRef.current.getBoundingClientRect();
            setLocationDropdownRect({
                top: rect.bottom + 8,
                left: rect.left,
                width: Math.max(rect.width, 160),
            });
        }
    }, [isLocationOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
                setIsLocationOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex-1 min-w-[280px] border border-border/30 rounded-lg overflow-hidden h-full">
            <div className="grid grid-cols-3 divide-x divide-border/30 h-full">
                {/* Column 1: Flag Time */}
                <div className="flex flex-col items-center justify-between gap-2 p-3 relative group">
                    <div className="flex items-center justify-between w-full px-1">
                        <div className="flex items-center gap-2">
                            <FlagIcon size={16} className="text-muted-foreground" />
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Flag Time</span>
                        </div>
                        <div className="bg-muted/50 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground">
                            {timeLock.lockCount}/{timeLock.totalTeachers}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 w-full justify-center">
                        <button onClick={() => handleAdjustTimeStep(false)} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        
                        {/* TimePicker now controlled directly by global state */}
                        <div className="flex-1 flex justify-center">
                            <TimePicker 
                                value={adjustmentTime || "00:00"} 
                                onChange={handleAdjustTime} 
                                noBg
                            />
                        </div>

                        <button onClick={() => handleAdjustTimeStep(true)} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-full">
                        <div className="w-24 h-1 bg-muted/20 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-primary/40" initial={{ width: 0 }} animate={{ width: `${(timeLock.lockCount / Math.max(timeLock.totalTeachers, 1)) * 100}%` }} />
                        </div>
                        <button onClick={handleToggleTimeLock} className={`p-1 rounded-md transition-colors ${isLockFlagTime ? "text-primary" : "text-muted-foreground/30 hover:text-muted-foreground"}`}>
                            {isLockFlagTime ? <Lock size={14} /> : <LockOpen size={14} />}
                        </button>
                    </div>
                </div>

                {/* Column 2: Location */}
                <div ref={locationRef} className="flex flex-col items-center justify-between gap-2 p-3 relative group">
                    <div className="flex items-center justify-between w-full px-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin size={16} />
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Location</span>
                        </div>
                        <div className="bg-muted/50 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground">
                            {locLock.synchronizedTeachersCount}/{locLock.totalTeachers}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 w-full justify-center">
                        <button onClick={() => handleAdjustLocation(false)} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        
                        <div className="flex-1 min-w-0">
                            <LocationPicker
                                value={adjustmentLocation}
                                options={LOCATIONS}
                                onChange={handleLocationSelect}
                                onOptionsChange={handleOptionsChange}
                                noBg
                            />
                        </div>

                        <button onClick={() => handleAdjustLocation(true)} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-full">
                        <div className="w-24 h-1 bg-muted/20 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-primary/40" initial={{ width: 0 }} animate={{ width: `${(locLock.synchronizedTeachersCount / Math.max(locLock.totalTeachers, 1)) * 100}%` }} />
                        </div>
                        <button onClick={handleToggleLocationLock} className={`p-1 rounded-md transition-colors ${isLockFlagLocation ? "text-primary" : "text-muted-foreground/30 hover:text-muted-foreground"}`}>
                            {isLockFlagLocation ? <Lock size={14} /> : <LockOpen size={14} />}
                        </button>
                    </div>
                </div>

                {/* Column 3: In-Betweens */}
                <div className="flex flex-col items-center justify-between gap-2 p-3 relative group">
                    <div className="flex items-center justify-between w-full px-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Timer size={16} />
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">In-Betweens</span>
                        </div>
                        <div className="bg-muted/50 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground">
                            {optimisation.optimised}/{optimisation.total}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 w-full justify-center">
                        <button onClick={() => handleUpdateGap(-5)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors active:scale-95 flex-shrink-0"><Minus size={14} /></button>
                        <div className="px-3 py-1 rounded-md border border-transparent transition-all">
                            <span className="text-lg font-bold text-foreground w-12 text-center font-mono">{controller.gapMinutes || 0}m</span>
                        </div>
                        <button onClick={() => handleUpdateGap(5)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors active:scale-95 flex-shrink-0"><Plus size={14} /></button>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-full">
                        <div className="w-24 h-1 bg-muted/20 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-primary/40" initial={{ width: 0 }} animate={{ width: `${(optimisation.optimised / Math.max(optimisation.total, 1)) * 100}%` }} />
                        </div>
                        <button onClick={() => globalFlag.optimiseAllQueues()} className={`p-1 rounded-md transition-colors ${isOptimized ? "text-primary" : "text-muted-foreground/30 hover:text-muted-foreground"}`}>
                            <Zap size={14} className={isOptimized ? "fill-current" : ""} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
