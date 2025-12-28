"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import EventCard from "./EventCard";
import TeacherClassCard from "./TeacherClassCard";
import TeacherQueueCard from "./TeacherQueueCard";
import { QueueController } from "@/backend/QueueController";
import type { TeacherQueue, ControllerSettings } from "@/backend/TeacherQueue";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { GlobalFlag } from "@/backend/models/GlobalFlag";

// Muted green - softer than entity color
const TEACHER_COLOR = "#16a34a";

interface TeacherClassDailyV2Props {
    teacherQueues: TeacherQueue[];
    selectedDate: string;
    draggedBooking?: DraggableBooking | null;
    isLessonTeacher?: (bookingId: string, teacherUsername: string) => boolean;
    controller?: ControllerSettings;
    onEventDeleted?: (eventId: string) => void;
    onAddLessonEvent?: (booking: DraggableBooking, teacherUsername: string) => Promise<void>;
    globalFlag?: GlobalFlag;
}

type TeacherFilter = "pending" | "completed";

export default function TeacherClassDailyV2({ 
    teacherQueues, 
    selectedDate,
    draggedBooking,
    isLessonTeacher,
    controller,
    onEventDeleted,
    onAddLessonEvent,
    globalFlag
}: TeacherClassDailyV2Props) {
    const [filter, setFilter] = useState<TeacherFilter>("pending");
    const [isExpanded, setIsExpanded] = useState(true);

    const { filteredQueues, counts } = useMemo(() => {
        // Filter queues based on event status
        const pendingQueues: TeacherQueue[] = [];
        const completedQueues: TeacherQueue[] = [];

        teacherQueues.forEach((queue) => {
            const events = queue.getAllEvents();
            const todayEvents = events.filter((event) => {
                if (!event.eventData.date) return false;
                const eventDate = new Date(event.eventData.date).toISOString().split("T")[0];
                return eventDate === selectedDate;
            });

            // Check if all today's events are completed
            const allCompleted = todayEvents.length > 0 && todayEvents.every((e) => e.eventData.status === "COMPLETED");
            const hasPending = todayEvents.some((e) => e.eventData.status !== "COMPLETED");

            if (allCompleted) {
                completedQueues.push(queue);
            } else if (hasPending || todayEvents.length === 0) {
                pendingQueues.push(queue);
            }
        });

        const counts = {
            pending: pendingQueues.length,
            completed: completedQueues.length,
        };

        return { 
            filteredQueues: filter === "pending" ? pendingQueues : completedQueues, 
            counts 
        };
    }, [teacherQueues, selectedDate, filter]);

    return (
        <div className="flex flex-col h-full">
            {/* Header with Icon and Switch */}
            <div 
                className="p-4 px-6 border-b border-border flex items-center gap-4 cursor-pointer hover:bg-muted/30 active:bg-muted/50 transition-colors select-none flex-shrink-0"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div style={{ color: TEACHER_COLOR }}>
                    <HeadsetIcon className="w-7 h-7 flex-shrink-0" />
                </div>
                <span className="text-lg font-bold text-foreground">Teachers</span>
                <div className="ml-auto flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <ToggleSwitch 
                        value={filter} 
                        onChange={(newFilter) => setFilter(newFilter as TeacherFilter)} 
                        values={{ left: "pending", right: "completed" }} 
                        counts={counts} 
                        tintColor={TEACHER_COLOR}
                    />
                </div>
            </div>

            {/* Collapsible Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-auto flex-1 min-h-0"
                    >
                        <div className="p-4">
                            <div className="flex flex-row flex-wrap gap-4">
                                {filteredQueues.length > 0 ? (
                                    filteredQueues.map((queue) => (
                                        <TeacherQueueCard
                                            key={queue.teacher.username}
                                            queue={queue}
                                            selectedDate={selectedDate}
                                            draggedBooking={draggedBooking}
                                            isLessonTeacher={isLessonTeacher}
                                            controller={controller}
                                            onEventDeleted={onEventDeleted}
                                            onAddLessonEvent={onAddLessonEvent}
                                            globalFlag={globalFlag}
                                        />
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center w-full h-16 text-xs text-muted-foreground/20">
                                        No {filter} teachers
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================
// TeacherQueueCardV2 - Card with collapsible events
// ============================================
interface TeacherQueueCardV2Props {
    queue: TeacherQueue;
    selectedDate: string;
    draggedBooking?: DraggableBooking | null;
    isLessonTeacher?: (bookingId: string, teacherUsername: string) => boolean;
    controller?: ControllerSettings;
    onEventDeleted?: (eventId: string) => void;
    onAddLessonEvent?: (booking: DraggableBooking, teacherUsername: string) => Promise<void>;
    globalFlag?: GlobalFlag;
}

function TeacherQueueCardV2({ 
    queue, 
    selectedDate,
    draggedBooking,
    isLessonTeacher,
    controller,
    onEventDeleted,
    onAddLessonEvent,
    globalFlag
}: TeacherQueueCardV2Props) {
    const [isEventsExpanded, setIsEventsExpanded] = useState(false);
    
    const events = queue.getAllEvents();
    const todayEvents = events.filter((event) => {
        if (!event.eventData.date) return false;
        const eventDate = new Date(event.eventData.date).toISOString().split("T")[0];
        return eventDate === selectedDate;
    });

    const completedCount = todayEvents.filter((e) => e.eventData.status === "COMPLETED").length;
    const pendingCount = todayEvents.filter((e) => e.eventData.status !== "COMPLETED").length;

    // Get stats from queue (includes earnings calculations)
    const stats = useMemo(() => queue.getStats(), [queue]);
    
    // Get earliest start time
    const earliestTime = useMemo(() => queue.getEarliestEventTime(), [queue]);

    // Compute equipment counts from events
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

    // Compute event progress by status
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

    // Create QueueController for gap calculations (only if controller provided)
    const queueController = useMemo(() => {
        if (!controller) return undefined;
        return new QueueController(queue, controller, () => {});
    }, [queue, controller]);

    // Drag handling
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
            {/* Header - TeacherClassCard */}
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

            {/* Events - collapsible */}
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
                                    showLocation={false}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Expand prompt only, no empty state */}
            {todayEvents.length > 0 && !isEventsExpanded && (
                <div 
                    className="p-2 text-center text-xs text-muted-foreground/50 cursor-pointer hover:text-muted-foreground hover:bg-muted/20 transition-colors"
                    onClick={() => setIsEventsExpanded(true)}
                >
                    {todayEvents.length} event{todayEvents.length !== 1 ? "s" : ""} • click to expand
                </div>
            )}
        </div>
    );
}
