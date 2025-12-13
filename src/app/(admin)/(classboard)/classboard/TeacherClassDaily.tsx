"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import TeacherEventQueue from "./TeacherEventQueue";
import TeacherQueueEditor from "./TeacherEventQueueEditor";
import TeacherColumnController from "./TeacherColumnController";
import type { GlobalFlag } from "@/backend/models/GlobalFlag";
import type { TeacherQueue, ControllerSettings, EventNode } from "@/backend/TeacherQueue";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { DragState, DragCompatibility } from "@/types/drag-state";
import { getDragOverTeacherColumnColor } from "@/types/drag-state";
import type { ClassboardStats } from "@/backend/ClassboardStats";

function TeacherColumn({
    queue,
    dragState,
    globalFlag,
    isPendingParentUpdate,
    controller,
    onEventDeleted,
    onParentRefresh,
    isFirst = false,
}: {
    queue: TeacherQueue;
    dragState: DragState;
    globalFlag: GlobalFlag;
    isPendingParentUpdate: boolean;
    controller: ControllerSettings;
    onEventDeleted?: (eventId: string) => void;
    onParentRefresh?: () => void;
    isFirst?: boolean;
}) {
    const [columnViewMode, setColumnViewMode] = useState<"view" | "queue">("view");
    const [refreshKey, setRefreshKey] = useState(0);

    // Force refresh when queue updates (from real-time listener)
    useEffect(() => {
        setRefreshKey((prev) => prev + 1);
    }, [queue]);

    // Auto-enter queue mode when teacher is pending in global adjustment mode
    useEffect(() => {
        const isInAdjustmentMode = globalFlag.isAdjustmentMode();

        if (isInAdjustmentMode && isPendingParentUpdate) {
            setColumnViewMode("queue");
        }
    }, [globalFlag, isPendingParentUpdate]);

    // Exit queue mode only when exiting global adjustment mode (transition true -> false)
    useEffect(() => {
        const isInAdjustmentMode = globalFlag.isAdjustmentMode();

        // Only exit if we were in adjustment mode and now we're not (transition)
        if (wasInAdjustmentModeRef.current && !isInAdjustmentMode && columnViewMode === "queue") {
            // Exit queue mode when global adjustment mode is deactivated
            handleReset();
            setColumnViewMode("view");
            originalQueueState.current = [];
        }

        // Update ref for next render
        wasInAdjustmentModeRef.current = isInAdjustmentMode;
    }, [globalFlag, columnViewMode, isPendingParentUpdate]);

    // Exit queue editor mode if queue becomes empty
    useEffect(() => {
        const allEvents = queue.getAllEvents();
        if (allEvents.length === 0 && columnViewMode === "queue") {
            setColumnViewMode("view");
        }
    }, [queue, columnViewMode]);

    const events = useMemo(() => {
        return queue.getAllEvents();
    }, [queue, refreshKey, columnViewMode]);

    // Store original queue state for reset functionality
    const originalQueueState = useRef<EventNode[]>([]);

    // Track previous adjustment mode state to detect when exiting
    const wasInAdjustmentModeRef = useRef(false);

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

                    // Check if date, duration, or location changed
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
                    currentEvent.eventData.location = originalEvent.eventData.location;
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
        onParentRefresh?.();
    };

    const handleDeleteComplete = () => {
        setColumnViewMode("view");
        setRefreshKey((prev) => prev + 1);
        onEventDeleted?.("all");
    };

    const isDragOver = dragState.dragOverTeacher === queue.teacher.username;
    const isCompatible = dragState.dragCompatibility === "compatible";
    const isIncompatible = dragState.dragCompatibility === "incompatible";

    return (
        <div
            key={queue.teacher.username}
            onDragOver={dragState.onDragOver}
            onDragEnter={(e) => dragState.onDragEnter(e, queue.teacher.username)}
            onDragLeave={dragState.onDragLeave}
            onDrop={(e) => dragState.onDrop(e, queue.teacher.username)}
            className={`bg-card flex-shrink-0 w-[340px] flex flex-col rounded-xl transition-all duration-200 ${
                isDragOver && isCompatible
                    ? "border-2 border-yellow-500"
                    : isDragOver && isIncompatible
                      ? "border-2 border-muted"
                      : "border-2 border-transparent"
            }`}
        >
            <TeacherColumnController columnViewMode={columnViewMode} queue={queue} onEditSchedule={handleEditSchedule} onSubmit={handleSubmit} onReset={handleReset} onCancel={handleCancel} onDeleteComplete={handleDeleteComplete} />

            <div className="p-3">
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
    onEventDeleted?: (eventId: string) => void;
    onAddLessonEvent?: (booking: DraggableBooking, teacherUsername: string) => Promise<void>;
    globalFlag: GlobalFlag;
}

export default function TeacherClassDaily({ teacherQueues, draggedBooking, isLessonTeacher, classboardStats, controller, onEventDeleted, onAddLessonEvent, globalFlag }: TeacherClassDailyProps) {
    const [dragOverTeacher, setDragOverTeacher] = useState<string | null>(null);
    const [dragCompatibility, setDragCompatibility] = useState<DragCompatibility>(null);
    const [refreshKey, setRefreshKey] = useState(0);

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
    return (
        <div className="flex flex-col h-full">
            {/* Content */}
            {teacherQueues.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-muted-foreground text-sm mb-2">No teachers found</div>
                        <p className="text-xs text-muted-foreground/70">Assign teachers to bookings to see them here</p>
                    </div>
                </div>
            ) : (
                <div className="h-full flex overflow-x-auto pb-2 gap-4">
                    {teacherQueues.map((queue, index) => {
                            const stats = classboardStats.getTeacherStats(queue.teacher.username);
                            if (!stats) return null;

                            return (
                                <React.Fragment key={queue.teacher.username}>
                                    <TeacherColumn
                                        queue={queue}
                                        stats={stats}
                                        isFirst={index === 0}
                                    dragState={{
                                        dragOverTeacher,
                                        dragCompatibility,
                                        onDragOver: handleDragOver,
                                        onDragEnter: handleDragEnter,
                                        onDragLeave: handleDragLeave,
                                        onDrop: (e, username) => handleDrop(e, username),
                                        dragOverTeacherColumn: (teacherUsername) => getDragOverTeacherColumnColor(dragOverTeacher, dragCompatibility, teacherUsername),
                                    }}
                                    globalFlag={globalFlag}
                                    isPendingParentUpdate={globalFlag.getPendingTeachers().has(queue.teacher.username)}
                                    controller={controller}
                                    onEventDeleted={onEventDeleted}
                                    onParentRefresh={() => setRefreshKey((prev) => prev + 1)}
                                />
                                </React.Fragment>
                            );
                    })}
                </div>
            )}
        </div>
    );
}
