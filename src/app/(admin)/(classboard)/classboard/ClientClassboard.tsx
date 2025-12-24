"use client";

import { useMemo, useState, useEffect } from "react";
import { useClassboard } from "@/src/hooks/useClassboard";
import StudentClassDaily from "./StudentClassDaily";
import LessonFlagClassDaily from "./LessonFlagClassDaily";
import TeacherClassDaily from "./TeacherClassDaily";
import ClassboardHeader from "./ClassboardHeader";
import ClassboardController from "./ClassboardController";
import { GlobalFlag } from "@/backend/models/GlobalFlag";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import { createClassboardEvent } from "@/actions/classboard-action";

interface ClientClassboardProps {
    data: ClassboardModel;
}

export default function ClientClassboard({ data }: ClientClassboardProps) {
    const { selectedDate, setSelectedDate, controller, setController, draggedBooking, setDraggedBooking, classboardData, setClassboardData, draggableBookings, teacherQueues, classboardStats, isLessonTeacher, setOnNewBooking } = useClassboard(data);

    const [refreshKey, setRefreshKey] = useState(0);
    const [isControllerCollapsed, setIsControllerCollapsed] = useState(true);

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

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Constrained sections */}
            <div className="max-w-7xl mx-auto w-full flex flex-col gap-4">
                {/* Header */}
                <ClassboardHeader selectedDate={selectedDate} onDateChange={setSelectedDate} draggableBookings={draggableBookings} classboardStats={classboardStats} />

                {/* Students */}
                <div className="w-full bg-card rounded-xl shadow-sm overflow-y-auto max-h-[40vh]">
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
                        }}
                        setOnNewBooking={setOnNewBooking}
                    />
                </div>

                {/* Controller */}
                <ClassboardController
                    controller={controller}
                    setController={setController}
                    isCollapsed={isControllerCollapsed}
                    onToggleCollapse={() => setIsControllerCollapsed(!isControllerCollapsed)}
                />

                {/* Lesson Flag */}
                <LessonFlagClassDaily globalFlag={globalFlag} teacherQueues={teacherQueues} onSubmit={handleGlobalSubmit} />
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
        </div>
    );
}
