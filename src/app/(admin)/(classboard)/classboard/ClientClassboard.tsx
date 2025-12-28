"use client";

import { useMemo, useState, useEffect } from "react";
import { useClassboard } from "@/src/hooks/useClassboard";
import { useClassboardActions } from "@/src/hooks/useClassboardActions";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import StudentClassDaily from "./StudentClassDaily";
import LessonFlagClassDaily from "./LessonFlagClassDaily";
import TeacherClassDaily from "./TeacherClassDaily";
import ClassboardHeader from "./ClassboardHeader";
import ClassboardController from "./ClassboardController";
import { GlobalFlag } from "@/backend/models/GlobalFlag";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import { motion } from "framer-motion";

interface ClientClassboardProps {
    data: ClassboardModel;
}

export default function ClientClassboard({ data }: ClientClassboardProps) {
    const { mounted, selectedDate, setSelectedDate, controller, setController, draggedBooking, setDraggedBooking, classboardData, setClassboardData, draggableBookings, teacherQueues, classboardStats, isLessonTeacher, addOptimisticEvent } = useClassboard(data);

    const { teachers: allSchoolTeachers, error: teachersError } = useSchoolTeachers();

    const [refreshKey, setRefreshKey] = useState(0);
    const [isControllerCollapsed, setIsControllerCollapsed] = useState(true);
    const [showSplash, setShowSplash] = useState(true);

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

    // Show splash screen if not mounted OR waiting for timer OR if there's a critical error
    // If there is an error, we keep the skeleton but show the error state
    if (!mounted || showSplash || teachersError) {
        return <ClassboardSkeleton error={!!teachersError} />;
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex flex-col gap-4 h-full overflow-hidden">
            {/* Constrained sections - shrink to content */}
            <div className="max-w-7xl mx-auto w-full flex flex-col gap-4 flex-shrink-0">
                {/* Header */}
                <ClassboardHeader selectedDate={selectedDate} onDateChange={setSelectedDate} draggableBookings={draggableBookings} classboardStats={classboardStats} />

                {/* Controller */}
                <ClassboardController controller={controller} setController={setController} isCollapsed={isControllerCollapsed} onToggleCollapse={() => setIsControllerCollapsed(!isControllerCollapsed)} />

                {/* Lesson Flag */}
                <LessonFlagClassDaily globalFlag={globalFlag} teacherQueues={teacherQueues} onSubmit={handleGlobalSubmit} />
            </div>
            {/* <ExportSettingController selectedDate={selectedDate} controller={controller} teacherQueues={teacherQueues} classboardData={classboardData} teacherQueues={teacherQueues} /> */}

            <div className="flex flex-col gap-4 border">
                <div className="flex bg-card rounded-xl">
                    <StudentClassDaily
                        bookings={draggableBookings}
                        classboardData={classboardData}
                        selectedDate={selectedDate}
                        classboard={{
                            onDragStart: (booking) => {
                                setDraggedBooking(booking);
                            },
                            onDragEnd: () => {
                                setDraggedBooking(null);
                            },
                            onAddLessonEvent: handleAddLessonEvent,
                            onAddTeacher: handleAddTeacher,
                            availableTeachers: availableTeachers,
                        }}
                    />
                </div>
                <div className="flex">
                    <TeacherClassDaily
                        key={refreshKey}
                        teacherQueues={teacherQueues}
                        draggedBooking={draggedBooking}
                        isLessonTeacher={isLessonTeacher}
                        controller={controller}
                        onEventDeleted={handleEventDeleted}
                        onAddLessonEvent={handleAddLessonEvent}
                        globalFlag={globalFlag}
                    />
                </div>
            </div>
        </motion.div>
    );
}
