"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import ExpandCollapseButtons from "@/src/components/ui/ExpandCollapseButtons";
import EventCard from "./EventCard";
import EventModCard from "./EventModCard";
import TeacherClassCard from "./TeacherClassCard";
import { QueueController } from "@/backend/QueueController";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";
import type { TeacherQueue, ControllerSettings, EventNode } from "@/backend/TeacherQueue";
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
    refreshKey?: number;
}

type TeacherFilter = "active" | "all";

export default function TeacherClassDailyV2({ teacherQueues, selectedDate, draggedBooking, isLessonTeacher, controller, onEventDeleted, onAddLessonEvent, globalFlag, refreshKey }: TeacherClassDailyV2Props) {

    if (process.env.NEXT_PUBLIC_DEBUG_RENDER === "true") {

        console.log(`[CLASSBOARD] TeacherClassDailyV2 rendered. RefreshKey: ${refreshKey}`);

    }



    const [filter, setFilter] = useState<TeacherFilter>("active");

    const [expandedTeachers, setExpandedTeachers] = useState<Set<string>>(new Set(teacherQueues.map((q) => q.teacher.username)));



    const toggleTeacherExpanded = (teacherUsername: string) => {

        setExpandedTeachers((prev) => {

            const newSet = new Set(prev);

            if (newSet.has(teacherUsername)) {

                newSet.delete(teacherUsername);

            } else {

                newSet.add(teacherUsername);

            }

            return newSet;

        });

    };



    const expandAllTeachers = () => {

        setExpandedTeachers(new Set(teacherQueues.map((q) => q.teacher.username)));

    };



    const collapseAllTeachers = () => {

        setExpandedTeachers(new Set());

    };



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

            counts,

        };

    }, [teacherQueues, selectedDate, filter, refreshKey]);



    const allTeachersExpanded = filteredQueues.length > 0 && filteredQueues.every(q => expandedTeachers.has(q.teacher.username));



    const toggleAllTeachers = () => {

        if (allTeachersExpanded) {

            collapseAllTeachers();

        } else {

            expandAllTeachers();

        }

    };



    return (

        <div className="flex flex-col h-full">

            {/* Header with Icon and Switch */}

            <div 

                className="p-4 px-6 border-b-2 border-background bg-card flex items-center gap-4 cursor-pointer hover:bg-muted/30 active:bg-muted/50 transition-colors select-none flex-shrink-0"

                onClick={toggleAllTeachers}

            >

                <div style={{ color: TEACHER_COLOR }}>

                    <HeadsetIcon className="w-7 h-7 flex-shrink-0" />

                </div>

                <span className="text-lg font-bold text-foreground">Teachers</span>

                <div className="ml-auto flex items-center gap-3" onClick={(e) => e.stopPropagation()}>

                    <ToggleSwitch value={filter} onChange={(newFilter) => setFilter(newFilter as TeacherFilter)} values={{ left: "active", right: "all" }} counts={counts} tintColor={TEACHER_COLOR} />

                </div>

            </div>



            {/* List Content */}

            <div className="overflow-auto flex-1 min-h-0">

                <div className="p-2 bg-card">

                    <div className="flex flex-col divide-y-2 divide-background">

                        {filteredQueues.length > 0 ? (

                            filteredQueues.map((queue) => {

                                return (

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

                                                                                            isExpanded={expandedTeachers.has(queue.teacher.username)}

                                                                                            onToggleExpand={() => toggleTeacherExpanded(queue.teacher.username)}

                                                                                            parentRefreshKey={refreshKey}

                                                                                        />

                                    </div>

                                );

                            })

                        ) : (

                            <div className="flex items-center justify-center w-full h-16 text-xs text-muted-foreground/20">No {filter} teachers</div>

                        )}

                    </div>

                </div>

            </div>

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
    isExpanded: boolean;
    onToggleExpand: () => void;
    parentRefreshKey?: number;
}

function TeacherQueueCardV2({ queue, selectedDate, draggedBooking, isLessonTeacher, controller, onEventDeleted, onAddLessonEvent, globalFlag, isExpanded, onToggleExpand, parentRefreshKey }: TeacherQueueCardV2Props) {
    const [isAdjustmentMode, setIsAdjustmentMode] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const originalQueueState = useRef<EventNode[]>([]);

    // Auto-enter adjustment mode when global adjustment mode is active
    useEffect(() => {
        const isGlobalAdjustmentMode = globalFlag?.isAdjustmentMode?.();
        const isPending = isGlobalAdjustmentMode && globalFlag?.getPendingTeachers?.().has(queue.teacher.username);

        if (isPending && !isAdjustmentMode) {
            setIsAdjustmentMode(true);
        } else if (!isGlobalAdjustmentMode && isAdjustmentMode) {
            setIsAdjustmentMode(false);
        }
    }, [globalFlag, queue.teacher.username, isAdjustmentMode, parentRefreshKey]);

    // Store original state when entering edit mode
    useEffect(() => {
        if (isAdjustmentMode && queue && originalQueueState.current.length === 0) {
            const allEvents = queue.getAllEvents();
            originalQueueState.current = allEvents.map((event) => ({
                ...event,
                eventData: { ...event.eventData },
            }));
        }
        // Clear original state when exiting edit mode
        if (!isAdjustmentMode) {
            originalQueueState.current = [];
        }
    }, [isAdjustmentMode, queue]);

    const events = queue.getAllEvents();
    const todayEvents = events.filter((event) => {
        if (!event.eventData.date) return false;
        const eventDate = new Date(event.eventData.date).toISOString().split("T")[0];
        return eventDate === selectedDate;
    });

    const completedCount = todayEvents.filter((e) => e.eventData.status === "completed").length;
    const pendingCount = todayEvents.filter((e) => e.eventData.status !== "completed").length;

    // Get stats from queue (includes earnings calculations)
    const stats = useMemo(() => queue.getStats(), [queue, refreshKey]);

    // Get earliest start time
    const earliestTime = useMemo(() => queue.getEarliestEventTime(), [queue, refreshKey]);

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
        const completed = todayEvents.filter((e) => e.eventData.status === "completed").reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
        const planned = todayEvents.filter((e) => e.eventData.status === "planned").reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
        const tbc = todayEvents.filter((e) => e.eventData.status === "tbc").reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
        const total = completed + planned + tbc;

        // Collect all event IDs for batch updates
        const eventIds = todayEvents.map((e) => e.id);

        return { completed, planned, tbc, total, eventIds };
    }, [todayEvents]);

    // Create QueueController for gap calculations (only if controller provided)
    const queueController = useMemo(() => {
        if (!controller) return undefined;
        return new QueueController(queue, controller, () => {
            setRefreshKey((prev) => prev + 1);
        });
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

    // Adjustment mode handlers
    const changedEvents = events.filter((currentEvent) => {
        const originalEvent = originalQueueState.current.find((e) => e.id === currentEvent.id);
        if (!originalEvent) return false;
        const dateChanged = currentEvent.eventData.date !== originalEvent.eventData.date;
        const durationChanged = currentEvent.eventData.duration !== originalEvent.eventData.duration;
        const locationChanged = currentEvent.eventData.location !== originalEvent.eventData.location;
        return dateChanged || durationChanged || locationChanged;
    });

    const hasChanges = changedEvents.length > 0;
    const changedCount = changedEvents.length;

    const handleSubmit = async () => {
        try {
            const updates = events
                .filter((event) => event.id)
                .filter((currentEvent) => {
                    const originalEvent = originalQueueState.current.find((e) => e.id === currentEvent.id);
                    if (!originalEvent) return true;
                    const dateChanged = currentEvent.eventData.date !== originalEvent.eventData.date;
                    const durationChanged = currentEvent.eventData.duration !== originalEvent.eventData.duration;
                    const locationChanged = currentEvent.eventData.location !== originalEvent.eventData.location;
                    return dateChanged || durationChanged || locationChanged;
                })
                .map((event) => ({
                    id: event.id,
                    date: event.eventData.date,
                    duration: event.eventData.duration,
                    location: event.eventData.location,
                }));

            if (updates.length > 0) {
                const result = await bulkUpdateClassboardEvents(updates);
                if (!result.success) {
                    console.error("Failed to update events:", result.error);
                    return;
                }
            }

            // If in global mode, opt out after saving
            const isGlobalAdjustmentMode = globalFlag?.isAdjustmentMode?.();
            if (isGlobalAdjustmentMode) {
                globalFlag?.optOut?.(queue.teacher.username);
            }

            setIsAdjustmentMode(false);
        } catch (error) {
            console.error("Error submitting queue changes:", error);
        }
    };

    const handleReset = () => {
        if (originalQueueState.current.length > 0 && queue) {
            const allEvents = queue.getAllEvents();
            originalQueueState.current.forEach((originalEvent, index) => {
                const currentEvent = allEvents[index];
                if (currentEvent) {
                    currentEvent.eventData.date = originalEvent.eventData.date;
                    currentEvent.eventData.duration = originalEvent.eventData.duration;
                    currentEvent.eventData.location = originalEvent.eventData.location;
                }
            });
            setRefreshKey((prev) => prev + 1);
        }
    };

    const handleCancel = () => {
        handleReset();
        // Check if in global adjustment mode - if so, opt out instead of just closing
        const isGlobalAdjustmentMode = globalFlag?.isAdjustmentMode?.();
        if (isGlobalAdjustmentMode) {
            globalFlag?.optOut?.(queue.teacher.username);
        }
        setIsAdjustmentMode(false);
    };

    // Handle toggle adjustment mode - prevent manual exit if in global mode
    const handleToggleAdjustment = (mode: boolean) => {
        const isGlobalAdjustmentMode = globalFlag?.isAdjustmentMode?.();
        const isPending = isGlobalAdjustmentMode && globalFlag?.getPendingTeachers?.().has(queue.teacher.username);

        // If trying to exit adjustment mode while in global mode, opt out instead
        if (!mode && isPending) {
            globalFlag?.optOut?.(queue.teacher.username);
        }

        setIsAdjustmentMode(mode);
    };

    return (
        <div
            className={`w-full bg-transparent overflow-hidden transition-all duration-200 flex flex-row items-stretch group/row ${canAcceptDrop ? "bg-yellow-500/5 ring-1 ring-yellow-500/20 rounded-xl" : ""}`}
            onDragOver={(e) => canAcceptDrop && e.preventDefault()}
            onDrop={handleDrop}
        >
            {/* Left: Teacher Info Card */}
            {/* When expanded: Fixed width, with border */}
            {/* When collapsed: Full width (flex-1), no border */}
            <div className={`flex-shrink-0 transition-all duration-200 p-2 ${isExpanded ? "w-[340px] border-r-2 border-background" : "flex-1 border-r-0"}`}>
                <TeacherClassCard
                    teacherName={queue.teacher.username}
                    stats={stats}
                    earliestTime={earliestTime}
                    pendingCount={pendingCount}
                    completedCount={completedCount}
                    equipmentCounts={equipmentCounts}
                    eventProgress={eventProgress}
                    onClick={onToggleExpand}
                    isExpanded={isExpanded}
                    queue={queue}
                    selectedDate={selectedDate}
                    controller={controller}
                    isAdjustmentMode={isAdjustmentMode}
                    onToggleAdjustment={handleToggleAdjustment}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    onCancel={handleCancel}
                    hasChanges={hasChanges}
                    changedCount={changedCount}
                />
            </div>

            {/* Right: Events Queue (Horizontal Scroll) */}
            {isExpanded && (
                <div className="flex-1 min-w-0 flex items-center p-2 overflow-x-auto scrollbar-hide">
                    <div className="flex flex-row gap-4 h-full items-center">
                        {isAdjustmentMode ? (
                            /* Adjustment Mode: Show EventModCards */
                            events.length > 0 ? (
                                events.map((event) => (
                                    <div key={event.id} className="w-[320px] flex-shrink-0 h-full flex flex-col justify-center">
                                        {queueController && <EventModCard eventId={event.id} queueController={queueController} onDelete={() => onEventDeleted?.(event.id)} />}
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center w-full text-xs text-muted-foreground">No events to adjust</div>
                            )
                        ) : (
                            /* Normal Mode: Show EventCards */
                            todayEvents.length > 0 &&
                            todayEvents.map((event) => (
                                <div key={event.id} className="w-[320px] flex-shrink-0 h-full flex flex-col justify-center">
                                    <EventCard event={event} queue={queue} queueController={queueController} onDeleteComplete={() => onEventDeleted?.(event.id)} showLocation={true} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
