"use client";

import { useClassboard } from "@/src/hooks/useClassboard";
import ClassboardController from "./ClassboardController";
import StudentClassDaily from "./StudentClassDaily";
import TeacherClassDaily from "./TeacherClassDaily";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import type { DraggableBooking } from "@/src/hooks/useClassboard";
import { findLessonForTeacher, calculateEventTime, createEventForLesson } from "@/getters/classboard-event-getter";

interface ClientClassboardProps {
    data: ClassboardModel;
}

export default function ClientClassboard({ data }: ClientClassboardProps) {
    const { selectedDate, setSelectedDate, searchQuery, setSearchQuery, controller, setController, draggedBooking, setDraggedBooking, classboardData, setClassboardData, draggableBookings, teacherQueues, classboardStats, isLessonTeacher, setOnNewBooking } = useClassboard(data);

    const globalStats = classboardStats.getGlobalStats();

    const handleAddLessonEvent = async (booking: DraggableBooking, teacherUsername: string) => {
        try {
            // Find the teacher's queue
            const queue = teacherQueues.find((q) => q.teacher.username === teacherUsername);
            if (!queue) return;

            // Find the lesson for this teacher
            const lesson = findLessonForTeacher({ booking, teacherUsername });
            if (!lesson) return;

            // Get next available slot from teacher queue
            const nextSlot = queue.getNextAvailableSlot(controller);

            // Calculate event date/time and duration
            const { eventDate, duration } = calculateEventTime({
                booking,
                nextSlot,
                selectedDate,
                controller,
            });

            // Create the event
            await createEventForLesson({
                lessonId: lesson.id,
                eventDate,
                duration,
                location: controller.location,
            });
        } catch (error) {
            console.error("Error adding lesson event:", error);
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
            <ClassboardController
            search={searchQuery}
            setSearch={setSearchQuery}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            controller={controller}
            setController={setController}
            stats={globalStats}
            />

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

            <TeacherClassDaily teacherQueues={teacherQueues} draggedBooking={draggedBooking} isLessonTeacher={isLessonTeacher} classboardStats={classboardStats} controller={controller} selectedDate={selectedDate} onEventDeleted={handleEventDeleted} />
            </div>
        </div>
    );
}
