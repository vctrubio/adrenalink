"use client";

import { useMemo, useState, useEffect } from "react";
import { useClassboard } from "@/src/hooks/useClassboard";
import StudentClassDaily from "./StudentClassDaily";
import ExportSettingController from "./ExportSettingController";
import LessonFlagClassDaily from "./LessonFlagClassDaily";
import TeacherClassDaily from "./TeacherClassDaily";
import ClassboardHeader from "./ClassboardHeader";
import ClassboardController from "./ClassboardController";
import { GlobalFlag } from "@/backend/models/GlobalFlag";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import { createClassboardEvent } from "@/actions/classboard-action";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { createLesson } from "@/actions/lessons-action";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import { motion } from "framer-motion";

interface ClientClassboardProps {
    data: ClassboardModel;
}

export default function ClientClassboard({ data }: ClientClassboardProps) {
    const { mounted, selectedDate, setSelectedDate, controller, setController, draggedBooking, setDraggedBooking, classboardData, setClassboardData, draggableBookings, teacherQueues, classboardStats, isLessonTeacher, setOnNewBooking } = useClassboard(data);
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

    const handleGlobalSubmit = async () => {
        try {
            const allUpdates = globalFlag.collectChanges();

            if (allUpdates.length > 0) {
                const result = await bulkUpdateClassboardEvents(allUpdates);

                if (!result.success) {
                    console.error("Failed to update events:", result.error);
                    return;
                }
            }

            globalFlag.exitAdjustmentMode();
        } catch (error) {
            console.error("Error submitting global updates:", error);
        }
    };

    const handleAddLessonEvent = async (booking: DraggableBooking, teacherUsername: string) => {
        try {
            const lesson = booking.lessons.find((l) => l.teacherUsername === teacherUsername);
            const queue = teacherQueues.find((q) => q.teacher.username === teacherUsername);
            if (!lesson || !queue) return;

            const { time, duration } = queue.getInsertionTime(controller.submitTime, booking.capacityStudents, controller);
            await createClassboardEvent(lesson.id, `${selectedDate}T${time}:00`, duration, controller.location);
        } catch (error) {
            console.error("❌ [ClientClassboard] Error adding lesson event:", error);
        }
    };

    const handleAddTeacher = async (booking: DraggableBooking, teacherUsername: string) => {
        try {
            const teacherModel = allSchoolTeachers.find((t) => t.schema.username === teacherUsername);
            if (!teacherModel) return;

            const commission = teacherModel.relations?.commissions?.[0];
            if (!commission) {
                console.error("❌ [ClientClassboard] Teacher has no commission:", teacherUsername);
                return;
            }

            const result = await createLesson({
                bookingId: booking.bookingId,
                teacherId: teacherModel.schema.id,
                commissionId: commission.id,
                schoolId: teacherModel.schema.schoolId,
                status: "active",
            });

            if (!result.success) {
                console.error("❌ [ClientClassboard] Failed to create lesson:", result.error);
            }
        } catch (error) {
            console.error("❌ [ClientClassboard] Error adding teacher to booking:", error);
        }
    };

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
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex flex-col gap-4 h-full">
            {/* Constrained sections */}
            <div className="max-w-7xl mx-auto w-full flex flex-col gap-4">
                {/* Header */}
                <ClassboardHeader selectedDate={selectedDate} onDateChange={setSelectedDate} draggableBookings={draggableBookings} classboardStats={classboardStats} />

                {/* <ExportSettingController selectedDate={selectedDate} teacherQueues={teacherQueues} /> */}

                {/* Controller */}
                <ClassboardController controller={controller} setController={setController} isCollapsed={isControllerCollapsed} onToggleCollapse={() => setIsControllerCollapsed(!isControllerCollapsed)} />

                {/* Lesson Flag */}
                <LessonFlagClassDaily globalFlag={globalFlag} teacherQueues={teacherQueues} onSubmit={handleGlobalSubmit} />
            </div>

            <div className="w-full bg-card rounded-xl shadow-sm overflow-y-auto max-w-6xl max-h-[40vh] mx-auto">
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
                    setOnNewBooking={setOnNewBooking}
                />
            </div>

            {/* Teachers section - full width */}
            <div className="flex-1 overflow-hidden flex justify-center">
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
        </motion.div>
    );
}
