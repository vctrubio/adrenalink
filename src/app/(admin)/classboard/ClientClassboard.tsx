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
        console.log("📍 [ClientClassboard] handleAddLessonEvent called:", { booking: booking.bookingId, teacherUsername, selectedDate });
        try {
            // Find the teacher's queue
            const queue = teacherQueues.find((q) => q.teacher.username === teacherUsername);
            if (!queue) {
                console.warn("❌ [ClientClassboard] Queue not found for teacher:", teacherUsername);
                return;
            }

            // Find the lesson for this teacher
            const lesson = booking.lessons.find((l) => l.teacherUsername === teacherUsername);
            if (!lesson) {
                console.warn("❌ [ClientClassboard] Lesson not found for teacher:", teacherUsername);
                return;
            }

            // Calculate duration based on capacity (1 = private, 2 = semi-private, 3+ = group)
            let duration: number;
            if (booking.capacityStudents === 1) {
                duration = controller.durationCapOne;
            } else if (booking.capacityStudents === 2) {
                duration = controller.durationCapTwo;
            } else {
                duration = controller.durationCapThree;
            }

            console.log("📍 [ClientClassboard] Duration calculated:", { capacity: booking.capacityStudents, duration });

            // Get smart insertion info (checks submitTime first, then determines if should go to head or tail)
            const insertionInfo = queue.getSmartInsertionInfo(controller.submitTime, duration, controller.gapMinutes);
            console.log("📍 [ClientClassboard] Smart insertion info:", insertionInfo);

            // Calculate event date/time
            // CRITICAL: Create ISO string with LOCAL time, NOT UTC
            const dateObj = new Date(selectedDate);
            const [hours, minutes] = insertionInfo.time.split(":").map(Number);

            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const day = String(dateObj.getDate()).padStart(2, "0");
            const hoursStr = String(hours).padStart(2, "0");
            const minutesStr = String(minutes).padStart(2, "0");
            const eventDate = `${year}-${month}-${day}T${hoursStr}:${minutesStr}:00`;

            console.log("📍 [ClientClassboard] Event date calculated:", { selectedDate, insertionTime: insertionInfo.time, eventDate });

            // Create the event (will be added to queue by listener based on event time)
            console.log("📍 [ClientClassboard] Calling createClassboardEvent...");
            await createClassboardEvent(lesson.id, eventDate, duration, controller.location);
            console.log("✅ [ClientClassboard] createClassboardEvent completed");
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

                <TeacherClassDaily teacherQueues={teacherQueues} draggedBooking={draggedBooking} isLessonTeacher={isLessonTeacher} classboardStats={classboardStats} controller={controller} selectedDate={selectedDate} onEventDeleted={handleEventDeleted} onAddLessonEvent={handleAddLessonEvent} />
            </div>
        </div>
    );
}
