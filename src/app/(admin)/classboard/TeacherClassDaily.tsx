"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import TeacherEventQueue from "./TeacherEventQueue";
import TeacherQueueEditor from "./TeacherEventQueueEditor";
import TeacherColumnController from "./TeacherColumnController";
import GlobalFlagAdjustment from "./GlobalFlagAdjustment";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";
import type { TeacherQueue, ControllerSettings, EventNode } from "@/backend/TeacherQueue";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { DragState } from "@/types/drag-state";
import { getDragOverTeacherColumnColor } from "@/types/drag-state";
import type { ClassboardStats, TeacherStats } from "@/backend/ClassboardStats";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";

interface ParentTime {
    adjustmentMode: boolean;
    globalTime: string | null;
}

function TeacherColumn({
    queue,
    stats,
    dragState,
    parentTime,
    isPendingParentUpdate,
    onOptOut,
    onOptIn,
    controller,
    onEventDeleted,
    onExitGlobalAdjustment,
    onCollectGlobalUpdates,
    onPendingTeacherQueueEdit,
}: {
    queue: TeacherQueue;
    stats: TeacherStats;
    dragState: DragState;
    parentTime: ParentTime;
    isPendingParentUpdate: boolean;
    onOptOut: (teacherUsername: string) => void;
    onOptIn: (teacherUsername: string) => void;
    controller: ControllerSettings;
    onEventDeleted?: (eventId: string) => void;
    onExitGlobalAdjustment?: () => void;
    onCollectGlobalUpdates?: (teacherUsername: string) => Array<{ id: string; date: string; duration: number }>;
    onPendingTeacherQueueEdit?: () => void;
}) {
    const [columnViewMode, setColumnViewMode] = useState<"view" | "queue">("view");
    const [refreshKey, setRefreshKey] = useState(0);

    // Force refresh when queue updates (from real-time listener)
    useEffect(() => {
        console.log(`[TeacherColumn] Queue updated for ${queue.teacher.username}, forcing refresh`);
        setRefreshKey((prev) => prev + 1);
        // Signal pending teacher queue edits for real-time Adapt button updates
        if (isPendingParentUpdate && columnViewMode === "queue") {
            onPendingTeacherQueueEdit?.();
        }
    }, [queue, isPendingParentUpdate, columnViewMode, onPendingTeacherQueueEdit]);

    // Auto-enter queue mode when global adjustment mode is active
    useEffect(() => {
        if (parentTime.adjustmentMode && isPendingParentUpdate) {
            setColumnViewMode("queue");
        } else if (!parentTime.adjustmentMode && columnViewMode === "queue") {
            // Exit queue mode when global adjustment mode is deactivated
            handleReset();
            setColumnViewMode("view");
            originalQueueState.current = [];
        }
    }, [parentTime.adjustmentMode, isPendingParentUpdate]);

    // Exit queue editor mode if queue becomes empty
    useEffect(() => {
        const allEvents = queue.getAllEvents();
        if (allEvents.length === 0 && columnViewMode === "queue") {
            console.log(`[TeacherColumn] Queue is empty for ${queue.teacher.username}, exiting queue mode`);
            setColumnViewMode("view");
        }
    }, [queue]);

    const events = useMemo(() => {
        // Only include parentTime.globalTime in deps if in edit mode
        // This ensures event cards only update in editor view
        return queue.getAllEvents();
    }, [queue, refreshKey, columnViewMode === "queue" ? parentTime.globalTime : null]);

    const earliestTime = useMemo(() => {
        // Only recalculate in edit mode
        return queue.getEarliestEventTime();
    }, [queue, refreshKey, columnViewMode === "queue" ? parentTime.globalTime : null]);

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
        if (parentTime.adjustmentMode) {
            // In global mode: toggle opt in/out
            if (!isPendingParentUpdate) {
                onOptIn(queue.teacher.username);
            } else {
                onOptOut(queue.teacher.username);
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
        if (parentTime.adjustmentMode) {
            onOptOut(queue.teacher.username);
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
                    <TeacherQueueEditor events={events} teacherQueue={queue} onRefresh={handleRefresh} controller={controller} onEventDeleted={onEventDeleted} onPendingTeacherQueueEdit={isPendingParentUpdate ? onPendingTeacherQueueEdit : undefined} />
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
    const [parentTime, setParentTime] = useState<ParentTime>({
        adjustmentMode: false,
        globalTime: null,
    });
    const [pendingParentUpdateTeachers, setPendingParentUpdateTeachers] = useState<Set<string>>(new Set());
    const [queueEditRefreshKey, setQueueEditRefreshKey] = useState(0);
    const [isAdjustmentLocked, setIsAdjustmentLocked] = useState(false);

    // Trigger refresh when a pending teacher manually edits their queue
    const handlePendingTeacherQueueEdit = useCallback(() => {
        setQueueEditRefreshKey((prev) => prev + 1);
    }, []);

    // Calculate global earliest time across all teacher queues
    const globalEarliestTime = useMemo(() => {
        const allEarliestTimes = teacherQueues.map((queue) => queue.getEarliestEventTime()).filter((time) => time !== null) as string[];

        if (allEarliestTimes.length === 0) return null;

        // Find the earliest time (minimum in minutes)
        const minTimeInMinutes = Math.min(...allEarliestTimes.map((time) => timeToMinutes(time)));
        return minutesToTime(minTimeInMinutes);
    }, [teacherQueues]);

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

    const handleOptOut = (teacherUsername: string) => {
        setPendingParentUpdateTeachers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(teacherUsername);

            // If all teachers are opted out, exit global adjustment mode
            if (newSet.size === 0) {
                handleExitGlobalAdjustmentMode();
            }

            return newSet;
        });
    };

    const handleOptIn = (teacherUsername: string) => {
        setPendingParentUpdateTeachers((prev) => {
            const newSet = new Set(prev);
            newSet.add(teacherUsername);
            return newSet;
        });
    };

    const handleEnterGlobalAdjustmentMode = () => {
        // Initialize pending set with all teachers that have events
        const teachersWithEvents = teacherQueues
            .filter((queue) => queue.getAllEvents().length > 0)
            .map((queue) => queue.teacher.username);
        setPendingParentUpdateTeachers(new Set(teachersWithEvents));

        setParentTime({
            adjustmentMode: true,
            globalTime: globalEarliestTime,
        });
    };

    const handleExitGlobalAdjustmentMode = () => {
        setParentTime({
            adjustmentMode: false,
            globalTime: null,
        });
        // Clear pending teachers and reset lock when exiting global adjustment mode
        setPendingParentUpdateTeachers(new Set());
        setIsAdjustmentLocked(false);
    };

    const handleGlobalTimeAdjustment = (newTime: string) => {
        if (isAdjustmentLocked) {
            // Locked mode: all queues match the exact global time
            teacherQueues.forEach((queue) => {
                if (pendingParentUpdateTeachers.has(queue.teacher.username)) {
                    const earliestTime = queue.getEarliestEventTime();
                    if (earliestTime) {
                        const currentMinutes = timeToMinutes(earliestTime);
                        const targetMinutes = timeToMinutes(newTime);
                        const offsetMinutes = targetMinutes - currentMinutes;

                        const events = queue.getAllEvents();
                        events.forEach((event) => {
                            const currentDate = event.eventData.date;
                            if (currentDate.includes("T")) {
                                const [datePart, timePart] = currentDate.split("T");
                                const currentEventMinutes = timeToMinutes(timePart.substring(0, 5));
                                const newEventMinutes = currentEventMinutes + offsetMinutes;
                                const newEventTime = minutesToTime(newEventMinutes);
                                event.eventData.date = `${datePart}T${newEventTime}:00`;
                            }
                        });
                    }
                }
            });
        } else {
            // Unlocked mode: only cascade to teachers whose earliest time <= adjustmentTime
            // Teachers starting after adjustmentTime wait for global time to catch up
            if (!parentTime.globalTime) return;

            const currentMinutes = timeToMinutes(parentTime.globalTime);
            const newMinutes = timeToMinutes(newTime);
            const offsetMinutes = newMinutes - currentMinutes;

            teacherQueues.forEach((queue) => {
                if (pendingParentUpdateTeachers.has(queue.teacher.username)) {
                    const earliestTime = queue.getEarliestEventTime();
                    if (earliestTime) {
                        const queueMinutes = timeToMinutes(earliestTime);

                        // Only cascade to teachers whose earliest time < adjustment time
                        if (queueMinutes < newMinutes) {
                            const events = queue.getAllEvents();
                            events.forEach((event) => {
                                const currentDate = event.eventData.date;
                                if (currentDate.includes("T")) {
                                    const [datePart, timePart] = currentDate.split("T");
                                    const currentEventMinutes = timeToMinutes(timePart.substring(0, 5));
                                    const newEventMinutes = currentEventMinutes + offsetMinutes;
                                    const newEventTime = minutesToTime(newEventMinutes);
                                    event.eventData.date = `${datePart}T${newEventTime}:00`;
                                }
                            });
                        }
                        // If queueMinutes > newMinutes, do nothing (teacher waits for global time to catch up)
                    }
                }
            });
        }

        // Update parent time
        setParentTime({
            adjustmentMode: true,
            globalTime: newTime,
        });
        // Trigger refresh so lock button reflects current adapted count
        setQueueEditRefreshKey((prev) => prev + 1);
    };

    const handleAdapt = () => {
        if (isAdjustmentLocked) {
            // Already locked: unlock
            setIsAdjustmentLocked(false);
            // Trigger refresh so UI updates
            setQueueEditRefreshKey((prev) => prev + 1);
        } else {
            // Not locked: sync all pending teachers to adjustmentTime and lock
            // Need to get the current adjustmentTime from GlobalFlagAdjustment's calculation
            // For now, we'll sync to the earliest time from pending teachers
            // Get the earliest time from all pending teacher queues
            const pendingTimes: string[] = [];
            teacherQueues.forEach((queue) => {
                if (pendingParentUpdateTeachers.has(queue.teacher.username)) {
                    const earliestTime = queue.getEarliestEventTime();
                    if (earliestTime) {
                        pendingTimes.push(earliestTime);
                    }
                }
            });

            if (pendingTimes.length === 0) return;

            // Get the earliest time from pending teachers
            const minTimeInMinutes = Math.min(...pendingTimes.map((time) => timeToMinutes(time)));
            const syncTargetTime = minutesToTime(minTimeInMinutes);

            // Sync all pending teachers to this time
            teacherQueues.forEach((queue) => {
                if (pendingParentUpdateTeachers.has(queue.teacher.username)) {
                    const earliestTime = queue.getEarliestEventTime();
                    if (earliestTime) {
                        const currentMinutes = timeToMinutes(earliestTime);
                        const targetMinutes = timeToMinutes(syncTargetTime);
                        const offsetMinutes = targetMinutes - currentMinutes;

                        const events = queue.getAllEvents();
                        events.forEach((event) => {
                            const currentDate = event.eventData.date;
                            if (currentDate.includes("T")) {
                                const [datePart, timePart] = currentDate.split("T");
                                const currentEventMinutes = timeToMinutes(timePart.substring(0, 5));
                                const newEventMinutes = currentEventMinutes + offsetMinutes;
                                const newEventTime = minutesToTime(newEventMinutes);
                                event.eventData.date = `${datePart}T${newEventTime}:00`;
                            }
                        });
                    }
                }
            });

            // Lock after syncing all teachers
            setIsAdjustmentLocked(true);
            // Trigger refresh so adapted count memo recalculates with new queue state
            setQueueEditRefreshKey((prev) => prev + 1);
        }
    };

    // Store original state for each teacher queue when entering adjustment mode
    const originalQueueStates = useRef<Map<string, EventNode[]>>(new Map());

    useEffect(() => {
        if (parentTime.adjustmentMode) {
            // Store original state when entering adjustment mode
            teacherQueues.forEach((queue) => {
                if (pendingParentUpdateTeachers.has(queue.teacher.username)) {
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
    }, [parentTime.adjustmentMode, teacherQueues, pendingParentUpdateTeachers]);

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
                if (pendingParentUpdateTeachers.has(queue.teacher.username)) {
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
            handleExitGlobalAdjustmentMode();
        } catch (error) {
            console.error("Error submitting global updates:", error);
        }
    };

    return (
        <div className="space-y-4 bg-card border border-border rounded-lg p-6 flex flex-col">
            {/* Global Flag Adjustment */}
            <GlobalFlagAdjustment
                globalEarliestTime={globalEarliestTime}
                isAdjustmentMode={parentTime.adjustmentMode}
                teacherQueues={teacherQueues}
                pendingParentUpdateTeachers={pendingParentUpdateTeachers}
                queueEditRefreshKey={queueEditRefreshKey}
                controller={controller}
                isAdjustmentLocked={isAdjustmentLocked}
                onEnterAdjustmentMode={handleEnterGlobalAdjustmentMode}
                onExitAdjustmentMode={handleExitGlobalAdjustmentMode}
                onTimeAdjustment={handleGlobalTimeAdjustment}
                onAdapt={handleAdapt}
                onSubmit={handleGlobalSubmit}
            />

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
                                parentTime={parentTime}
                                isPendingParentUpdate={pendingParentUpdateTeachers.has(queue.teacher.username)}
                                onOptOut={handleOptOut}
                                onOptIn={handleOptIn}
                                controller={controller}
                                onEventDeleted={onEventDeleted}
                                onExitGlobalAdjustment={handleExitGlobalAdjustmentMode}
                                onCollectGlobalUpdates={handleCollectGlobalUpdates}
                                onPendingTeacherQueueEdit={handlePendingTeacherQueueEdit}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
