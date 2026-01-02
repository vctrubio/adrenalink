"use client";

import { useMemo, useCallback } from "react";
import StudentClassDaily from "./StudentClassDaily";
import TeacherClassDaily from "./TeacherClassDaily";
import type { ClassboardData } from "@/backend/models/ClassboardModel";
import type { TeacherQueueV2 } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";

interface ClassboardContentBoardProps {
    bookingsForSelectedDate: ClassboardData[];
    teacherQueues: TeacherQueueV2[];
    draggedBooking: DraggableBooking | null;
    onSetDraggedBooking: (booking: DraggableBooking | null) => void;
    onAddLessonEvent: (lessonId: string, teacherId: string, capacityStudents: number) => Promise<void>;
}

export default function ClassboardContentBoard({
    bookingsForSelectedDate,
    teacherQueues,
    draggedBooking,
    onSetDraggedBooking,
    onAddLessonEvent,
}: ClassboardContentBoardProps) {
    console.log("📋 [ClassboardContentBoard] Rendering1234567890");
 

    // Wrapper for StudentBookingCard: converts (bookingId, lessonId) -> (lessonId, teacherId, capacityStudents)
    const handleAddLessonEventFromStudent = useCallback(
        async (bookingId: string, lessonId: string) => {
            console.log("🔍 [ClassboardContentBoard] Student booking card - Adding lesson");
            console.log("   - bookingId:", bookingId);
            console.log("   - lessonId:", lessonId);

            const bookingData = bookingsForSelectedDate.find((b) => b.booking.id === bookingId);
            if (!bookingData) {
                console.error("❌ [ClassboardContentBoard] Booking not found:", bookingId);
                return;
            }

            const lesson = bookingData.lessons.find((l) => l.id === lessonId);
            if (!lesson?.teacher) {
                console.error("❌ [ClassboardContentBoard] Lesson or teacher not found");
                return;
            }

            console.log("   - Teacher ID:", lesson.teacher.id, "Username:", lesson.teacher.username);
            console.log("   - Capacity:", bookingData.schoolPackage.capacityStudents);
            await onAddLessonEvent(lessonId, lesson.teacher.id, bookingData.schoolPackage.capacityStudents);
        },
        [bookingsForSelectedDate, onAddLessonEvent],
    );

    // Student props wrapper - memoized to prevent unnecessary re-renders
    const studentProps = useMemo(
        () => ({
            bookings: bookingsForSelectedDate,
            classboard: {
                onDragStart: (draggableBooking: DraggableBooking) => {
                    console.log("🎯 [Drag] Started dragging booking:", draggableBooking);
                    onSetDraggedBooking(draggableBooking);
                },
                onDragEnd: () => {
                    console.log("🎯 [Drag] Ended dragging");
                    onSetDraggedBooking(null);
                },
                onAddLessonEvent: handleAddLessonEventFromStudent,
            },
        }),
        [bookingsForSelectedDate, onSetDraggedBooking, handleAddLessonEventFromStudent],
    );

    // Teacher props wrapper - memoized to prevent unnecessary re-renders
    const teacherProps = useMemo(
        () => ({
            teacherQueues,
            draggedBooking,
            onAddLessonEvent,
        }),
        [teacherQueues, draggedBooking, onAddLessonEvent],
    );

    return (
        <div className="flex-1 p-4 overflow-hidden min-h-0 flex flex-col">
            <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0">
                {/* Left Column: Students */}
                <div className="w-full xl:w-[400px] flex-shrink-0 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 flex flex-col transition-all duration-300 relative bg-card/30">
                    <StudentClassDaily {...studentProps} />
                </div>

                {/* Right Column: Teachers */}
                <div className="flex-1 min-w-0 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 flex flex-col transition-all duration-300">
                    <TeacherClassDaily {...teacherProps} />
                </div>
            </div>
        </div>
    );
}
