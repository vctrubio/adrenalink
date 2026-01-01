"use client";

import StudentClassDaily from "./StudentClassDaily";
import TeacherClassDaily from "./TeacherClassDaily";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import type { TeacherQueue, ControllerSettings } from "@/src/app/(admin)/(classboard)/TeacherQueue";

interface ClassboardContentBoardProps {
    draggableBookings: DraggableBooking[];
    classboardData: ClassboardModel;
    selectedDate: string;
    teacherQueues: TeacherQueue[];
    draggedBooking: DraggableBooking | null;
    isLessonTeacher: (bookingId: string, teacherId: string) => boolean;
    controller: ControllerSettings;
    onSetDraggedBooking: (booking: DraggableBooking | null) => void;
    onAddLessonEvent: (booking: DraggableBooking, lessonId: string) => Promise<void>;
}

export default function ClassboardContentBoard({
    draggableBookings,
    classboardData,
    selectedDate,
    teacherQueues,
    draggedBooking,
    isLessonTeacher,
    controller,
    onSetDraggedBooking,
    onAddLessonEvent,
}: ClassboardContentBoardProps) {
    console.log("📋 [ClassboardContentBoard] Rendering");
    console.log("   - Draggable bookings:", draggableBookings.length);
    console.log("   - Teacher queues:", teacherQueues.length);
    console.log("   - Selected date:", selectedDate);

    // Student props wrapper
    const studentProps = {
        bookings: draggableBookings,
        classboardData,
        selectedDate,
        classboard: {
            onDragStart: (booking: DraggableBooking) => {
                console.log("🎯 [Drag] Started dragging booking:", booking.leaderStudentName);
                onSetDraggedBooking(booking);
            },
            onDragEnd: () => {
                console.log("🎯 [Drag] Ended dragging");
                onSetDraggedBooking(null);
            },
            onAddLessonEvent,
        },
    };

    // Teacher props wrapper
    const teacherProps = {
        teacherQueues,
        selectedDate,
        draggedBooking,
        isLessonTeacher,
        controller,
        onAddLessonEvent,
    };

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
