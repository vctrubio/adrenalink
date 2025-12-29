"use client";

import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useClassboard } from "@/src/hooks/useClassboard";
import { useClassboardActions } from "@/src/hooks/useClassboardActions";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { HeaderDatePicker } from "@/src/components/ui/HeaderDatePicker";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import ClassboardContentBoard from "./ClassboardContentBoard";
import { ClassboardStatistics } from "@/backend/ClassboardStatistics";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import { GlobalFlag } from "@/backend/models/GlobalFlag";
import { TrendingUp } from "lucide-react";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import ClassboardFooterV2 from "./ClassboardFooterV2";
import LessonFlagClassDaily from "./LessonFlagClassDaily";
import GlobalFlagAdjustmentToggle from "./GlobalFlagAdjustmentToggle";

interface ClientClassboardV2Props {
    data: ClassboardModel;
}

export default function ClientClassboardV2({ data }: ClientClassboardV2Props) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [showSplash, setShowSplash] = useState(true);

    const { mounted, selectedDate, setSelectedDate, controller, setController, draggedBooking, setDraggedBooking, classboardData, setClassboardData, draggableBookings, teacherQueues, isLessonTeacher, addOptimisticEvent } = useClassboard(data);

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

    // Show splash screen if not mounted OR waiting for timer OR if there's a critical error
    if (!mounted || showSplash || teachersError) {
        return <ClassboardSkeleton error={!!teachersError} />;
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex flex-col h-full overflow-hidden">
            {/* ═══════════════════════════════════════════════════════════════
                TOP SECTION - Date & Stats (flex-wrap)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-wrap gap-4 p-4">
                {/* Date Picker */}
                <div className="flex-1 min-w-[280px] p-4 rounded-2xl flex items-center justify-center bg-card border border-zinc-200 dark:border-zinc-700">
                    <HeaderDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
                </div>
                {/* Stats - Grid of icon + label + value cells with animated labels */}
                <div className="flex-1 min-w-[280px] rounded-2xl bg-card border border-zinc-200 dark:border-zinc-700 p-2">
                    {/* Row 1 */}
                    <div className="grid grid-cols-3 divide-x divide-zinc-400 dark:divide-zinc-500">
                        <motion.div className="flex items-center justify-center gap-2 py-2 px-3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0 }}>
                            <HelmetIcon size={16} className="text-muted-foreground shrink-0" />
                            <motion.span className="text-muted-foreground text-xs hidden lg:inline" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} transition={{ duration: 0.2, delay: 0.3 }}>
                                Students
                            </motion.span>
                            <span className="text-foreground font-semibold">{stats.students ? getCompactNumber(stats.students) : "--"}</span>
                        </motion.div>
                        <motion.div className="flex items-center justify-center gap-2 py-2 px-3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.05 }}>
                            <HeadsetIcon size={16} className="text-muted-foreground shrink-0" />
                            <motion.span className="text-muted-foreground text-xs hidden lg:inline" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} transition={{ duration: 0.2, delay: 0.35 }}>
                                Teachers
                            </motion.span>
                            <span className="text-foreground font-semibold">{stats.teachers ? getCompactNumber(stats.teachers) : "--"}</span>
                        </motion.div>
                        <motion.div className="flex items-center justify-center gap-2 py-2 px-3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.1 }}>
                            <LessonIcon size={16} className="text-muted-foreground shrink-0" />
                            <motion.span className="text-muted-foreground text-xs hidden lg:inline" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} transition={{ duration: 0.2, delay: 0.4 }}>
                                Lessons
                            </motion.span>
                            <span className="text-foreground font-semibold">{stats.lessons ? getCompactNumber(stats.lessons) : "--"}</span>
                        </motion.div>
                    </div>
                    {/* Horizontal divider with gap */}
                    <div className="h-px bg-zinc-400 dark:bg-zinc-500 my-2 mx-2" />
                    {/* Row 2 */}
                    <div className="grid grid-cols-3 divide-x divide-zinc-400 dark:divide-zinc-500">
                        <motion.div className="flex items-center justify-center gap-2 py-2 px-3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.15 }}>
                            <DurationIcon size={16} className="text-muted-foreground shrink-0" />
                            <motion.span className="text-muted-foreground text-xs hidden lg:inline" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} transition={{ duration: 0.2, delay: 0.45 }}>
                                Duration
                            </motion.span>
                            <span className="text-foreground font-semibold">{stats.duration ? getHMDuration(stats.duration) : "--"}</span>
                        </motion.div>
                        <motion.div className="flex items-center justify-center gap-2 py-2 px-3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>
                            <HandshakeIcon size={16} className="text-muted-foreground shrink-0" />
                            <motion.span className="text-muted-foreground text-xs hidden lg:inline" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} transition={{ duration: 0.2, delay: 0.5 }}>
                                Comm.
                            </motion.span>
                            <span className="text-foreground font-semibold">{stats.commissions ? getCompactNumber(stats.commissions) : "--"}</span>
                        </motion.div>
                        <motion.div className="flex items-center justify-center gap-2 py-2 px-3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.25 }}>
                            <TrendingUp size={16} className="text-muted-foreground shrink-0" />
                            <motion.span className="text-muted-foreground text-xs hidden lg:inline" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} transition={{ duration: 0.2, delay: 0.55 }}>
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
            <div className="flex-1 overflow-hidden h-full flex flex-col">
                <div className="flex-1 overflow-hidden">
                    <ClassboardContentBoard
                        draggableBookings={draggableBookings}
                        classboardData={classboardData}
                        selectedDate={selectedDate}
                        teacherQueues={teacherQueues}
                        draggedBooking={draggedBooking}
                        isLessonTeacher={isLessonTeacher}
                        controller={controller}
                        globalFlag={globalFlag}
                        availableTeachers={availableTeachers}
                        onSetDraggedBooking={setDraggedBooking}
                        onAddLessonEvent={handleAddLessonEvent}
                        onAddTeacher={handleAddTeacher}
                        onEventDeleted={handleEventDeleted}
                        refreshKey={refreshKey}
                    />
                </div>

                {/* Global Flag Adjustment Controls */}
                <div className="flex-shrink-0 px-4 pb-4">
                    <GlobalFlagAdjustmentToggle
                        globalFlag={globalFlag}
                    >
                        <div className="rounded-2xl bg-card border border-zinc-200 dark:border-zinc-700 p-4">
                            <LessonFlagClassDaily
                                globalFlag={globalFlag}
                                teacherQueues={teacherQueues}
                                onSubmit={async () => {
                                    const changes = globalFlag.collectChanges();
                                    if (changes.length > 0) {
                                        globalFlag.exitAdjustmentMode();
                                        setRefreshKey((prev) => prev + 1);
                                    }
                                }}
                            />
                        </div>
                    </GlobalFlagAdjustmentToggle>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                FOOTER - Control Panel (New V2)
            ═══════════════════════════════════════════════════════════════ */}
            <ClassboardFooterV2 controller={controller} setController={setController} selectedDate={selectedDate} teacherQueues={teacherQueues} />
        </motion.div>
    );
}
