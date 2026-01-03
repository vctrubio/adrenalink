"use client";

import { useMemo, useCallback, useState, useRef } from "react";
import toast from "react-hot-toast";
import EventCard from "./EventCard";
import EventModCard from "./EventModCard";
import TeacherClassCard from "./TeacherClassCard";
import { ClassboardProgressBar } from "./ClassboardProgressBar";
import { useClassboardContext, optimisticEventToNode } from "@/src/providers/classboard-provider";
import { LockMutationQueue } from "@/src/components/ui/LockMutationQueue";
import { getEventStatusCounts, sortEventsByStatus, type EventStatusMinutes } from "@/getters/booking-progress-getter";
import type { TeacherQueue } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { TeacherViewMode } from "@/types/classboard-teacher-queue";
import { QueueController } from "@/src/app/(admin)/(classboard)/QueueController";
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
    const { globalFlag, bookingsForSelectedDate, draggedBooking, addLessonEvent, optimisticEvents, getEventCardStatus } = useClassboardContext();
    const renderCount = useRef(0);
    renderCount.current++;

    const [cascadingEventIds, setCascadingEventIds] = useState<{ ids: Set<string>; action: "update" | "delete" }>({
        ids: new Set(),
        action: "update",
    });

    // Get controller from GlobalFlag (source of truth)
    const controller = globalFlag.getController();
    const gapMinutes = controller.gapMinutes;

    const isAdjustmentMode = viewMode === "adjustment";

    // Get QueueController from GlobalFlag (if in adjustment mode)
    let queueController = isAdjustmentMode ? globalFlag.getQueueController(queue.teacher.id) : null;

    // In view mode, create temporary QueueController for cascade delete operations
    if (!queueController) {
        queueController = new QueueController(queue, controller, () => {});
    }

    console.log(`🎬 [TeacherQueueRow] Render #${renderCount.current} | ${queue.teacher.username} | Events: ${queue.getAllEvents().length} | Mode: ${viewMode} | Gap: ${gapMinutes}min`);

    // Use queue from QueueController if in adjustment mode (it has the preserved mutations)
    const activeQueue = queueController.getQueue();

    const canReceiveBooking = draggedBooking?.lessons.some((l) => l.teacherId === activeQueue.teacher.id) ?? false;

    // Merge real events with optimistic events for this teacher (with deduplication)
    const eventsWithOptimistic = useMemo(() => {
        const realEvents = activeQueue.getAllEvents();

        // Reconstruct linked list references from array order
        realEvents.forEach((event, index) => {
            event.prev = index > 0 ? realEvents[index - 1] : null;
            event.next = index < realEvents.length - 1 ? realEvents[index + 1] : null;
        });

        // Get optimistic events for this teacher
        const teacherOptimisticEvents = Array.from(optimisticEvents.values())
            .filter((opt) => opt.teacherId === activeQueue.teacher.id)
            .map((opt) => ({
                node: optimisticEventToNode(opt),
            }));

        // Convert real events
        const realEventsWithStatus = realEvents.map((event) => ({
            node: event,
        }));

        // Deduplicate: exclude optimistic events that are already in realEvents
        const realEventIds = new Set(realEvents.map((e) => e.id));
        const deduplicatedOptimistic = teacherOptimisticEvents.filter(
            (opt) => !realEventIds.has(opt.node.id)
        );

        // Merge and sort by status priority, then by date
        const allEvents = [...realEventsWithStatus, ...deduplicatedOptimistic];
        const sortedByStatus = sortEventsByStatus(allEvents.map((e) => e.node));

        return sortedByStatus.map((node) => ({ node }));
    }, [activeQueue, optimisticEvents]);

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

    const handleOptimise = useCallback(() => {
        if (!queueController) return;
        const { count } = queueController.optimiseQueue();
        if (count > 0) {
            if (!queueController.isLocked()) {
                controller.locked = true;
                globalFlag.triggerRefresh();
            }
            toast.success("Optimised");
        } else {
            toast.success("Already optimised");
        }
    }, [queueController, controller, globalFlag]);

    const handleToggleLock = useCallback(() => {
        if (!queueController) return;
        const newLocked = !queueController.isLocked();
        controller.locked = newLocked;
        globalFlag.triggerRefresh();
        toast.success(newLocked ? "Cascade mode enabled" : "Time-respect mode enabled");
    }, [queueController, controller, globalFlag]);

    const handleBulkAction = useCallback((ids: string[], action: "delete" | "update") => {
        setCascadingEventIds({ ids: new Set(ids), action });
    }, []);

    return (
        <div
            className={`w-full bg-transparent overflow-hidden transition-all duration-200 flex flex-row items-stretch group/row rounded-xl ${canReceiveBooking ? "ring-2 ring-green-500/50 bg-green-500/5" : ""}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
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
                {viewMode === "collapsed" && eventsWithOptimistic.length > 0 && progressCounts && (
                    <div className="mt-2">
                        <ClassboardProgressBar durationMinutes={totalEventMinutes} counts={progressCounts} />
                    </div>
                )}
                {/* Optimise and Lock controls - always show in adjustment mode */}
                {viewMode === "adjustment" && queueController && (
                    <div className="mt-2 px-2">
                        <LockMutationQueue
                            isLocked={queueController.isLocked()}
                            onToggle={handleToggleLock}
                            isOptimised={queueController.isQueueOptimised()}
                            optimisationStats={queueController.getOptimisationStats()}
                            onOptimise={handleOptimise}
                        />
                    </div>
                )}
            </div>

            {/* Event Cards */}
            {viewMode !== "collapsed" && (
                <div className="flex-1 min-w-0 flex items-center p-2 overflow-x-auto scrollbar-hide">
                    <div className="flex flex-row gap-4 h-full items-center">
                        {eventsWithOptimistic.length > 0 ? (
                            eventsWithOptimistic.map(({ node: event }) => {
                                // Get card status from context (source of truth)
                                let effectiveCardStatus = getEventCardStatus(event.id);

                                // Override with cascade status if applicable
                                if (cascadingEventIds.ids.has(event.id)) {
                                    effectiveCardStatus = cascadingEventIds.action === "delete" ? "deleting" : "updating";
                                }

                                console.log(`  🎫 [Event] ${queue.teacher.username} -> ${event.bookingLeaderName} | Status: ${effectiveCardStatus || "idle"}`);

                                return (
                                    <div key={event.id} className="w-[320px] flex-shrink-0 h-full flex flex-col justify-center">
                                        {viewMode === "adjustment" && queueController ? (
                                            <EventModCard event={event} queueController={queueController} />
                                        ) : (
                                            <EventCard
                                                event={event}
                                                cardStatus={effectiveCardStatus}
                                                queueController={queueController}
                                                gapMinutes={gapMinutes}
                                                showLocation={true}
                                                onCascade={(ids) => setCascadingEventIds({ ids: new Set(ids), action: "update" })}
                                            />
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
