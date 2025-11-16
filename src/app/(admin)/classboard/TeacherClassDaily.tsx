"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import TeacherEventQueue from "./TeacherEventQueue";
import TeacherQueueEditor from "./TeacherEventQueueEditor";
import TeacherColumnController from "./TeacherColumnController";
import GlobalFlagAdjustment from "./GlobalFlagAdjustment";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";
import type { TeacherQueue, ControllerSettings, EventNode } from "@/backend/TeacherQueue";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { ClassboardStats, TeacherStats } from "@/backend/ClassboardStats";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";

type TeacherViewMode = "view" | "edit" | "queue";

interface ParentTime {
    adjustmentMode: boolean;
    globalTime: string | null;
}

function TeacherColumn({
    queue,
    stats,
    dragOverTeacher,
    dragCompatibility,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
    parentTime,
    isOptedOutOfGlobalUpdate,
    onOptOut,
    onOptIn,
    controller,
    onEventDeleted,
}: {
    queue: TeacherQueue;
    stats: TeacherStats;
    dragOverTeacher: string | null;
    dragCompatibility: "compatible" | "incompatible" | null;
    onDragOver: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent, username: string) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, username: string) => void;
    parentTime: ParentTime;
    isOptedOutOfGlobalUpdate: boolean;
    onOptOut: (teacherUsername: string) => void;
    onOptIn: (teacherUsername: string) => void;
    controller: ControllerSettings;
    onEventDeleted?: (eventId: string) => void;
}) {
    const [columnViewMode, setColumnViewMode] = useState<"view" | "queue">("view");
    const [refreshKey, setRefreshKey] = useState(0);

    // Force refresh when queue updates (from real-time listener)
    useEffect(() => {
        console.log(`[TeacherColumn] Queue updated for ${queue.teacher.username}, forcing refresh`);
        setRefreshKey((prev) => prev + 1);
    }, [queue]);

    // Exit queue editor mode if queue becomes empty
    useEffect(() => {
        const allEvents = queue.getAllEvents();
        if (allEvents.length === 0 && columnViewMode === "queue") {
            console.log(`[TeacherColumn] Queue is empty for ${queue.teacher.username}, exiting queue mode`);
            setColumnViewMode("view");
        }
    }, [queue]);

    const events = useMemo(() => queue.getAllEvents(), [queue, refreshKey]);
    const earliestTime = useMemo(() => queue.getEarliestEventTime(), [queue, refreshKey]);

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
            if (isOptedOutOfGlobalUpdate) {
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
                    changes: updates.map(u => ({
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
                console.log(`ℹ️ No events were changed, skipping submission`);
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
    };

    const getBorderColor = () => {
        if (dragOverTeacher !== queue.teacher.username) return "border-transparent";
        if (dragCompatibility === "compatible") return "border-green-400";
        if (dragCompatibility === "incompatible") return "border-orange-400";
        return "border-transparent";
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
            onDragOver={onDragOver}
            onDragEnter={(e) => onDragEnter(e, queue.teacher.username)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, queue.teacher.username)}
            className="flex-1 min-w-[280px] bg-transparent p-0 space-y-0 flex flex-col border-r border-border last:border-r-0"
        >
            {/* <div className="p-3 border-b border-border"> */}
            {/*     <TeacherFlagUpdate */}
            {/*         teacherUsername={queue.teacher.username} */}
            {/*         earliestTime={earliestTime} */}
            {/*         inGlobalAdjustmentMode={parentTime.adjustmentMode} */}
            {/*         isOptedOutOfGlobalUpdate={isOptedOutOfGlobalUpdate} */}
            {/*         onFlagClick={handleFlagClick} */}
            {/*         onOptOut={onOptOut} */}
            {/*         onOptIn={onOptIn} */}
            {/*     /> */}
            {/* </div> */}

            {/* <div className="px-3 py-2 border-b border-border"> */}
            {/*     <TeacherStatsGrid stats={stats} /> */}
            {/* </div> */}
            {/**/}

            <TeacherColumnController
                username={queue.teacher.username}
                stats={stats}
                columnViewMode={columnViewMode}
                queue={queue}
                eventIds={events.map((e) => e.id)}
                earliestTime={earliestTime}
                onEditSchedule={handleEditSchedule}
                onSubmit={handleSubmit}
                onReset={handleReset}
                onCancel={handleCancel}
                onDeleteComplete={handleDeleteComplete}
            />

            <div className={`px-3 py-3 flex-1 overflow-y-auto border-2 transition-colors ${getBorderColor()}`}>
                {columnViewMode === "view" ? (
                    <TeacherEventQueue
                        queue={queue}
                        controller={controller}
                        onDragOver={onDragOver}
                        onDragEnter={(e) => onDragEnter(e, queue.teacher.username)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, queue.teacher.username)}
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
    const [viewMode, setViewMode] = useState<TeacherViewMode>("view");
    const [dragOverTeacher, setDragOverTeacher] = useState<string | null>(null);
    const [dragCompatibility, setDragCompatibility] = useState<"compatible" | "incompatible" | null>(null);
    const [parentTime, setParentTime] = useState<ParentTime>({
        adjustmentMode: false,
        globalTime: null,
    });
    const [optedOutTeachers, setOptedOutTeachers] = useState<Set<string>>(new Set());

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
        setOptedOutTeachers((prev) => new Set(prev).add(teacherUsername));
    };

    const handleOptIn = (teacherUsername: string) => {
        setOptedOutTeachers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(teacherUsername);
            return newSet;
        });
    };

    const handleEnterGlobalAdjustmentMode = () => {
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
    };

    const handleGlobalTimeAdjustment = (newTime: string) => {
        if (!parentTime.globalTime) return;

        const currentMinutes = timeToMinutes(parentTime.globalTime);
        const newMinutes = timeToMinutes(newTime);
        const offsetMinutes = newMinutes - currentMinutes;

        // Apply adjustment to all non-opted-out teachers
        teacherQueues.forEach((queue) => {
            if (!optedOutTeachers.has(queue.teacher.username)) {
                const events = queue.getAllEvents();
                events.forEach((event) => {
                    // Update event date/time by offset
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
        });

        // Update parent time
        setParentTime({
            adjustmentMode: true,
            globalTime: newTime,
        });
    };

    return (
        <div className="space-y-4 bg-card border border-border rounded-lg p-6 flex flex-col">
            {/* Header */}
            <div className="space-y-4 pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg text-foreground">Teachers</h3>
                        <p className="text-sm text-muted-foreground mt-1">Manage and assign lessons to teachers</p>
                    </div>

                    {/* View/Edit Toggle */}
                    <div className="flex gap-2 bg-muted rounded-lg p-1.5">
                        <button
                            onClick={() => setViewMode("view")}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                                viewMode === "view" ? "bg-background text-foreground shadow-md border border-border" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            }`}
                        >
                            View
                        </button>
                        <button
                            onClick={() => setViewMode("edit")}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                                viewMode === "edit" ? "bg-background text-foreground shadow-md border border-border" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            }`}
                        >
                            Edit
                        </button>
                    </div>
                </div>

                {/* Global Flag Adjustment */}
                <GlobalFlagAdjustment
                    globalEarliestTime={globalEarliestTime}
                    isAdjustmentMode={parentTime.adjustmentMode}
                    onEnterAdjustmentMode={handleEnterGlobalAdjustmentMode}
                    onExitAdjustmentMode={handleExitGlobalAdjustmentMode}
                    onTimeAdjustment={handleGlobalTimeAdjustment}
                />
            </div>

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
                                dragOverTeacher={dragOverTeacher}
                                dragCompatibility={dragCompatibility}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, queue.teacher.username)}
                                parentTime={parentTime}
                                isOptedOutOfGlobalUpdate={optedOutTeachers.has(queue.teacher.username)}
                                onOptOut={handleOptOut}
                                onOptIn={handleOptIn}
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
