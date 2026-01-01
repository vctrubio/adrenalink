"use client";

import { useMemo, useCallback } from "react";
import StudentClassDaily from "./StudentClassDaily";
import TeacherClassDaily from "./TeacherClassDaily";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import type { ClassboardData } from "@/backend/models/ClassboardModel";
import type { TeacherQueue } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";

interface ClassboardContentBoardProps {
    bookingsForSelectedDate: ClassboardData[];
    teacherQueues: TeacherQueue[];
    draggedBooking: DraggableBooking | null;
    onSetDraggedBooking: (booking: DraggableBooking | null) => void;
    onAddLessonEvent: (bookingData: ClassboardData, lessonId: string) => Promise<void>;
}

export default function ClassboardContentBoard({
    bookingsForSelectedDate,
    teacherQueues,
    draggedBooking,
    onSetDraggedBooking,
    onAddLessonEvent,
}: ClassboardContentBoardProps) {
    const { controller } = useClassboardContext();

    console.log("📋 [ClassboardContentBoard] Rendering");
    console.log("   - Bookings:", bookingsForSelectedDate.length);
    console.log("   - Teacher queues:", teacherQueues.length);

    // Wrapper to look up booking data before calling the handler
    const handleAddLessonEventWithLookup = useCallback(
        async (bookingId: string, lessonId: string) => {
            console.log("🔍 [ClassboardContentBoard] handleAddLessonEventWithLookup called");
            console.log("   - bookingId:", bookingId, "type:", typeof bookingId);
            console.log("   - lessonId:", lessonId);
            
            // Handle case where bookingId might be a DraggableBooking object
            let actualBookingId = bookingId;
            if (typeof bookingId === "object" && bookingId !== null && "bookingId" in bookingId) {
                console.warn("⚠️ [ClassboardContentBoard] Received DraggableBooking instead of bookingId, extracting...");
                actualBookingId = (bookingId as any).bookingId;
            }
            
            const bookingData = bookingsForSelectedDate.find((b) => b.booking.id === actualBookingId);
            if (!bookingData) {
                console.error("❌ [ClassboardContentBoard] Booking not found:", actualBookingId);
                return;
            }
            await onAddLessonEvent(bookingData, lessonId);
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
                onAddLessonEvent: handleAddLessonEventWithLookup,
            },
        }),
        [bookingsForSelectedDate, onSetDraggedBooking, handleAddLessonEventWithLookup],
    );

    // Teacher props wrapper - memoized to prevent unnecessary re-renders
    const teacherProps = useMemo(
        () => ({
            teacherQueues,
            draggedBooking,
            controller,
            onAddLessonEvent: handleAddLessonEventWithLookup,
        }),
        [teacherQueues, draggedBooking, controller, handleAddLessonEventWithLookup],
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
