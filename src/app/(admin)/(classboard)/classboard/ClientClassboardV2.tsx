"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useClassboard } from "@/src/hooks/useClassboard";
import { useClassboardActions } from "@/src/hooks/useClassboardActions";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import { HeaderDatePicker } from "@/src/components/ui/HeaderDatePicker";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import StudentClassDailyV2 from "./StudentClassDailyV2";
import TeacherClassDailyV2 from "./TeacherClassDailyV2";
import { ClassboardStatistics } from "@/backend/ClassboardStatistics";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import { GlobalFlag } from "@/backend/models/GlobalFlag";
import { Settings2, MapPin, Clock, TrendingUp, Minus, Plus } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";

interface ClientClassboardV2Props {
    data: ClassboardModel;
}

export default function ClientClassboardV2({ data }: ClientClassboardV2Props) {
    const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showSplash, setShowSplash] = useState(true);
    
    const { 
        mounted,
        selectedDate, 
        setSelectedDate, 
        controller,
        setController,
        draggedBooking,
        setDraggedBooking,
        classboardData,
        setClassboardData,
        draggableBookings, 
        teacherQueues,
        isLessonTeacher,
        addOptimisticEvent
    } = useClassboard(data);

    const { teachers: allSchoolTeachers, error: teachersError } = useSchoolTeachers();

    // Enforce minimum splash screen duration
    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    // Create global flag instance
    const globalFlag = useMemo(
        () =>
            new GlobalFlag(teacherQueues, controller, () => {
                setRefreshKey((prev) => prev + 1);
            }),
        [teacherQueues, controller],
    );

    const { handleGlobalSubmit, handleAddLessonEvent, handleAddTeacher } = useClassboardActions({
        globalFlag,
        teacherQueues,
        controller,
        selectedDate,
        allSchoolTeachers,
        addOptimisticEvent,
    });

    const handleEventDeleted = (eventId: string) => {
        // Remove the event from classboardData by rebuilding the object
        setClassboardData((prevData) => {
            const updatedData = { ...prevData };

            // Iterate through bookings to find and remove the event
            Object.keys(updatedData).forEach((bookingId) => {
                const booking = updatedData[bookingId];
                if (booking.lessons) {
                    booking.lessons.forEach((lesson) => {
                        if (lesson.events) {
                            lesson.events = lesson.events.filter((e) => e.id !== eventId);
                        }
                    });
                }
            });

            return updatedData;
        });
    };

    const availableTeachers = useMemo(() => {
        return allSchoolTeachers.map((t) => ({
            id: t.schema.id,
            username: t.schema.username,
            firstName: t.schema.firstName,
        }));
    }, [allSchoolTeachers]);

    // Compute stats using ClassboardStatistics
    const stats = useMemo(() => {
        const statistics = new ClassboardStatistics(data, selectedDate);
        return statistics.getHeaderStats();
    }, [data, selectedDate]);

    const toggleControlPanel = () => setIsControlPanelOpen(!isControlPanelOpen);

    // Show splash screen if not mounted OR waiting for timer OR if there's a critical error
    if (!mounted || showSplash || teachersError) {
        return <ClassboardSkeleton error={!!teachersError} />;
    }

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col h-full overflow-hidden"
        >
            {/* ═══════════════════════════════════════════════════════════════
                TOP SECTION - Date & Stats (flex-wrap)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-wrap gap-4 p-4">
                {/* Date Picker */}
                <div className="flex-1 min-w-[280px] p-4 rounded-2xl flex items-center justify-center bg-card border border-zinc-200 dark:border-zinc-700">
                    <HeaderDatePicker 
                        selectedDate={selectedDate} 
                        onDateChange={setSelectedDate} 
                    />
                </div>
                {/* Stats - Grid of icon + label + value cells with animated labels */}
                <div className="flex-1 min-w-[280px] rounded-2xl bg-card border border-zinc-200 dark:border-zinc-700 p-2">
                    {/* Row 1 */}
                    <div className="grid grid-cols-3 divide-x divide-zinc-400 dark:divide-zinc-500">
                        <motion.div 
                            className="flex items-center justify-center gap-2 py-2 px-3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0 }}
                        >
                            <HelmetIcon size={16} className="text-muted-foreground shrink-0" />
                            <motion.span 
                                className="text-muted-foreground text-xs hidden lg:inline"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                transition={{ duration: 0.2, delay: 0.3 }}
                            >
                                Students
                            </motion.span>
                            <span className="text-foreground font-semibold">{stats.students ? getCompactNumber(stats.students) : "--"}</span>
                        </motion.div>
                        <motion.div 
                            className="flex items-center justify-center gap-2 py-2 px-3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.05 }}
                        >
                            <HeadsetIcon size={16} className="text-muted-foreground shrink-0" />
                            <motion.span 
                                className="text-muted-foreground text-xs hidden lg:inline"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                transition={{ duration: 0.2, delay: 0.35 }}
                            >
                                Teachers
                            </motion.span>
                            <span className="text-foreground font-semibold">{stats.teachers ? getCompactNumber(stats.teachers) : "--"}</span>
                        </motion.div>
                        <motion.div 
                            className="flex items-center justify-center gap-2 py-2 px-3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <LessonIcon size={16} className="text-muted-foreground shrink-0" />
                            <motion.span 
                                className="text-muted-foreground text-xs hidden lg:inline"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                transition={{ duration: 0.2, delay: 0.4 }}
                            >
                                Lessons
                            </motion.span>
                            <span className="text-foreground font-semibold">{stats.lessons ? getCompactNumber(stats.lessons) : "--"}</span>
                        </motion.div>
                    </div>
                    {/* Horizontal divider with gap */}
                    <div className="h-px bg-zinc-400 dark:bg-zinc-500 my-2 mx-2" />
                    {/* Row 2 */}
                    <div className="grid grid-cols-3 divide-x divide-zinc-400 dark:divide-zinc-500">
                        <motion.div 
                            className="flex items-center justify-center gap-2 py-2 px-3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.15 }}
                        >
                            <DurationIcon size={16} className="text-muted-foreground shrink-0" />
                            <motion.span 
                                className="text-muted-foreground text-xs hidden lg:inline"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                transition={{ duration: 0.2, delay: 0.45 }}
                            >
                                Duration
                            </motion.span>
                            <span className="text-foreground font-semibold">{stats.duration ? getHMDuration(stats.duration) : "--"}</span>
                        </motion.div>
                        <motion.div 
                            className="flex items-center justify-center gap-2 py-2 px-3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <HandshakeIcon size={16} className="text-muted-foreground shrink-0" />
                            <motion.span 
                                className="text-muted-foreground text-xs hidden lg:inline"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                transition={{ duration: 0.2, delay: 0.5 }}
                            >
                                Comm.
                            </motion.span>
                            <span className="text-foreground font-semibold">{stats.commissions ? getCompactNumber(stats.commissions) : "--"}</span>
                        </motion.div>
                        <motion.div 
                            className="flex items-center justify-center gap-2 py-2 px-3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.25 }}
                        >
                            <TrendingUp size={16} className="text-muted-foreground shrink-0" />
                            <motion.span 
                                className="text-muted-foreground text-xs hidden lg:inline"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                transition={{ duration: 0.2, delay: 0.55 }}
                            >
                                Revenue
                            </motion.span>
                            <span className="text-foreground font-semibold">{stats.revenue ? getCompactNumber(stats.revenue) : "--"}</span>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                CONTENT BOARD - Students & Teachers
            ═══════════════════════════════════════════════════════════════ */}
            <div className="flex-1 p-4 overflow-auto min-h-0 flex flex-col">
                <div className="flex flex-col gap-4 flex-1 min-h-0">
                    {/* Students Section */}
                    <div className="rounded-2xl flex-1 min-h-0 overflow-hidden bg-card border border-zinc-200 dark:border-zinc-700">
                        <StudentClassDailyV2
                            bookings={draggableBookings}
                            classboardData={classboardData}
                            selectedDate={selectedDate}
                            classboard={{
                                onDragStart: (booking) => setDraggedBooking(booking),
                                onDragEnd: () => setDraggedBooking(null),
                                onAddLessonEvent: handleAddLessonEvent,
                                onAddTeacher: handleAddTeacher,
                                availableTeachers: availableTeachers,
                            }}
                        />
                    </div>
                    
                    {/* Teachers Section */}
                    <div className="rounded-2xl flex-1 min-h-0 overflow-hidden bg-card border border-zinc-200 dark:border-zinc-700">
                        <TeacherClassDailyV2
                            key={refreshKey}
                            teacherQueues={teacherQueues}
                            selectedDate={selectedDate}
                            draggedBooking={draggedBooking}
                            isLessonTeacher={isLessonTeacher}
                            controller={controller}
                            onEventDeleted={handleEventDeleted}
                            onAddLessonEvent={handleAddLessonEvent}
                            globalFlag={globalFlag}
                        />
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                FOOTER - Control Panel (Collapsible)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="rounded-t-xl overflow-hidden border-t border-x border-border/30">
                {/* Collapsible Content */}
                <AnimatePresence>
                    {isControlPanelOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="overflow-hidden bg-card"
                        >
                            <div className="p-6 space-y-6">
                                {/* Row 1: Time Stepper + Location + Gap + Step */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Submit Time with Stepper */}
                                    <div className="space-y-2">
                                        <label className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium flex items-center gap-1.5">
                                            <FlagIcon size={10} />
                                            Start Time
                                        </label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    const [h, m] = controller.submitTime.split(":").map(Number);
                                                    const totalMins = h * 60 + m - (controller.stepDuration || 15);
                                                    const newH = Math.max(0, Math.floor(totalMins / 60)) % 24;
                                                    const newM = Math.max(0, totalMins % 60);
                                                    setController({ ...controller, submitTime: `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}` });
                                                }}
                                                className="p-2 rounded-lg border border-border/50 bg-background hover:bg-muted/50 active:bg-muted transition-colors"
                                            >
                                                <Minus size={14} className="text-muted-foreground" />
                                            </button>
                                            <input 
                                                type="time" 
                                                value={controller.submitTime}
                                                onChange={(e) => setController({ ...controller, submitTime: e.target.value })}
                                                className="flex-1 min-w-0 bg-background border border-border/50 rounded-lg px-3 py-2 text-foreground text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-mono"
                                            />
                                            <button
                                                onClick={() => {
                                                    const [h, m] = controller.submitTime.split(":").map(Number);
                                                    const totalMins = h * 60 + m + (controller.stepDuration || 15);
                                                    const newH = Math.floor(totalMins / 60) % 24;
                                                    const newM = totalMins % 60;
                                                    setController({ ...controller, submitTime: `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}` });
                                                }}
                                                className="p-2 rounded-lg border border-border/50 bg-background hover:bg-muted/50 active:bg-muted transition-colors"
                                            >
                                                <Plus size={14} className="text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="space-y-2">
                                        <label className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium flex items-center gap-1.5">
                                            <MapPin size={10} />
                                            Location
                                        </label>
                                        <select 
                                            value={controller.location}
                                            onChange={(e) => setController({ ...controller, location: e.target.value })}
                                            className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                                        >
                                            <option value="BEACH">BEACH</option>
                                            <option value="FLAT">FLAT</option>
                                            <option value="BOAT">BOAT</option>
                                        </select>
                                    </div>

                                    {/* Gap Minutes */}
                                    <div className="space-y-2">
                                        <label className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium flex items-center gap-1.5">
                                            <Clock size={10} />
                                            Gap
                                        </label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setController({ ...controller, gapMinutes: Math.max(0, (controller.gapMinutes || 0) - 5) })}
                                                className="p-2 rounded-lg border border-border/50 bg-background hover:bg-muted/50 active:bg-muted transition-colors"
                                            >
                                                <Minus size={14} className="text-muted-foreground" />
                                            </button>
                                            <div className="flex-1 min-w-0 bg-background border border-border/50 rounded-lg px-3 py-2 text-foreground text-sm text-center font-mono">
                                                {controller.gapMinutes || 0}m
                                            </div>
                                            <button
                                                onClick={() => setController({ ...controller, gapMinutes: (controller.gapMinutes || 0) + 5 })}
                                                className="p-2 rounded-lg border border-border/50 bg-background hover:bg-muted/50 active:bg-muted transition-colors"
                                            >
                                                <Plus size={14} className="text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Step Duration */}
                                    <div className="space-y-2">
                                        <label className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">Step</label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setController({ ...controller, stepDuration: Math.max(5, (controller.stepDuration || 15) - 5) })}
                                                className="p-2 rounded-lg border border-border/50 bg-background hover:bg-muted/50 active:bg-muted transition-colors"
                                            >
                                                <Minus size={14} className="text-muted-foreground" />
                                            </button>
                                            <div className="flex-1 min-w-0 bg-background border border-border/50 rounded-lg px-3 py-2 text-foreground text-sm text-center font-mono">
                                                {controller.stepDuration || 15}m
                                            </div>
                                            <button
                                                onClick={() => setController({ ...controller, stepDuration: (controller.stepDuration || 15) + 5 })}
                                                className="p-2 rounded-lg border border-border/50 bg-background hover:bg-muted/50 active:bg-muted transition-colors"
                                            >
                                                <Plus size={14} className="text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Duration Caps */}
                                <div className="pt-4 border-t border-border/20">
                                    <label className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium mb-3 block">Duration Caps</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {/* 1 Person */}
                                        <div className="space-y-1.5">
                                            <span className="text-muted-foreground text-[10px] block text-center">1 Person</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setController({ ...controller, durationCapOne: Math.max(15, controller.durationCapOne - (controller.stepDuration || 15)) })}
                                                    className="p-1.5 rounded border border-border/50 bg-background hover:bg-muted/50 active:bg-muted transition-colors"
                                                >
                                                    <Minus size={12} className="text-muted-foreground" />
                                                </button>
                                                <div className="flex-1 min-w-0 bg-background border border-border/50 rounded px-2 py-1.5 text-foreground text-xs text-center font-mono">
                                                    {getHMDuration(controller.durationCapOne)}
                                                </div>
                                                <button
                                                    onClick={() => setController({ ...controller, durationCapOne: controller.durationCapOne + (controller.stepDuration || 15) })}
                                                    className="p-1.5 rounded border border-border/50 bg-background hover:bg-muted/50 active:bg-muted transition-colors"
                                                >
                                                    <Plus size={12} className="text-muted-foreground" />
                                                </button>
                                            </div>
                                        </div>
                                        {/* 2 People */}
                                        <div className="space-y-1.5">
                                            <span className="text-muted-foreground text-[10px] block text-center">2 People</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setController({ ...controller, durationCapTwo: Math.max(15, controller.durationCapTwo - (controller.stepDuration || 15)) })}
                                                    className="p-1.5 rounded border border-border/50 bg-background hover:bg-muted/50 active:bg-muted transition-colors"
                                                >
                                                    <Minus size={12} className="text-muted-foreground" />
                                                </button>
                                                <div className="flex-1 min-w-0 bg-background border border-border/50 rounded px-2 py-1.5 text-foreground text-xs text-center font-mono">
                                                    {getHMDuration(controller.durationCapTwo)}
                                                </div>
                                                <button
                                                    onClick={() => setController({ ...controller, durationCapTwo: controller.durationCapTwo + (controller.stepDuration || 15) })}
                                                    className="p-1.5 rounded border border-border/50 bg-background hover:bg-muted/50 active:bg-muted transition-colors"
                                                >
                                                    <Plus size={12} className="text-muted-foreground" />
                                                </button>
                                            </div>
                                        </div>
                                        {/* 3+ People */}
                                        <div className="space-y-1.5">
                                            <span className="text-muted-foreground text-[10px] block text-center">3+ People</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setController({ ...controller, durationCapThree: Math.max(15, controller.durationCapThree - (controller.stepDuration || 15)) })}
                                                    className="p-1.5 rounded border border-border/50 bg-background hover:bg-muted/50 active:bg-muted transition-colors"
                                                >
                                                    <Minus size={12} className="text-muted-foreground" />
                                                </button>
                                                <div className="flex-1 min-w-0 bg-background border border-border/50 rounded px-2 py-1.5 text-foreground text-xs text-center font-mono">
                                                    {getHMDuration(controller.durationCapThree)}
                                                </div>
                                                <button
                                                    onClick={() => setController({ ...controller, durationCapThree: controller.durationCapThree + (controller.stepDuration || 15) })}
                                                    className="p-1.5 rounded border border-border/50 bg-background hover:bg-muted/50 active:bg-muted transition-colors"
                                                >
                                                    <Plus size={12} className="text-muted-foreground" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Bar (Always Visible) - Minimal, transparent until hovered */}
                <div 
                    className="px-4 py-3 flex items-center justify-between cursor-pointer transition-all select-none group hover:bg-muted/30"
                    onClick={toggleControlPanel}
                >
                    {/* Left side - Time & info */}
                    <div className="flex items-center gap-4">
                        <span className="text-foreground font-mono text-lg tracking-tight">
                            {controller.submitTime}
                        </span>
                        <span className="text-muted-foreground/30 hidden sm:inline">•</span>
                        <span className="text-muted-foreground/60 text-xs hidden sm:inline">
                            {controller.location}
                        </span>
                        <span className="text-muted-foreground/30 hidden md:inline">•</span>
                        <span className="text-muted-foreground/40 font-mono text-[11px] hidden md:inline">
                            1P:{getHMDuration(controller.durationCapOne)} 
                            <span className="mx-1 text-muted-foreground/20">|</span>
                            2P:{getHMDuration(controller.durationCapTwo)}
                            <span className="mx-1 text-muted-foreground/20">|</span>
                            3+:{getHMDuration(controller.durationCapThree)}
                        </span>
                    </div>

                    {/* Right side - Toggle icon */}
                    <ToggleAdranalinkIcon 
                        isOpen={isControlPanelOpen} 
                        onClick={toggleControlPanel} 
                        variant="lg" 
                    />
                </div>
            </div>
        </motion.div>
    );
}
