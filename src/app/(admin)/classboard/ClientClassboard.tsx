"use client";

import { useClassboard } from "@/src/hooks/useClassboard";
import ClassboardController from "./ClassboardController";
import StudentClassDaily from "./StudentClassDaily";
import TeacherClassDaily from "./TeacherClassDaily";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import type { DraggableBooking } from "@/src/hooks/useClassboard";
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
            // Find the teacher's queue
            const queue = teacherQueues.find((q) => q.teacher.username === teacherUsername);
            if (!queue) return;

            // Find the lesson for this teacher
            const lesson = booking.lessons.find((l) => l.teacherUsername === teacherUsername);
            if (!lesson) return;

            // Get next available slot from teacher queue
            const nextSlot = queue.getNextAvailableSlot(controller);

            // Calculate event date/time
            const dateObj = new Date(selectedDate);
            const [hours, minutes] = nextSlot.split(":").map(Number);
            dateObj.setHours(hours, minutes, 0, 0);
            const eventDate = dateObj.toISOString();

            // Calculate duration based on capacity
            let duration: number;
            if (booking.capacityStudents === 1) {
                duration = controller.durationCapOne;
            } else if (booking.capacityStudents <= 3) {
                duration = controller.durationCapTwo;
            } else {
                duration = controller.durationCapThree;
            }

            // Create the event
            await createClassboardEvent(lesson.id, eventDate, duration, controller.location);
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
            <ClassboardController search={searchQuery} setSearch={setSearchQuery} selectedDate={selectedDate} setSelectedDate={setSelectedDate} controller={controller} setController={setController} stats={globalStats} teacherQueues={teacherQueues} />

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
