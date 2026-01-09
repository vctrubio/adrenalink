"use client";

import { useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { bulkUpdateClassboardEvents } from "@/supabase/server/classboard";

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
    const { globalFlag, bookingsForSelectedDate, draggedBooking, addLessonEvent, getEventCardStatus, selectedDate } = useClassboardContext();
    const renderCount = useRef(0);
    renderCount.current++;

    // Get controller from GlobalFlag (source of truth)
    const controller = globalFlag.getController();
    const gapMinutes = controller.gapMinutes;

    const isAdjustmentMode = viewMode === "adjustment";

    // Get QueueController from GlobalFlag (if in adjustment mode)
    let queueController = isAdjustmentMode ? globalFlag.getQueueController(queue.teacher.id) : null;

    // In view mode, memoize a temporary QueueController for cascade delete operations
    const tempController = useMemo(() => {
        if (isAdjustmentMode) return null;
        return new QueueController(queue, controller, () => { });
    }, [queue, controller, isAdjustmentMode]);

    if (!queueController) {
        queueController = tempController;
    }

    // Use queue from QueueController if in adjustment mode (it has the preserved mutations)
    const activeQueue = queueController?.getQueue() || queue;

    useEffect(() => {
        const events = activeQueue.getAllEvents();
        console.log(`📊 [TeacherQueueRow] Queue Update for ${queue.teacher.username}:`, 
            events.map(e => ({ id: e.id, time: e.eventData.date.split('T')[1], status: e.eventData.status }))
        );
    }, [activeQueue, queue.teacher.username]);

    const isEligible = draggedBooking?.lessons.some((l) => l.teacherId === activeQueue.teacher.id) ?? false;
    const isDraggingSomething = !!draggedBooking;

    // Memoize the entire event list computation
    const eventsWithOptimistic = useMemo(() => {
        // TeacherQueue now manages its own optimistic state internally
        // In adjustment mode, we hide deleted events immediately. 
        // In view mode, we show them with a spinner until the server confirms.
        const events = activeQueue.getAllEvents({ includeDeleted: !isAdjustmentMode });
        
        console.log(`  🎫 [TeacherQueueRow] Rendering ${events.length} events for ${queue.teacher.username} (v${activeQueue.version})`);
        
        return events.map(node => ({ node }));
    }, [activeQueue, selectedDate, activeQueue.version, isAdjustmentMode]);

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

    const handleBulkAction = useCallback(
        (ids: string[], action: "delete" | "update") => {
            if (action === "delete") {
                ids.forEach((id) => {
                    globalFlag.notifyEventMutation(id, "deleting", queue.teacher.id);
                    globalFlag.markEventAsDeleted(queue.teacher.id, id);
                });
            }
        },
        [globalFlag, queue.teacher.id],
    );

    return (
        <motion.div 
            layout
            animate={{
                opacity: isDraggingSomething && !isEligible ? 0.3 : 1,
                scale: isDraggingSomething && isEligible ? 1.01 : 1,
                backgroundColor: isDraggingSomething && isEligible ? "rgba(6, 182, 212, 0.05)" : "transparent"
            }}
            transition={{ duration: 0.2 }}
            className={`w-full overflow-hidden transition-all duration-300 flex flex-row items-stretch group/row rounded-xl relative ${isDraggingSomething && isEligible ? "ring-2 ring-cyan-500/20 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]" : ""} ${isDraggingSomething && !isEligible ? "grayscale-[0.5] pointer-events-none" : ""}`} 
            onDragOver={handleDragOver} 
            onDrop={handleDrop}
        >
            {/* Visual Drop Zone Indicator */}
            <AnimatePresence>
                {isDraggingSomething && isEligible && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none border-2 border-dashed border-cyan-500/30 rounded-xl z-50 flex items-center justify-center"
                    >
                        <div className="bg-cyan-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-lg">
                            Ready for Lesson
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
        </motion.div>
    );
}
