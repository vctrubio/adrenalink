"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EventCard from "./EventCard";
import TeacherClassCard from "./TeacherClassCard";
import { QueueController } from "@/backend/QueueController";
import type { TeacherQueue, ControllerSettings } from "@/backend/TeacherQueue";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { GlobalFlag } from "@/backend/models/GlobalFlag";

interface TeacherQueueCardProps {
    queue: TeacherQueue;
    selectedDate: string;
    draggedBooking?: DraggableBooking | null;
    isLessonTeacher?: (bookingId: string, teacherUsername: string) => boolean;
    controller?: ControllerSettings;
    onEventDeleted?: (eventId: string) => void;
    onAddLessonEvent?: (booking: DraggableBooking, teacherUsername: string) => Promise<void>;
    globalFlag?: GlobalFlag;
}

export default function TeacherQueueCard({ 
    queue, 
    selectedDate,
    draggedBooking,
    isLessonTeacher,
    controller,
    onEventDeleted,
    onAddLessonEvent,
    globalFlag
}: TeacherQueueCardProps) {
    const [isEventsExpanded, setIsEventsExpanded] = useState(false);
    const events = queue.getAllEvents();
    const todayEvents = events.filter((event) => {
        if (!event.eventData.date) return false;
        const eventDate = new Date(event.eventData.date).toISOString().split("T")[0];
        return eventDate === selectedDate;
    });
    const completedCount = todayEvents.filter((e) => e.eventData.status === "COMPLETED").length;
    const pendingCount = todayEvents.filter((e) => e.eventData.status !== "COMPLETED").length;
    const stats = useMemo(() => queue.getStats(), [queue]);
    const earliestTime = useMemo(() => queue.getEarliestEventTime(), [queue]);
    const equipmentCounts = useMemo(() => {
        const counts = new Map<string, number>();
        todayEvents.forEach((e) => {
            const cat = e.packageData?.categoryEquipment;
            if (cat) {
                counts.set(cat, (counts.get(cat) || 0) + 1);
            }
        });
        return Array.from(counts.entries()).map(([categoryId, count]) => ({ categoryId, count }));
    }, [todayEvents]);
    const eventProgress = useMemo(() => {
        const completed = todayEvents
            .filter((e) => e.eventData.status === "COMPLETED")
            .reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
        const planned = todayEvents
            .filter((e) => e.eventData.status === "PLANNED")
            .reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
        const tbc = todayEvents
            .filter((e) => e.eventData.status === "TBC")
            .reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
        const total = completed + planned + tbc;
        return { completed, planned, tbc, total };
    }, [todayEvents]);
    const queueController = useMemo(() => {
        if (!controller) return undefined;
        return new QueueController(queue, controller, () => {});
    }, [queue, controller]);
    const canAcceptDrop = useMemo(() => {
        if (!draggedBooking || !isLessonTeacher) return false;
        return isLessonTeacher(draggedBooking.bookingId, queue.teacher.username);
    }, [draggedBooking, isLessonTeacher, queue.teacher.username]);
    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        if (draggedBooking && canAcceptDrop && onAddLessonEvent) {
            await onAddLessonEvent(draggedBooking, queue.teacher.username);
        }
    };
    return (
        <div 
            className={`w-[320px] flex-shrink-0 bg-background border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col ${
                canAcceptDrop ? "border-yellow-500 border-2" : "border-border"
            }`}
            onDragOver={(e) => canAcceptDrop && e.preventDefault()}
            onDrop={handleDrop}
        >
            <TeacherClassCard
                teacherName={queue.teacher.username}
                stats={stats}
                earliestTime={earliestTime}
                pendingCount={pendingCount}
                completedCount={completedCount}
                equipmentCounts={equipmentCounts}
                eventProgress={eventProgress}
                onClick={() => setIsEventsExpanded(!isEventsExpanded)}
            />
            <AnimatePresence>
                {isEventsExpanded && todayEvents.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex-1 min-h-0 flex flex-col"
                    >
                        <div className="p-3 space-y-3 flex-1 min-h-0 overflow-auto">
                            {todayEvents.map((event, index) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    queue={queue}
                                    queueController={queueController}
                                    onDeleteComplete={() => onEventDeleted?.(event.id)}
                                    showLocation={true}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}