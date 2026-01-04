"use client";

import { useMemo, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import EventCard from "./EventCard";
import EventModCard from "./EventModCard";
import TeacherClassCard from "./TeacherClassCard";
import { ClassboardProgressBar } from "./ClassboardProgressBar";
import { useClassboardContext, optimisticEventToNode } from "@/src/providers/classboard-provider";
import { LockMutationQueue } from "@/src/components/ui/LockMutationQueue";
import { getEventStatusCounts, sortEventsByStatus, type EventStatusMinutes } from "@/getters/booking-progress-getter";
import type { TeacherQueue } from "@/backend/classboard/TeacherQueue";
import type { TeacherViewMode } from "@/types/classboard-teacher-queue";
import { QueueController } from "@/backend/classboard/QueueController";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";

interface TeacherQueueRowProps {
    queue: TeacherQueue;
    viewMode: TeacherViewMode;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

/**
 * TeacherQueueRow - Renders a single teacher's queue row
 * Reads state from GlobalFlag (single source of truth)
 */
export default function TeacherQueueRow({ queue, viewMode, isCollapsed, onToggleCollapse }: TeacherQueueRowProps) {
    const { globalFlag, bookingsForSelectedDate, draggedBooking, addLessonEvent, optimisticOperations, getEventCardStatus, selectedDate } = useClassboardContext();
    const renderCount = useRef(0);
    renderCount.current++;

    // Get controller from GlobalFlag (source of truth)
    const controller = globalFlag.getController();
    const gapMinutes = controller.gapMinutes;

    const isAdjustmentMode = viewMode === "adjustment";

    // Get QueueController from GlobalFlag (if in adjustment mode)
    let queueController = isAdjustmentMode ? globalFlag.getQueueController(queue.teacher.id) : null;

    // In view mode, create temporary QueueController for cascade delete operations
    if (!queueController) {
        queueController = new QueueController(queue, controller, () => { });
    }

    // Use queue from QueueController if in adjustment mode (it has the preserved mutations)
    const activeQueue = queueController.getQueue();

    const canReceiveBooking = draggedBooking?.lessons.some((l) => l.teacherId === activeQueue.teacher.id) ?? false;

    // Memoize the entire event list computation
    const eventsWithOptimistic = useMemo(() => {
        const allOps = Array.from(optimisticOperations.values());
        const relevantDeletions = new Set(
            allOps.filter((op): op is { type: "delete"; eventId: string } => op.type === "delete").map((op) => op.eventId)
        );

        // Filter real events to exclude confirmed deletions (if needed, but user wants to see "Deleting" state)
        // We keep all events to allow EventCard to show spinning status
        const realEvents = activeQueue.getAllEvents();

        // Get optimistic "add" operations for this teacher
        const teacherOptimisticEvents = allOps
            .filter((op): op is { type: "add"; event: any } => op.type === "add" && op.event.teacherId === activeQueue.teacher.id)
            .map((op) => ({
                node: optimisticEventToNode(op.event),
            }));

        // Convert real events
        const realEventsWithStatus = realEvents.map((event) => ({
            node: event,
        }));

        // Deduplicate: exclude optimistic events that are already in realEvents
        const realEventIds = new Set(realEvents.map((e) => e.id));
        const deduplicatedOptimistic = teacherOptimisticEvents.filter((opt) => !realEventIds.has(opt.node.id));

        // Merge and sort by status priority, then by date
        const merged = [...realEventsWithStatus, ...deduplicatedOptimistic];
        const sortedByStatus = sortEventsByStatus(merged.map((e) => e.node));

        // Reconstruct linked list AFTER sorting to maintain correct prev/next references
        sortedByStatus.forEach((event, index) => {
            event.prev = index > 0 ? sortedByStatus[index - 1] : null;
            event.next = index < sortedByStatus.length - 1 ? sortedByStatus[index + 1] : null;
        });

        return sortedByStatus.map(node => ({ node }));
    }, [activeQueue, optimisticOperations, selectedDate]);

    // Calculate progress counts for collapsed view
    const progressCounts: EventStatusMinutes = useMemo(() => {
        if (!eventsWithOptimistic || eventsWithOptimistic.length === 0) {
            return { completed: 0, uncompleted: 0, planned: 0, tbc: 0 };
        }
        const allEventNodes = eventsWithOptimistic.map((e) => ({ ...e.node.eventData, date: e.node.eventData.date }));
        const result = getEventStatusCounts(allEventNodes as any);
        return result || { completed: 0, uncompleted: 0, planned: 0, tbc: 0 };
    }, [eventsWithOptimistic]);

    // Calculate total minutes for today's events
    const totalEventMinutes = useMemo(() => {
        return eventsWithOptimistic.reduce((sum, e) => sum + (e.node.eventData.duration || 0), 0);
    }, [eventsWithOptimistic]);

    const handleDragOver = (e: React.DragEvent) => {
        if (!draggedBooking) return;
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedBooking) return;

        const lesson = draggedBooking.lessons.find((l) => l.teacherId === activeQueue.teacher.id);
        if (!lesson) {
            toast.error(`No lesson available for ${activeQueue.teacher.username}`);
            return;
        }

        const bookingData = bookingsForSelectedDate.find((b) => b.booking.id === draggedBooking.bookingId);
        if (!bookingData) {
            toast.error("Booking not found");
            return;
        }

        await addLessonEvent(bookingData, lesson.id);
    };

    const handleSubmit = useCallback(async () => {
        if (!queueController || !queueController.hasChanges()) return;

        const { updates, deletions } = queueController.getChanges();

        try {
            await bulkUpdateClassboardEvents(updates, deletions);
            toast.success("Changes saved");
            globalFlag.optOut(queue.teacher.id);
        } catch (error) {
            console.error("❌ Failed to save changes:", error);
            toast.error("Failed to save changes");
        }
    }, [queueController, globalFlag, queue.teacher.id]);

    const handleReset = useCallback(() => {
        queueController?.resetToSnapshot();
    }, [queueController]);

    const handleCancel = useCallback(() => {
        queueController?.resetToSnapshot();
        globalFlag.optOut(queue.teacher.id);
    }, [queueController, globalFlag, queue.teacher.id]);

    const handleOptimise = useCallback(async () => {
        if (!queueController) return;

        // Always ensure locked mode is enabled when optimising
        if (!queueController.isLocked()) {
            controller.locked = true;
            globalFlag.triggerRefresh();
        }

        // Perform local optimization (updates memory state only)
        const { count } = queueController.optimiseQueue();

        if (count > 0) {
            toast.success("Queue Optimised (Preview)");
        } else {
            toast.success("Queue Locked");
        }
    }, [queueController, controller, globalFlag]);

    const handleToggleLock = useCallback(() => {
        if (!queueController) return;
        const newLocked = !queueController.isLocked();
        controller.locked = newLocked;
        globalFlag.triggerRefresh();
        toast.success(newLocked ? "Cascade mode enabled" : "Time-respect mode enabled");
    }, [queueController, controller, globalFlag]);

    const { setOptimisticOperations } = useClassboardContext();

    const handleBulkAction = useCallback(
        (ids: string[], action: "delete" | "update") => {
            if (action === "delete") {
                setOptimisticOperations((prev) => {
                    const updated = new Map(prev);
                    ids.forEach((id) => {
                        updated.set(id, { type: "delete", eventId: id });
                    });
                    return updated;
                });
            }
        },
        [setOptimisticOperations],
    );

    return (
        <div className={`w-full bg-transparent overflow-hidden transition-all duration-200 flex flex-row items-stretch group/row rounded-xl ${canReceiveBooking ? "ring-2 ring-green-500/50 bg-green-500/5" : ""}`} onDragOver={handleDragOver} onDrop={handleDrop}>
            {/* Teacher Card */}
            <div className={`flex-shrink-0 transition-all duration-200 p-2 ${viewMode !== "collapsed" ? "w-[340px] border-r-2 border-background" : "flex-1 border-r-0"}`}>
                <TeacherClassCard
                    queue={activeQueue}
                    onClick={onToggleCollapse}
                    viewMode={viewMode}
                    onToggleAdjustment={(value) => {
                        if (value) {
                            globalFlag.optIn(queue.teacher.id);
                        } else {
                            globalFlag.optOut(queue.teacher.id);
                        }
                    }}
                    hasChanges={queueController?.hasChanges() ?? false}
                    changedCount={queueController?.getChanges().updates.length ?? 0}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    onCancel={handleCancel}
                    onBulkAction={handleBulkAction}
                />
                {/* Optimise and Lock controls - always show in adjustment mode */}
                {viewMode === "adjustment" && queueController && (
                    <div className="mt-2 px-2">
                        <LockMutationQueue isLocked={queueController.isLocked()} onToggle={handleToggleLock} isOptimised={queueController.isQueueOptimised()} optimisationStats={queueController.getOptimisationStats()} onOptimise={handleOptimise} />
                    </div>
                )}
            </div>

            {/* Event Cards */}
            {viewMode !== "collapsed" && (
                <div className="flex-1 min-w-0 flex items-center p-2 overflow-x-auto scrollbar-hide">
                    <div className="flex flex-row gap-4 h-full items-center">
                        {eventsWithOptimistic.length > 0 ? (
                            eventsWithOptimistic.map(({ node: event }, index) => {
                                // Get card status from context (source of truth)
                                const effectiveCardStatus = getEventCardStatus(event.id);

                                // Calculate position flags for EventModCard optimization
                                const isFirst = index === 0;
                                const isLast = index === eventsWithOptimistic.length - 1;
                                const canMoveEarlier = queueController ? queueController.canMoveEarlier(event.id) : false;
                                const canMoveLater = queueController ? queueController.canMoveLater(event.id) : false;
                                const previousEvent = event.prev;

                                console.log(`  🎫 [Event] ${queue.teacher.username} -> ${event.bookingLeaderName} | Status: ${effectiveCardStatus || "idle"}`);

                                return (
                                    <div key={event.id} className="w-[320px] flex-shrink-0 h-full flex flex-col justify-start">
                                        {viewMode === "adjustment" && queueController ? (
                                            <EventModCard 
                                                event={event} 
                                                queueController={queueController}
                                                isFirst={isFirst}
                                                isLast={isLast}
                                                canMoveEarlier={canMoveEarlier}
                                                canMoveLater={canMoveLater}
                                                previousEvent={previousEvent}
                                            />
                                        ) : (
                                            <EventCard event={event} cardStatus={effectiveCardStatus} queueController={queueController} gapMinutes={gapMinutes} showLocation={true} />
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex items-center justify-center w-full text-xs text-muted-foreground">No events today</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
