"use client";

import { motion } from "framer-motion";
import { useState, useMemo, useEffect, useCallback } from "react";
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

/**
 * ClientClassboardV2 - Main entry point for the optimized classboard.
 * 
 * DESIGN PRINCIPLES:
 * 1. Stable Session Logic: The globalFlag instance is stable. Components exclusively use 
 *    globalFlag.getTeacherQueues() to ensure that pending local adjustments are never 
 *    momentarily replaced by server data during refreshes (eliminating flickers).
 * 2. Synchronous State Sync: Data from useClassboard is synced into globalFlag via useMemo
 *    to ensure that even the very first render after a refresh carries the preserved state.
 */
export default function ClientClassboardV2({ data }: ClientClassboardV2Props) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [showSplash, setShowSplash] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Raw data from hooks
    const { mounted, selectedDate, setSelectedDate, controller, setController, draggedBooking, setDraggedBooking, classboardData, setClassboardData, draggableBookings, teacherQueues: rawTeacherQueues, isLessonTeacher, addOptimisticEvent } = useClassboard(data);
    const { teachers: allSchoolTeachers, error: teachersError } = useSchoolTeachers();

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    // Global session manager - stable reference
    const globalFlag = useMemo(
        () => new GlobalFlag(rawTeacherQueues, controller, handleRefresh),
        [] // eslint-disable-line react-hooks/exhaustive-deps
    );

    /**
     * Source of Truth Rule:
     * We sync the incoming server data into our stable session manager.
     * The components below MUST use 'teacherQueues' derived here, which 
     * prioritizes local preserved instances for pending teachers.
     */
    const teacherQueues = useMemo(() => {
        globalFlag.updateTeacherQueues(rawTeacherQueues);
        globalFlag.updateController(controller);
        return globalFlag.getTeacherQueues();
    }, [rawTeacherQueues, controller, globalFlag, refreshKey]);

    useEffect(() => {
        const isGlobalMode = globalFlag.isAdjustmentMode();
        if (isGlobalMode && !isSettingsOpen) {
            setIsSettingsOpen(true);
        } else if (!isGlobalMode && isSettingsOpen) {
            setIsSettingsOpen(false);
        }
    }, [globalFlag.isAdjustmentMode(), isSettingsOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    const { handleGlobalSubmit, handleAddLessonEvent, handleAddTeacher } = useClassboardActions({
        globalFlag,
        teacherQueues,
        controller,
        selectedDate,
        allSchoolTeachers,
        addOptimisticEvent,
    });

    const handleEventDeleted = (eventId: string) => {
        setClassboardData((prevData) => {
            const updatedData = { ...prevData };
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

    const stats = useMemo(() => {
        const statistics = new ClassboardStatistics(data, selectedDate);
        return statistics.getHeaderStats();
    }, [data, selectedDate]);

    if (!mounted || showSplash || teachersError) {
        return <ClassboardSkeleton error={!!teachersError} />;
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex flex-col h-full overflow-hidden">
            <div className="flex flex-wrap gap-4 p-4">
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
                                    globalFlag.enterAdjustmentMode();
                                    setIsSettingsOpen(true);
                                }
                            }} 
                        />
                    </div>
                </div>
                <ClassboardStatisticsComponent stats={stats} />
            </div>

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
                        onRefresh={handleRefresh}
                    />
                </div>
            </div>
            <ClassboardFooterV2 controller={controller} setController={setController} selectedDate={selectedDate} teacherQueues={teacherQueues} />
        </motion.div>
    );
}
