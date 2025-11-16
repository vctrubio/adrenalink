"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import TeacherEventQueue from "./TeacherEventQueue";
import TeacherQueueEditor from "./TeacherEventQueueEditor";
import TeacherColumnController from "./TeacherColumnController";
import GlobalFlagAdjustment from "./GlobalFlagAdjustment";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";
import { GlobalFlag } from "@/backend/models/GlobalFlag";
import type { TeacherQueue, ControllerSettings, EventNode } from "@/backend/TeacherQueue";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { DragState } from "@/types/drag-state";
import { getDragOverTeacherColumnColor } from "@/types/drag-state";
import type { ClassboardStats, TeacherStats } from "@/backend/ClassboardStats";

function TeacherColumn({
    queue,
    stats,
    dragState,
    globalFlag,
    isPendingParentUpdate,
    controller,
    onEventDeleted,
}: {
    queue: TeacherQueue;
    stats: TeacherStats;
    dragState: DragState;
    globalFlag: GlobalFlag;
    isPendingParentUpdate: boolean;
    controller: ControllerSettings;
    onEventDeleted?: (eventId: string) => void;
}) {
    const [columnViewMode, setColumnViewMode] = useState<"view" | "queue">("view");
    const [refreshKey, setRefreshKey] = useState(0);

    // Force refresh when queue updates (from real-time listener)
    useEffect(() => {
        console.log(`[TeacherColumn] Queue updated for ${queue.teacher.username}, forcing refresh`);
        setRefreshKey((prev) => prev + 1);
    }, [queue, isPendingParentUpdate, columnViewMode]);

    // Auto-enter queue mode when global adjustment mode is active
    useEffect(() => {
        if (globalFlag.isAdjustmentMode() && isPendingParentUpdate) {
            setColumnViewMode("queue");
        } else if (!globalFlag.isAdjustmentMode() && columnViewMode === "queue") {
            // Exit queue mode when global adjustment mode is deactivated
            handleReset();
            setColumnViewMode("view");
            originalQueueState.current = [];
        }
    }, [globalFlag.isAdjustmentMode(), isPendingParentUpdate]);

    // Exit queue editor mode if queue becomes empty
    useEffect(() => {
        const allEvents = queue.getAllEvents();
        if (allEvents.length === 0 && columnViewMode === "queue") {
            console.log(`[TeacherColumn] Queue is empty for ${queue.teacher.username}, exiting queue mode`);
            setColumnViewMode("view");
        }
    }, [queue]);

    const events = useMemo(() => {
        // Only include globalTime in deps if in edit mode
        // This ensures event cards only update in editor view
        return queue.getAllEvents();
    }, [queue, refreshKey, columnViewMode === "queue" ? globalFlag.getGlobalTime() : null]);

    const earliestTime = useMemo(() => {
        // Only recalculate in edit mode
        return queue.getEarliestEventTime();
    }, [queue, refreshKey, columnViewMode === "queue" ? globalFlag.getGlobalTime() : null]);

    // Store original queue state for reset functionality
    const originalQueueState = useRef<EventNode[]>([]);

    // Store original state when entering edit mode
    useEffect(() => {
        if (columnViewMode === "queue" && originalQueueState.current.length === 0) {
            originalQueueState.current = events.map((event) => ({
                ...event,
                eventData: { ...event.eventData },
            }));
        }
        // Clear original state when exiting edit mode
        if (columnViewMode === "view") {
            originalQueueState.current = [];
        }
    }, [columnViewMode, events]);

    const handleIconClick = () => {
        if (globalFlag.isAdjustmentMode()) {
            // In global mode: toggle opt in/out
            if (!isPendingParentUpdate) {
                globalFlag.optIn(queue.teacher.username);
            } else {
                globalFlag.optOut(queue.teacher.username);
            }
        } else {
            // Not in global mode: toggle view/queue mode
            setColumnViewMode(columnViewMode === "view" ? "queue" : "view");
        }
    };

    const handleEditSchedule = () => {
        setColumnViewMode("queue");
    };

    const handleSubmit = async () => {
        try {
            // Only submit events that have actually changed
            const updates = events
                .filter((event) => event.id) // Only include events that exist in DB
                .filter((currentEvent) => {
                    // Find the original version of this event
                    const originalEvent = originalQueueState.current.find((e) => e.id === currentEvent.id);
                    if (!originalEvent) return true; // New event, include it

                    // Check if date or duration changed
                    const dateChanged = currentEvent.eventData.date !== originalEvent.eventData.date;
                    const durationChanged = currentEvent.eventData.duration !== originalEvent.eventData.duration;

                    return dateChanged || durationChanged;
                })
                .map((event) => ({
                    id: event.id,
                    date: event.eventData.date,
                    duration: event.eventData.duration,
                }));

            if (updates.length > 0) {
                console.log(`📤 Submitting ${updates.length} changed event updates for ${queue.teacher.username}`, {
                    changes: updates.map((u) => ({
                        id: u.id,
                        newDate: u.date,
                        newDuration: u.duration,
                    })),
                });
                const result = await bulkUpdateClassboardEvents(updates);

                if (!result.success) {
                    console.error("Failed to update events:", result.error);
                    return;
                }

                console.log(`✅ Successfully updated ${result.data?.updatedCount} events`);
            } else {
                console.log("ℹ️ No events were changed, skipping submission");
            }

            // Clear original state and exit edit mode
            setColumnViewMode("view");
            originalQueueState.current = [];
        } catch (error) {
            console.error("Error submitting queue changes:", error);
        }
    };

    const handleReset = () => {
        // Restore original queue state
        if (originalQueueState.current.length > 0) {
            originalQueueState.current.forEach((originalEvent, index) => {
                const currentEvent = events[index];
                if (currentEvent) {
                    currentEvent.eventData.date = originalEvent.eventData.date;
                    currentEvent.eventData.duration = originalEvent.eventData.duration;
                }
            });
            setRefreshKey((prev) => prev + 1);
        }
    };

    const handleCancel = () => {
        // Discard changes and return to view mode
        handleReset();
        setColumnViewMode("view");
        originalQueueState.current = [];

        // If in global adjustment mode, opt this teacher out so they're not affected by further changes
        if (globalFlag.isAdjustmentMode()) {
            globalFlag.optOut(queue.teacher.username);
        }
    };


    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };

    const handleDeleteComplete = () => {
        setColumnViewMode("view");
        setRefreshKey((prev) => prev + 1);
        onEventDeleted?.("all");
    };

    return (
        <div
            key={refreshKey}
            onDragOver={dragState.onDragOver}
            onDragEnter={(e) => dragState.onDragEnter(e, queue.teacher.username)}
            onDragLeave={dragState.onDragLeave}
            onDrop={(e) => dragState.onDrop(e, queue.teacher.username)}
            className="flex-1 min-w-[280px] bg-transparent p-0 space-y-0 flex flex-col border-r border-border last:border-r-0"
        >
            <TeacherColumnController columnViewMode={columnViewMode} queue={queue} onEditSchedule={handleEditSchedule} onSubmit={handleSubmit} onReset={handleReset} onCancel={handleCancel} onDeleteComplete={handleDeleteComplete} />

            <div className={`px-3 py-3 flex-1 overflow-y-auto border-2 transition-colors ${dragState.dragOverTeacherColumn(queue.teacher.username)}`}>
                {columnViewMode === "view" ? (
                    <TeacherEventQueue
                        queue={queue}
                        controller={controller}
                        onDragOver={dragState.onDragOver}
                        onDragEnter={(e) => dragState.onDragEnter(e, queue.teacher.username)}
                        onDragLeave={dragState.onDragLeave}
                        onDrop={(e) => dragState.onDrop(e, queue.teacher.username)}
                        onRemoveEvent={async (eventId) => {
                            await onEventDeleted?.(eventId);
                        }}
                    />
                ) : (
                    <TeacherQueueEditor events={events} teacherQueue={queue} onRefresh={handleRefresh} controller={controller} onEventDeleted={onEventDeleted} />
                )}
            </div>
        </div>
    );
}

interface TeacherClassDailyProps {
    teacherQueues: TeacherQueue[];
    draggedBooking: DraggableBooking | null;
    isLessonTeacher: (bookingId: string, teacherUsername: string) => boolean;
    classboardStats: ClassboardStats;
    controller: ControllerSettings;
    selectedDate: string;
    onEventDeleted?: (eventId: string) => void;
    onAddLessonEvent?: (booking: DraggableBooking, teacherUsername: string) => Promise<void>;
}

export default function TeacherClassDaily({ teacherQueues, draggedBooking, isLessonTeacher, classboardStats, controller, selectedDate, onEventDeleted, onAddLessonEvent }: TeacherClassDailyProps) {
    const [dragOverTeacher, setDragOverTeacher] = useState<string | null>(null);
    const [dragCompatibility, setDragCompatibility] = useState<"compatible" | "incompatible" | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Create GlobalFlag instance
    const globalFlag = useMemo(
        () =>
            new GlobalFlag(teacherQueues, controller, () => {
                setRefreshTrigger((prev) => prev + 1);
            }),
        [teacherQueues, controller]
    );

    // Update teacher queues when they change
    useEffect(() => {
        globalFlag.updateTeacherQueues(teacherQueues);
    }, [teacherQueues, globalFlag]);

    if (teacherQueues.length === 0) {
        return <div className="p-8 text-center text-muted-foreground border border-border rounded-lg bg-muted/10">No teachers available</div>;
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragEnter = (e: React.DragEvent, teacherUsername: string) => {
        e.preventDefault();
        setDragOverTeacher(teacherUsername);

        if (draggedBooking) {
            const isValid = isLessonTeacher(draggedBooking.bookingId, teacherUsername);
            const compatibility = isValid ? "compatible" : "incompatible";
            setDragCompatibility(compatibility);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        const relatedTarget = e.relatedTarget as Node;
        if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
            setDragOverTeacher(null);
            setDragCompatibility(null);
        }
    };

    const handleDrop = async (e: React.DragEvent, teacherUsername: string) => {
        e.preventDefault();
        e.stopPropagation();

        setDragOverTeacher(null);
        setDragCompatibility(null);

        try {
            const data = e.dataTransfer.getData("application/json");

            if (!data) {
                return;
            }

            const booking: DraggableBooking = JSON.parse(data);

            // Find the lesson for this teacher
            const lesson = booking.lessons.find((l) => l.teacherUsername === teacherUsername);

            if (!lesson) {
                return;
            }

            // Call the smart insertion handler
            if (onAddLessonEvent) {
                await onAddLessonEvent(booking, teacherUsername);
            }
        } catch (error) {
            console.error("Error handling drop:", error);
        }
    };


    // Store original state for each teacher queue when entering adjustment mode
    const originalQueueStates = useRef<Map<string, EventNode[]>>(new Map());

    useEffect(() => {
        if (globalFlag.isAdjustmentMode()) {
            // Store original state when entering adjustment mode
            teacherQueues.forEach((queue) => {
                if (globalFlag.getPendingTeachers().has(queue.teacher.username)) {
                    const events = queue.getAllEvents();
                    originalQueueStates.current.set(
                        queue.teacher.username,
                        events.map((event) => ({
                            ...event,
                            eventData: { ...event.eventData },
                        }))
                    );
                }
            });
        } else {
            // Clear original state when exiting adjustment mode
            originalQueueStates.current.clear();
        }
    }, [globalFlag.isAdjustmentMode(), teacherQueues, globalFlag.getPendingTeachers()]);

    const handleCollectGlobalUpdates = (teacherUsername: string): Array<{ id: string; date: string; duration: number }> => {
        const queue = teacherQueues.find((q) => q.teacher.username === teacherUsername);
        if (!queue) return [];

        const originalEvents = originalQueueStates.current.get(teacherUsername) || [];
        const currentEvents = queue.getAllEvents();

        return currentEvents
            .filter((currentEvent) => {
                const originalEvent = originalEvents.find((e) => e.id === currentEvent.id);
                if (!originalEvent) return true; // New event

                // Check if date or duration changed
                const dateChanged = currentEvent.eventData.date !== originalEvent.eventData.date;
                const durationChanged = currentEvent.eventData.duration !== originalEvent.eventData.duration;

                return dateChanged || durationChanged;
            })
            .map((event) => ({
                id: event.id,
                date: event.eventData.date,
                duration: event.eventData.duration,
            }));
    };

    const handleGlobalSubmit = async () => {
        try {
            const allUpdates: Array<{ id: string; date: string; duration: number }> = [];

            // Collect only changed events from each teacher queue
            teacherQueues.forEach((queue) => {
                if (globalFlag.getPendingTeachers().has(queue.teacher.username)) {
                    const changedEvents = handleCollectGlobalUpdates(queue.teacher.username);
                    allUpdates.push(...changedEvents);
                }
            });

            if (allUpdates.length > 0) {
                console.log(`📤 Submitting ${allUpdates.length} changed events from global adjustment`);
                const result = await bulkUpdateClassboardEvents(allUpdates);

                if (!result.success) {
                    console.error("Failed to update events:", result.error);
                    return;
                }

                console.log(`✅ Successfully updated ${result.data?.updatedCount} events`);
            }

            // Exit adjustment mode after successful submit
            globalFlag.exitAdjustmentMode();
        } catch (error) {
            console.error("Error submitting global updates:", error);
        }
    };

    return (
        <div className="space-y-4 bg-card border border-border rounded-lg p-6 flex flex-col">
            {/* Global Flag Adjustment */}
            <GlobalFlagAdjustment globalFlag={globalFlag} teacherQueues={teacherQueues} onSubmit={handleGlobalSubmit} />

            {/* Content */}
            {teacherQueues.length === 0 ? (
                <div className="min-h-[500px] flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-muted-foreground text-sm mb-2">No teachers found</div>
                        <p className="text-xs text-muted-foreground/70">Assign teachers to bookings to see them here</p>
                    </div>
                </div>
            ) : (
                <div className="min-h-[500px] flex flex-wrap overflow-x-auto">
                    {teacherQueues.map((queue) => {
                        const stats = classboardStats.getTeacherStats(queue.teacher.username);
                        if (!stats) return null;

                        return (
                            <TeacherColumn
                                key={queue.teacher.username}
                                queue={queue}
                                stats={stats}
                                dragState={{
                                    dragOverTeacher,
                                    dragCompatibility,
                                    onDragOver: handleDragOver,
                                    onDragEnter: handleDragEnter,
                                    onDragLeave: handleDragLeave,
                                    onDrop: (e, username) => handleDrop(e, username),
                                    dragOverTeacherColumn: (teacherUsername) =>
                                        getDragOverTeacherColumnColor(dragOverTeacher, dragCompatibility, teacherUsername),
                                }}
                                globalFlag={globalFlag}
                                isPendingParentUpdate={globalFlag.getPendingTeachers().has(queue.teacher.username)}
                                controller={controller}
                                onEventDeleted={onEventDeleted}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
