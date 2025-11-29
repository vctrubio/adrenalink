"use client";

import { useMemo, useState } from "react";
import { useClassboard } from "@/src/hooks/useClassboard";
import { SingleDatePicker } from "@/src/components/pickers/SingleDatePicker";
import ClassboardController from "./ClassboardController";
import StudentClassDaily from "./StudentClassDaily";
import LessonFlagClassDaily from "./LessonFlagClassDaily";
import TeacherClassDaily from "./TeacherClassDaily";
import { GlobalFlag } from "@/backend/models/GlobalFlag";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import { createClassboardEvent } from "@/actions/classboard-action";
interface ClientClassboardProps {
    data: ClassboardModel;
}

export default function ClientClassboard({ data }: ClientClassboardProps) {
    const { selectedDate, setSelectedDate, searchQuery, setSearchQuery, controller, setController, draggedBooking, setDraggedBooking, classboardData, setClassboardData, draggableBookings, teacherQueues, classboardStats, isLessonTeacher, setOnNewBooking } =
        useClassboard(data);

    const [refreshKey, setRefreshKey] = useState(0);

    const globalStats = classboardStats.getGlobalStats();

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

    const [isControllerCollapsed, setIsControllerCollapsed] = useState(false);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-muted/30">
            {/* Collapsible Controller */}
            {/* <ClassboardController */}
            {/*     search={searchQuery} */}
            {/*     setSearch={setSearchQuery} */}
            {/*     controller={controller} */}
            {/*     setController={setController} */}
            {/*     stats={globalStats} */}
            {/*     teacherQueues={teacherQueues} */}
            {/*     totalBookings={draggableBookings.length} */}
            {/*     isCollapsed={isControllerCollapsed} */}
            {/*     onToggleCollapse={() => setIsControllerCollapsed(!isControllerCollapsed)} */}
            {/* /> */}

            {/* Top Controls Row: Date Picker + Flag Controls */}
            <div className="flex gap-4 p-4 pb-0">
                {/* Date Picker Island - Same width as teacher column */}
                <div className="w-[340px] flex-shrink-0">
                    <div className="bg-card rounded-xl border border-border shadow-sm p-4">
                        <SingleDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
                    </div>
                </div>

                {/* Flag Controls Island - Rest of the width */}
                <div className="flex-1">
                    <div className="bg-card rounded-xl border border-border shadow-sm p-4">
                        <LessonFlagClassDaily globalFlag={globalFlag} teacherQueues={teacherQueues} onSubmit={handleGlobalSubmit} selectedDate={selectedDate} />
                    </div>
                </div>
            </div>

            {/* Split Screen Layout: Students (Left) | Teachers (Right) */}
            <div className="flex flex-1 gap-4 p-4 overflow-hidden">
                {/* Left Sidebar: Students Island */}
                <div className="w-[340px] flex-shrink-0">
                    <div className="border-2 border-yellow-500 rounded-xl h-full overflow-hidden flex flex-col">
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
                </div>

                {/* Right Side: Teacher Queues */}
                <div className="flex-1 overflow-hidden">
                    <TeacherClassDaily
                        key={refreshKey}
                        teacherQueues={teacherQueues}
                        draggedBooking={draggedBooking}
                        isLessonTeacher={isLessonTeacher}
                        classboardStats={classboardStats}
                        controller={controller}
                        selectedDate={selectedDate}
                        onEventDeleted={handleEventDeleted}
                        onAddLessonEvent={handleAddLessonEvent}
                        globalFlag={globalFlag}
                    />
                </div>
            </div>
        </div>
    );
}
