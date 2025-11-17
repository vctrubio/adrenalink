"use client";

import { useClassboard } from "@/src/hooks/useClassboard";
import ClassboardController from "./ClassboardController";
import StudentClassDaily from "./StudentClassDaily";
import TeacherClassDaily from "./TeacherClassDaily";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import { createClassboardEvent } from "@/actions/classboard-action";
interface ClientClassboardProps {
    data: ClassboardModel;
}

export default function ClientClassboard({ data }: ClientClassboardProps) {
    const { selectedDate, setSelectedDate, searchQuery, setSearchQuery, controller, setController, draggedBooking, setDraggedBooking, classboardData, setClassboardData, draggableBookings, teacherQueues, classboardStats, isLessonTeacher, setOnNewBooking } =
        useClassboard(data);

    const globalStats = classboardStats.getGlobalStats();

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
        <div className="flex flex-col lg:flex-row gap-6 p-6">
            <ClassboardController search={searchQuery} setSearch={setSearchQuery} selectedDate={selectedDate} setSelectedDate={setSelectedDate} controller={controller} setController={setController} stats={globalStats} teacherQueues={teacherQueues} totalBookings={draggableBookings.length} />

            <div className="flex-1 space-y-6">
                <StudentClassDaily
                    bookings={draggableBookings}
                    classboardData={classboardData}
                    selectedDate={selectedDate}
                    onDragStart={(booking) => {
                        setDraggedBooking(booking);
                    }}
                    onDragEnd={() => {
                        setDraggedBooking(null);
                    }}
                    onAddLessonEvent={handleAddLessonEvent}
                    setOnNewBooking={setOnNewBooking}
                />

                <TeacherClassDaily teacherQueues={teacherQueues} draggedBooking={draggedBooking} isLessonTeacher={isLessonTeacher} classboardStats={classboardStats} controller={controller} selectedDate={selectedDate} onEventDeleted={handleEventDeleted} onAddLessonEvent={handleAddLessonEvent} />
            </div>
        </div>
    );
}
