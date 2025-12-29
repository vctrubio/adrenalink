"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import EventCard from "./EventCard";
import TeacherClassCard from "./TeacherClassCard";
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

type TeacherFilter = "active" | "all";

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
    const [filter, setFilter] = useState<TeacherFilter>("active");
    const [isExpanded, setIsExpanded] = useState(true);

    const { filteredQueues, counts } = useMemo(() => {
        // Filter queues based on whether they have events today
        const activeQueues: TeacherQueue[] = [];
        const allQueues: TeacherQueue[] = teacherQueues;

        teacherQueues.forEach((queue) => {
            const events = queue.getAllEvents();
            const todayEvents = events.filter((event) => {
                if (!event.eventData.date) return false;
                const eventDate = new Date(event.eventData.date).toISOString().split("T")[0];
                return eventDate === selectedDate;
            });

            if (todayEvents.length > 0) {
                activeQueues.push(queue);
            }
        });

        const counts = {
            active: activeQueues.length,
            all: allQueues.length,
        };

        return { 
            filteredQueues: filter === "active" ? activeQueues : allQueues, 
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
                        values={{ left: "active", right: "all" }} 
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
                        <div className="p-2">
                            <div className="flex flex-col divide-y divide-zinc-400/50 dark:divide-zinc-500/50">
                                {filteredQueues.length > 0 ? (
                                    filteredQueues.map((queue) => (
                                        <div key={queue.teacher.username} className="py-2">
                                            <TeacherQueueCardV2
                                                queue={queue}
                                                selectedDate={selectedDate}
                                                draggedBooking={draggedBooking}
                                                isLessonTeacher={isLessonTeacher}
                                                controller={controller}
                                                onEventDeleted={onEventDeleted}
                                                onAddLessonEvent={onAddLessonEvent}
                                                globalFlag={globalFlag}
                                            />
                                        </div>
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
    const [isExpanded, setIsExpanded] = useState(true);

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
            className={`w-full bg-transparent overflow-hidden transition-all duration-200 flex flex-row items-stretch group/row ${
                canAcceptDrop ? "bg-yellow-500/5 ring-1 ring-yellow-500/20 rounded-xl" : ""
            }`}
            onDragOver={(e) => canAcceptDrop && e.preventDefault()}
            onDrop={handleDrop}
        >
            {/* Left: Teacher Info Card */}
            {/* When expanded: Fixed width, with border */}
            {/* When collapsed: Full width (flex-1), no border */}
            <div className={`flex-shrink-0 transition-all duration-200 ${isExpanded ? "w-[300px] border-r border-border/50" : "flex-1 border-r-0"}`}>
                <TeacherClassCard
                    teacherName={queue.teacher.username}
                    stats={stats}
                    earliestTime={earliestTime}
                    pendingCount={pendingCount}
                    completedCount={completedCount}
                    equipmentCounts={equipmentCounts}
                    eventProgress={eventProgress}
                    onClick={() => setIsExpanded(!isExpanded)}
                />
            </div>

            {/* Right: Events Queue (Horizontal Scroll) */}
            {isExpanded && (
                <div className="flex-1 min-w-0 flex items-center p-4 overflow-x-auto scrollbar-hide">
                    <div className="flex flex-row gap-4 h-full items-center">
                        {todayEvents.length > 0 &&
                            todayEvents.map((event) => (
                                <div key={event.id} className="w-[320px] flex-shrink-0 h-full flex flex-col justify-center">
                                    <EventCard
                                        event={event}
                                        queue={queue}
                                        queueController={queueController}
                                        onDeleteComplete={() => onEventDeleted?.(event.id)}
                                        showLocation={false}
                                    />
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
}
