"use client";

import { useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import EventCard from "./EventCard";
import EventModCard from "./EventModCard";
import TeacherClassCard from "./TeacherClassCard";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { LockMutationQueue } from "@/src/components/ui/LockMutationQueue";
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
 * DropZoneOverlay - Visual feedback when dragging booking over teacher queue
 */
function DropZoneOverlay({
    isDraggingSomething,
    isEligible,
    nextSlotTime,
}: {
    isDraggingSomething: boolean;
    isEligible: boolean;
    nextSlotTime: string | null;
}) {
    return (
        <AnimatePresence>
            {isDraggingSomething && isEligible && (
                <motion.div
                    initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    animate={{ opacity: 1, backdropFilter: "blur(2px)" }}
                    exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    className="absolute inset-0 pointer-events-none border-2 border-dashed border-cyan-500/40 rounded-xl z-50 flex items-center justify-center bg-cyan-500/5"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-cyan-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-2xl ring-4 ring-cyan-500/20 flex items-center gap-2"
                    >
                        <span>Start at</span>
                        <span className="text-sm font-mono bg-white/20 px-1.5 py-0.5 rounded leading-none">
                            {nextSlotTime || "--:--"}
                        </span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * TeacherSection - Teacher card and adjustment mode controls
 */
function TeacherSection({
    activeQueue,
    queue,
    viewMode,
    onToggleCollapse,
    queueController,
    onToggleAdjustment,
    onSubmit,
    onReset,
    onCancel,
    onBulkAction,
    onToggleLock,
    onOptimise,
}: {
    activeQueue: TeacherQueue;
    queue: TeacherQueue;
    viewMode: TeacherViewMode;
    onToggleCollapse: () => void;
    queueController: QueueController | null;
    onToggleAdjustment: (value: boolean) => void;
    onSubmit: () => Promise<void>;
    onReset: () => void;
    onCancel: () => void;
    onBulkAction: (ids: string[], action: "delete" | "update") => void;
    onToggleLock: () => void;
    onOptimise: () => Promise<void>;
}) {
    return (
        <div
            className={`flex-shrink-0 transition-all duration-200 p-2 ${viewMode !== "collapsed" ? "w-[340px] border-r-2 border-background" : "flex-1 border-r-0"}`}
        >
            <TeacherClassCard
                queue={activeQueue}
                onClick={onToggleCollapse}
                viewMode={viewMode}
                onToggleAdjustment={onToggleAdjustment}
                hasChanges={queueController?.hasChanges() ?? false}
                changedCount={queueController?.getChanges().updates.length ?? 0}
                onSubmit={onSubmit}
                onReset={onReset}
                onCancel={onCancel}
                onBulkAction={onBulkAction}
            />
            {viewMode === "adjustment" && queueController && (
                <div className="mt-2 px-2">
                    <LockMutationQueue
                        isLocked={queueController.isLocked()}
                        onToggle={onToggleLock}
                        isOptimised={queueController.isQueueOptimised()}
                        optimisationStats={queueController.getOptimisationStats()}
                        onOptimise={onOptimise}
                    />
                </div>
            )}
        </div>
    );
}

/**
 * EventsSection - List of event cards for the teacher queue
 */
function EventsSection({
    viewMode,
    eventsWithOptimistic,
    queueController,
    getEventCardStatus,
    gapMinutes,
    queue,
}: {
    viewMode: TeacherViewMode;
    eventsWithOptimistic: { node: any }[];
    queueController: QueueController | null;
    getEventCardStatus: (eventId: string) => string | undefined;
    gapMinutes: number;
    queue: TeacherQueue;
}) {
    if (viewMode === "collapsed") return null;

    return (
        <div className="flex-1 min-w-0 flex items-center p-2 overflow-x-auto scrollbar-hide">
            <div className="flex flex-row gap-4 h-full items-center">
                {eventsWithOptimistic.length > 0
                    ? eventsWithOptimistic.map(({ node: event }, index) => {
                          const effectiveCardStatus = getEventCardStatus(event.id);
                          const isFirst = index === 0;
                          const isLast = index === eventsWithOptimistic.length - 1;
                          const canMoveEarlier = queueController ? queueController.canMoveEarlier(event.id) : false;
                          const canMoveLater = queueController ? queueController.canMoveLater(event.id) : false;
                          const previousEvent = event.prev;

                          console.log(
                              `  🎫 [Event] ${queue.teacher.username} -> ${event.bookingLeaderName} | Status: ${effectiveCardStatus || "idle"}`,
                          );

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
                                      <EventCard
                                          event={event}
                                          cardStatus={effectiveCardStatus}
                                          queueController={queueController}
                                          gapMinutes={gapMinutes}
                                          showLocation={true}
                                      />
                                  )}
                              </div>
                          );
                      })
                    : null}
            </div>
        </div>
    );
}

/**
 * TeacherQueueRow - Parent component for rendering teacher queue
 * Reads state from GlobalFlag (single source of truth)
 */
export default function TeacherQueueRow({ queue, viewMode, isCollapsed, onToggleCollapse }: TeacherQueueRowProps) {
    const {
        globalFlag,
        bookingsForSelectedDate,
        draggedBooking,
        setDraggedBooking,
        addLessonEvent,
        getEventCardStatus,
        selectedDate,
    } = useClassboardContext();

    const controller = globalFlag.getController();
    const gapMinutes = controller.gapMinutes;
    const isAdjustmentMode = viewMode === "adjustment";

    let queueController = isAdjustmentMode ? globalFlag.getQueueController(queue.teacher.id) : null;

    const tempController = useMemo(() => {
        if (isAdjustmentMode) return null;
        return new QueueController(queue, controller, () => {});
    }, [queue, controller, isAdjustmentMode]);

    if (!queueController) {
        queueController = tempController;
    }

    const activeQueue = queueController?.getQueue() || queue;

    useEffect(() => {
        const events = activeQueue.getAllEvents();
        console.log(
            `📊 [TeacherQueueRow] Queue Update for ${queue.teacher.username}:`,
            events.map((e) => ({ id: e.id, time: e.eventData.date.split("T")[1], status: e.eventData.status })),
        );
    }, [activeQueue, queue.teacher.username]);

    const isEligible = draggedBooking?.lessons.some((l) => l.teacherId === activeQueue.teacher.id) && activeQueue.isActive;
    const isDraggingSomething = !!draggedBooking;

    const nextSlotTime = useMemo(() => {
        if (!isEligible || !draggedBooking) return null;

        const cap = draggedBooking.capacityStudents;
        const duration = cap === 1 ? controller.durationCapOne : cap === 2 ? controller.durationCapTwo : controller.durationCapThree;

        return activeQueue.getNextAvailableSlot(controller.submitTime, duration, controller.gapMinutes);
    }, [isEligible, draggedBooking, activeQueue, controller, activeQueue.version]);

    const eventsWithOptimistic = useMemo(() => {
        const events = activeQueue.getAllEvents({ includeDeleted: !isAdjustmentMode });

        console.log(
            `  🎫 [TeacherQueueRow] Rendering ${events.length} events for ${queue.teacher.username} (v${activeQueue.version})`,
        );

        return events.map((node) => ({ node }));
    }, [activeQueue, selectedDate, activeQueue.version, isAdjustmentMode]);

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

        setDraggedBooking(null);
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

        if (!queueController.isLocked()) {
            controller.locked = true;
            globalFlag.triggerRefresh();
        }

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

    const handleToggleAdjustment = useCallback(
        (value: boolean) => {
            if (value) {
                globalFlag.optIn(queue.teacher.id);
            } else {
                globalFlag.optOut(queue.teacher.id);
            }
        },
        [globalFlag, queue.teacher.id],
    );

    return (
        <motion.div
            layout
            animate={{
                opacity: isDraggingSomething && !isEligible ? 0.2 : 1,
            }}
            transition={{ duration: 0.2 }}
            className={`w-full overflow-hidden transition-all duration-300 flex flex-row items-stretch group/row rounded-xl relative ${isDraggingSomething && !isEligible ? "grayscale opacity-20 pointer-events-none" : ""}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <DropZoneOverlay isDraggingSomething={isDraggingSomething} isEligible={isEligible} nextSlotTime={nextSlotTime} />
            <TeacherSection
                activeQueue={activeQueue}
                queue={queue}
                viewMode={viewMode}
                onToggleCollapse={onToggleCollapse}
                queueController={queueController}
                onToggleAdjustment={handleToggleAdjustment}
                onSubmit={handleSubmit}
                onReset={handleReset}
                onCancel={handleCancel}
                onBulkAction={handleBulkAction}
                onToggleLock={handleToggleLock}
                onOptimise={handleOptimise}
            />
            <EventsSection
                viewMode={viewMode}
                eventsWithOptimistic={eventsWithOptimistic}
                queueController={queueController}
                getEventCardStatus={getEventCardStatus}
                gapMinutes={gapMinutes}
                queue={queue}
            />
        </motion.div>
    );
}
