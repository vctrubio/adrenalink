"use client";

import { useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import EventCard from "./EventCard";
import EventModCard from "./EventModCard";
import TeacherClassCard from "./TeacherClassCard";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { useClassboardActions, optimisticEventToNode } from "@/src/providers/classboard-actions-provider";
import { LockMutationQueue } from "@/src/components/ui/LockMutationQueue";
import type { TeacherQueue } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { TeacherViewMode } from "@/types/classboard-teacher-queue";
import { QueueController } from "@/src/app/(admin)/(classboard)/QueueController";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";

interface TeacherQueueRowProps {
    queue: TeacherQueue;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export default function TeacherQueueRow({ queue, isCollapsed, onToggleCollapse }: TeacherQueueRowProps) {
    const { controller, bookingsForSelectedDate } = useClassboardContext();
    const { draggedBooking, addLessonEvent, optimisticEvents, globalFlag } = useClassboardActions();

    // Get QueueController from GlobalFlag (if in adjustment mode)
    let queueController = globalFlag.getQueueController(queue.teacher.id);
    const isAdjustmentMode = !!queueController;

    // In view mode, create temporary QueueController for cascade delete operations
    if (!queueController) {
        queueController = new QueueController(queue, controller, () => {});
    }

    // Compute view mode: adjustment takes priority, otherwise use isCollapsed state
    const viewMode: TeacherViewMode = isAdjustmentMode ? "adjustment" : isCollapsed ? "collapsed" : "expanded";

    // Use queue from QueueController if in adjustment mode (it has the preserved mutations)
    const activeQueue = queueController.getQueue();

    const canReceiveBooking = draggedBooking?.lessons.some((l) => l.teacherId === activeQueue.teacher.id) ?? false;

    // Merge real events with optimistic events for this teacher
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
                cardStatus: undefined,
            }));

        // Convert real events to include cardStatus
        const realEventsWithStatus = realEvents.map((event) => ({
            node: event,
            cardStatus: undefined,
        }));

        // Merge and sort by date
        const allEvents = [...realEventsWithStatus, ...teacherOptimisticEvents].sort((a, b) => {
            const dateA = new Date(a.node.eventData.date).getTime();
            const dateB = new Date(b.node.eventData.date).getTime();
            return dateA - dateB;
        });

        return allEvents;
    }, [activeQueue, optimisticEvents]);

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
                />
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
                            eventsWithOptimistic.map(({ node: event, cardStatus }) => (
                                <div key={event.id} className="w-[320px] flex-shrink-0 h-full flex flex-col justify-center">
                                    {viewMode === "adjustment" && queueController ? (
                                        <EventModCard event={event} queueController={queueController} onDelete={() => queueController.removeFromSnapshot(event.id)} />
                                    ) : (
                                        <EventCard event={event} cardStatus={cardStatus} queueController={queueController} gapMinutes={controller.gapMinutes} showLocation={true} />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center w-full text-xs text-muted-foreground">No events today</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
