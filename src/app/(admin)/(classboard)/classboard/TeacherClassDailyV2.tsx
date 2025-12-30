"use client";

import { useState, useMemo, useRef, useEffect, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
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
    globalFlag?: globalFlag;
    refreshKey?: number;
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
    globalFlag,
    refreshKey,
}: TeacherClassDailyV2Props) {
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

    const allTeachersExpanded = filteredQueues.length > 0 && filteredQueues.every((q) => expandedTeachers.has(q.teacher.username));

    const toggleAllTeachers = () => {
        if (allTeachersExpanded) {
            collapseAllTeachers();
        } else {
            expandAllTeachers();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header: Global Toggles & Filter */}
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

            {/* Teacher List Content */}
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
// TeacherQueueCardV2 - Individual Teacher Row
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

/**
 * TeacherQueueCardV2 manages the view and local state for a single teacher's queue.
 * COORDINATION RULES:
 * 1. Global Session Sync: Auto-enters adjustment mode when added to GlobalFlag queue.
 * 2. Auto-Exit: Auto-exits adjustment mode when GlobalFlag panel is closed OR teacher removed from queue.
 * 3. Individual Mode: Supports manual adjustment mode even when global flag is inactive.
 * 4. Refresh Stability: Uses parentRefreshKey to re-sync with GlobalFlag class state without full remounts.
 */
const TeacherQueueCardV2 = memo(({
    queue,
    selectedDate,
    draggedBooking,
    isLessonTeacher,
    controller,
    onEventDeleted,
    onAddLessonEvent,
    globalFlag,
    isExpanded,
    onToggleExpand,
    parentRefreshKey,
}: TeacherQueueCardV2Props) => {
    const [isAdjustmentMode, setIsAdjustmentMode] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const originalQueueState = useRef<EventNode[]>([]);
    const wasGlobalModeRef = useRef(false);

    // Auto-sync local UI mode with global session state
    useEffect(() => {
        const isGlobalMode = globalFlag?.isAdjustmentMode?.();
        const isPending = isGlobalMode && globalFlag?.getPendingTeachers?.().has(queue.teacher.username);

        // 1. Session Closing: Close local edit mode if the global panel was just shut down
        if (wasGlobalModeRef.current && !isGlobalMode && isAdjustmentMode) {
            setIsAdjustmentMode(false);
        }
        // 2. Queue Entry: Switch to edit mode if added to the pending adjustment queue
        else if (isPending && !isAdjustmentMode) {
            setIsAdjustmentMode(true);
        }
        // 3. Queue Removal: Exit edit mode if manually removed from global queue while session is still active
        else if (isGlobalMode && !isPending && isAdjustmentMode) {
            setIsAdjustmentMode(false);
        }

        wasGlobalModeRef.current = !!isGlobalMode;
    }, [globalFlag, queue.teacher.username, isAdjustmentMode, parentRefreshKey]);

    // Snapshot state management
    useEffect(() => {
        if (isAdjustmentMode && queue && originalQueueState.current.length === 0) {
            const allEvents = queue.getAllEvents();
            originalQueueState.current = allEvents.map((event) => ({
                ...event,
                eventData: { ...event.eventData },
            }));
        }
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

    // Summary stats re-calculated on parent or internal refresh
    const stats = useMemo(() => queue.getStats(), [queue, refreshKey, parentRefreshKey]);
    const earliestTime = useMemo(() => queue.getEarliestEventTime(), [queue, refreshKey, parentRefreshKey]);

    const equipmentCounts = useMemo(() => {
        const counts = new Map<string, number>();
        todayEvents.forEach((e) => {
            const cat = e.packageData?.categoryEquipment;
            if (cat) counts.set(cat, (counts.get(cat) || 0) + 1);
        });
        return Array.from(counts.entries()).map(([categoryId, count]) => ({ categoryId, count }));
    }, [todayEvents]);

    const eventProgress = useMemo(() => {
        const completed = todayEvents.filter((e) => e.eventData.status === "completed").reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
        const planned = todayEvents.filter((e) => e.eventData.status === "planned").reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
        const tbc = todayEvents.filter((e) => e.eventData.status === "tbc").reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
        const total = completed + planned + tbc;
        const eventIds = todayEvents.map((e) => e.id);
        return { completed, planned, tbc, total, eventIds };
    }, [todayEvents]);

    const queueController = useMemo(() => {
        if (!controller) return undefined;
        return new QueueController(queue, controller, () => {
            setRefreshKey((prev) => prev + 1);
            // Sync Rule: Individual edits must notify the global session to update change detection in sidebar
            globalFlag?.triggerRefresh?.();
        });
    }, [queue, controller, globalFlag]);

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

    // Submits ONLY the changes for this specific teacher
    const handleSubmit = async () => {
        const username = queue.teacher.username;
        const changes = globalFlag?.collectChangesForTeacher(username) || [];
        
        globalFlag?.setSubmitting(username, true);
        try {
            if (changes.length > 0) {
                const result = await bulkUpdateClassboardEvents(changes);
                if (!result.success) return;
            }
            
            // Success Rule: Remove from global queue and exit edit mode
            globalFlag?.optOut(username);
            setIsAdjustmentMode(false);
        } finally {
            globalFlag?.setSubmitting(username, false);
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
            globalFlag?.triggerRefresh?.();
        }
    };

    const handleCancel = () => {
        handleReset();
        // Cancellation Rule: Revert changes and opt out of global session
        if (globalFlag?.isAdjustmentMode()) {
            globalFlag?.optOut?.(queue.teacher.username);
        }
        setIsAdjustmentMode(false);
    };

    const handleToggleAdjustment = (mode: boolean) => {
        const isGlobalMode = globalFlag?.isAdjustmentMode?.();
        const isPending = isGlobalMode && globalFlag?.getPendingTeachers?.().has(queue.teacher.username);

        if (!mode && isPending) globalFlag?.optOut?.(queue.teacher.username);
        if (mode && isGlobalMode && !isPending) globalFlag?.optIn?.(queue.teacher.username);

        setIsAdjustmentMode(mode);
    };

    const isSubmitting = globalFlag?.isSubmitting(queue.teacher.username) || false;
    const individualChanges = globalFlag?.collectChangesForTeacher(queue.teacher.username) || [];
    const hasChanges = individualChanges.length > 0;

    return (
        <div
            className={`w-full bg-transparent overflow-hidden transition-all duration-200 flex flex-row items-stretch group/row ${canAcceptDrop ? "bg-yellow-500/5 ring-1 ring-yellow-500/20 rounded-xl" : ""}`}
            onDragOver={(e) => canAcceptDrop && e.preventDefault()}
            onDrop={handleDrop}
        >
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
                    changedCount={individualChanges.length}
                    isSubmitting={isSubmitting}
                />
            </div>

            {isExpanded && (
                <div className="flex-1 min-w-0 flex items-center p-2 overflow-x-auto scrollbar-hide">
                    <div className="flex flex-row gap-4 h-full items-center">
                        {isAdjustmentMode ? (
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
});

TeacherQueueCardV2.displayName = "TeacherQueueCardV2";