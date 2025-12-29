"use client";

import { motion } from "framer-motion";
import StudentClassDailyV2 from "./StudentClassDailyV2";
import TeacherClassDailyV2 from "./TeacherClassDailyV2";
import LessonFlagLocationSettingsController from "./LessonFlagLocationSettingsController";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import type { TeacherQueue, ControllerSettings } from "@/backend/TeacherQueue";
import type { GlobalFlag } from "@/backend/models/GlobalFlag";

interface ClassboardContentBoardProps {
    draggableBookings: DraggableBooking[];
    classboardData: ClassboardModel;
    selectedDate: string;
    teacherQueues: TeacherQueue[];
    draggedBooking: DraggableBooking | null;
    isLessonTeacher: (bookingId: string, teacherUsername: string) => boolean;
    controller: ControllerSettings;
    globalFlag: GlobalFlag;
    availableTeachers: { username: string; firstName: string; id: string }[];
    onSetDraggedBooking: (booking: DraggableBooking | null) => void;
    onAddLessonEvent: (booking: DraggableBooking, teacherUsername: string) => Promise<void>;
    onAddTeacher: (booking: DraggableBooking, teacherUsername: string) => Promise<void>;
    onEventDeleted: (eventId: string) => void;
    refreshKey: number;
    isSettingsOpen: boolean;
    onSettingsClose: () => void;
    onRefresh: () => void;
}

export default function ClassboardContentBoard({
    draggableBookings,
    classboardData,
    selectedDate,
    teacherQueues,
    draggedBooking,
    isLessonTeacher,
    controller,
    globalFlag,
    availableTeachers,
    onSetDraggedBooking,
    onAddLessonEvent,
    onAddTeacher,
    onEventDeleted,
    refreshKey,
    isSettingsOpen,
    onSettingsClose,
    onRefresh
}: ClassboardContentBoardProps) {

    // Student props wrapper
    const studentProps = {
        bookings: draggableBookings,
        classboardData,
        selectedDate,
        classboard: {
            onDragStart: (booking: DraggableBooking) => onSetDraggedBooking(booking),
            onDragEnd: () => onSetDraggedBooking(null),
            onAddLessonEvent,
            onAddTeacher,
            availableTeachers,
        }
    };

    // Teacher props wrapper
    const teacherProps = {
        teacherQueues,
        selectedDate,
        draggedBooking,
        isLessonTeacher,
        controller,
        onEventDeleted,
        onAddLessonEvent,
        globalFlag
    };

    return (
        <div className="flex-1 p-4 overflow-hidden min-h-0 flex flex-col">
            <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0">
                
                {/* Left Column: Students OR Settings */}
                <div className="w-full xl:w-[400px] flex-shrink-0 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 flex flex-col transition-all duration-300 relative bg-card/30">
                    {isSettingsOpen ? (
                        <LessonFlagLocationSettingsController 
                            globalFlag={globalFlag}
                            teacherQueues={teacherQueues}
                            onClose={onSettingsClose}
                            onRefresh={onRefresh}
                        />
                    ) : (
                        <StudentClassDailyV2 {...studentProps} />
                    )}
                </div>
                
                {/* Teachers Section - Main Content Area */}
                <div className="flex-1 min-w-0 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 flex flex-col transition-all duration-300">
                    <TeacherClassDailyV2 {...teacherProps} refreshKey={refreshKey} />
                </div>

            </div>
        </div>
    );
}
