"use client";

import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useClassboard } from "@/src/hooks/useClassboard";
import { useClassboardActions } from "@/src/hooks/useClassboardActions";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { HeaderDatePicker } from "@/src/components/ui/HeaderDatePicker";
import ToggleSettingIcon from "@/src/components/ui/ToggleSettingIcon";
import ClassboardContentBoard from "./ClassboardContentBoard";
import ClassboardStatisticsComponent from "./ClassboardStatistics";
import { ClassboardStatistics } from "@/backend/ClassboardStatistics";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import { GlobalFlag } from "@/backend/models/GlobalFlag";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import ClassboardFooterV2 from "./ClassboardFooterV2";

interface ClientClassboardV2Props {
    data: ClassboardModel;
}

export default function ClientClassboardV2({ data }: ClientClassboardV2Props) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [showSplash, setShowSplash] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

    // Auto-open settings if adjustment mode is active (e.g. triggered from elsewhere)
    useEffect(() => {
        if (globalFlag.isAdjustmentMode() && !isSettingsOpen) {
            setIsSettingsOpen(true);
        }
    }, [globalFlag.isAdjustmentMode()]); // eslint-disable-line react-hooks/exhaustive-deps

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
                TOP SECTION - Date/Settings & Stats (flex-wrap)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-wrap gap-4 p-4">
                {/* Date Picker OR Settings Toggle Area */}
                <div className="flex-1 min-w-[280px] p-4 rounded-2xl flex items-center justify-center bg-card border border-zinc-200 dark:border-zinc-700 relative overflow-hidden transition-all duration-300">
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                        <HeaderDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
                    </div>
                    
                    <div className="absolute top-4 right-4 z-10">
                        <ToggleSettingIcon 
                            isOpen={isSettingsOpen} 
                            onClick={() => {
                                if (isSettingsOpen) {
                                    globalFlag.exitAdjustmentMode();
                                    setIsSettingsOpen(false);
                                } else {
                                    setIsSettingsOpen(true);
                                }
                            }} 
                        />
                    </div>
                </div>

                {/* Stats Section */}
                <ClassboardStatisticsComponent stats={stats} />
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
                        isSettingsOpen={isSettingsOpen}
                        onSettingsClose={() => {
                            globalFlag.exitAdjustmentMode();
                            setIsSettingsOpen(false);
                        }}
                        onRefresh={() => setRefreshKey((prev) => prev + 1)}
                    />
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                FOOTER - Control Panel (New V2)
            ═══════════════════════════════════════════════════════════════ */}
            <ClassboardFooterV2 controller={controller} setController={setController} selectedDate={selectedDate} teacherQueues={teacherQueues} />
        </motion.div>
    );
}
