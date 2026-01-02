"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
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

// Muted green - softer than entity color
const TEACHER_COLOR = "#16a34a";

type TeacherFilter = "active" | "all";

/**
 * TeacherClassDaily - Displays teacher queues in a list
 */
export default function TeacherClassDaily() {
    const { teacherQueues, draggedBooking } = useClassboardActions();

    const [filter, setFilter] = useState<TeacherFilter>("active");
    const [collapsedTeachers, setCollapsedTeachers] = useState<Set<string>>(new Set());

    const toggleCollapsed = (teacherId: string) => {
        setCollapsedTeachers((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(teacherId)) {
                newSet.delete(teacherId);
            } else {
                newSet.add(teacherId);
            }
            return newSet;
        });
    };

    // Filter teachers based on whether they have events
    const { filteredQueues, counts } = useMemo(() => {
        console.log("🔄 [TeacherClassDaily] Filtering queues, filter:", filter);

        const activeQueues: TeacherQueue[] = [];
        const allQueues: TeacherQueue[] = teacherQueues;

        teacherQueues.forEach((queue) => {
            const events = queue.getAllEvents();
            // Events are already filtered by date in ClientClassboard, just check if any exist
            const hasEvents = events.length > 0;

            if (hasEvents) {
                activeQueues.push(queue);
            }
        });

        const counts = {
            active: activeQueues.length,
            all: allQueues.length,
        };

        console.log("   - Active queues:", counts.active);
        console.log("   - All queues:", counts.all);

        return {
            filteredQueues: filter === "active" ? activeQueues : allQueues,
            counts,
        };
    }, [teacherQueues, filter]);

    return (
        <div className={`flex flex-col h-full transition-colors ${draggedBooking ? "bg-green-500/10" : ""}`}>
            {/* Header: Global Toggles & Filter */}
            <div className="p-4 px-6 border-b-2 border-background bg-card flex items-center gap-4 transition-colors select-none flex-shrink-0">
                <div style={{ color: TEACHER_COLOR }}>
                    <HeadsetIcon className="w-7 h-7 flex-shrink-0" />
                </div>
                <span className="text-lg font-bold text-foreground">Teachers</span>
                <div className="ml-auto flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <ToggleSwitch
                        value={filter}
                        onChange={(newFilter) => {
                            console.log("🔄 [TeacherClassDaily] Filter changed to:", newFilter);
                            setFilter(newFilter as TeacherFilter);
                        }}
                        values={{ left: "active", right: "all" }}
                        counts={counts}
                        tintColor={TEACHER_COLOR}
                    />
                </div>
            </div>

            {/* Teacher List Content */}
            <div className="overflow-auto flex-1 min-h-0">
                <div className="p-2 bg-card">
                    <div className="flex flex-col divide-y-2 divide-background">
                        {filteredQueues.length > 0 ? (
                            filteredQueues.map((queue, index) => {
                                const isCollapsed = collapsedTeachers.has(queue.teacher.id);
                                return (
                                    <div key={`${queue.teacher.id}-${index}`} className={"py-2 transition-colors"}>
                                        <TeacherQueueRow queue={queue} isCollapsed={isCollapsed} onToggleCollapse={() => toggleCollapsed(queue.teacher.id)} />
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
// TeacherQueueRow - Individual Teacher Row
// ============================================
interface TeacherQueueRowProps {
    queue: TeacherQueue;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

function TeacherQueueRow({ queue, isCollapsed, onToggleCollapse }: TeacherQueueRowProps) {
    const { controller, bookingsForSelectedDate } = useClassboardContext();
    const { draggedBooking, addLessonEvent, optimisticEvents, globalFlag } = useClassboardActions();

    // Get QueueController from GlobalFlag (if in adjustment mode)
    let queueController = globalFlag.getQueueController(queue.teacher.id);
    const isAdjustmentMode = !!queueController;

    // In view mode, create temporary QueueController for cascade delete operations
    if (!queueController) {
        const { QueueController } = require("@/src/app/(admin)/(classboard)/QueueController");
        queueController = new QueueController(queue, controller, () => { });
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
                cardStatus: undefined, // Posting animation derived from temp- prefix in EventCard
            }));

        // Convert real events to include cardStatus
        const realEventsWithStatus = realEvents.map((event) => ({
            node: event,
            cardStatus: undefined, // No status = equipment icon
        }));

        // Merge and sort by date
        const allEvents = [...realEventsWithStatus, ...teacherOptimisticEvents].sort((a, b) => {
            const dateA = new Date(a.node.eventData.date).getTime();
            const dateB = new Date(b.node.eventData.date).getTime();
            return dateA - dateB;
        });

        return allEvents;
    }, [activeQueue, optimisticEvents, globalFlag.getRefreshKey()]);

    // Drag-and-drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        if (!draggedBooking) return;
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedBooking) return;

        // Find the lesson for this teacher
        const lesson = draggedBooking.lessons.find((l) => l.teacherId === activeQueue.teacher.id);
        if (!lesson) {
            toast.error(`No lesson available for ${activeQueue.teacher.username}`);
            return;
        }

        // Find the booking data
        const bookingData = bookingsForSelectedDate.find((b) => b.booking.id === draggedBooking.bookingId);
        if (!bookingData) {
            toast.error("Booking not found");
            return;
        }

        await addLessonEvent(bookingData, lesson.id);
    };

    // Queue Action Handlers
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
            // Auto-enable cascade mode if not enabled
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
        controller.locked = newLocked; // Mutate shared settings
        globalFlag.triggerRefresh();
        toast.success(newLocked ? "Cascade mode enabled" : "Time-respect mode enabled");
    }, [queueController, controller, globalFlag]);

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
                />
                {/* Optimise and Lock controls - always show in adjustment mode */}
                {viewMode === "adjustment" && queueController && (
                    <div className="mt-2 px-2" key={globalFlag.getRefreshKey()}>
                        <LockMutationQueue isLocked={queueController.isLocked()} onToggle={handleToggleLock} isOptimised={queueController.isQueueOptimised()} optimisationStats={queueController.getOptimisationStats()} onOptimise={handleOptimise} />
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
