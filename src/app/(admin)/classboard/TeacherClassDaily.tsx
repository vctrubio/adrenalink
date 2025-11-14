"use client";

import { useState, useMemo } from "react";
import EventCard from "./EventCard";
import EventModCard from "./EventModCard";
import TeacherQueueEditor from "./TeacherQueueEditor";
import TeacherFlagUpdate from "./TeacherFlagUpdate";
import GlobalFlagAdjustment from "./GlobalFlagAdjustment";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import { createClassboardEvent } from "@/actions/classboard-action";
import type { TeacherQueue, ControllerSettings, EventNode } from "@/backend/TeacherQueue";
import type { DraggableBooking } from "@/src/hooks/useClassboard";
import type { ClassboardStats, TeacherStats } from "@/backend/ClassboardStats";
import { getPrettyDuration } from "@/getters/duration-getter";
import { createTeacherStatsDisplay } from "@/types/stats-classboard";
import { timeToMinutes, minutesToTime } from "@/getters/timezone-getter";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type TeacherViewMode = "view" | "edit" | "queue";

interface ParentTime {
    adjustmentMode: boolean;
    globalTime: string | null;
}

function TeacherHeader({ username }: { username: string }) {
    return (
        <div className="flex items-center gap-4">
            <HeadsetIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="text-xl font-bold text-foreground truncate">{username}</div>
        </div>
    );
}

function TeacherStatsGrid({ stats }: { stats: TeacherStats }) {
    const statsDisplay = createTeacherStatsDisplay(stats.eventCount, stats.totalDuration, stats.earnings.teacher, stats.earnings.school, getPrettyDuration);

    return (
        <div className="flex flex-col gap-2">
            {statsDisplay.items.map((item) => (
                <div key={item.label} className={"flex items-center justify-between px-2 py-1.5 text-sm"}>
                    <div className="text-muted-foreground">{item.label}</div>
                    <div className={`font-semibold ${item.color}`}>{item.value}</div>
                </div>
            ))}
        </div>
    );
}

interface TeacherEventQueueProps {
    events: EventNode[];
    viewMode: TeacherViewMode;
    onRemoveEvent?: (eventId: string) => Promise<void>;
    onAdjustDuration?: (eventId: string, increment: boolean) => void;
    onAdjustTime?: (eventId: string, increment: boolean) => void;
    onMoveUp?: (eventId: string) => void;
    onMoveDown?: (eventId: string) => void;
    onRemoveGap?: (eventId: string) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDragEnter?: (e: React.DragEvent) => void;
    onDragLeave?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
    isDragOver?: boolean;
    dragCompatibility?: "compatible" | "incompatible" | null;
}

function calculateGaps(events: EventNode[]): Map<string, { hasGap: boolean; gapDuration: number }> {
    const gapInfo = new Map<string, { hasGap: boolean; gapDuration: number }>();

    events.forEach((event, index) => {
        if (index === 0) {
            gapInfo.set(event.id, { hasGap: false, gapDuration: 0 });
            return;
        }

        const previousEvent = events[index - 1];
        const previousEndTime = timeToMinutes(previousEvent.eventData.date) + previousEvent.eventData.duration;
        const currentStartTime = timeToMinutes(event.eventData.date);
        const gapMinutes = currentStartTime - previousEndTime;

        gapInfo.set(event.id, {
            hasGap: gapMinutes > 0,
            gapDuration: Math.max(0, gapMinutes),
        });
    });

    return gapInfo;
}

function TeacherEventQueue({ events, viewMode, onRemoveEvent, onAdjustDuration, onAdjustTime, onMoveUp, onMoveDown, onRemoveGap, onDragOver, onDragEnter, onDragLeave, onDrop, isDragOver, dragCompatibility }: TeacherEventQueueProps) {
    const gapInfo = calculateGaps(events);

    const getDragOverBg = () => {
        if (!isDragOver) return "";
        if (dragCompatibility === "compatible") return "bg-green-50/50 dark:bg-green-950/50";
        if (dragCompatibility === "incompatible") return "bg-orange-50/50 dark:bg-orange-950/50";
        return "bg-blue-50/50 dark:bg-blue-950/50";
    };

    const handleDragOverLocal = (e: React.DragEvent) => {
        onDragOver?.(e);
    };

    return (
        <div className={`flex flex-col gap-3 flex-1 transition-colors ${getDragOverBg()}`} onDragOver={handleDragOverLocal} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDrop={onDrop}>
            {events.length > 0 ? (
                events.map((event, index) => {
                    const gap = gapInfo.get(event.id) || { hasGap: false, gapDuration: 0 };

                    return (
                        <EventCard
                            key={event.id}
                            event={event}
                            hasNextEvent={index < events.length - 1}
                            onDeleteComplete={async () => {
                                await onRemoveEvent?.(event.id);
                            }}
                        />
                    );
                })
            ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No events</div>
            )}
        </div>
    );
}

function TeacherColumn({
    queue,
    stats,
    viewMode,
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
    viewMode: TeacherViewMode;
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

    const events = queue.getAllEvents();
    const earliestTime = queue.getEarliestEventTime();

    const getBorderColor = () => {
        if (dragOverTeacher !== queue.teacher.username) return "border-border";
        if (dragCompatibility === "compatible") return "border-green-400 bg-green-50/50 dark:bg-green-950/50";
        if (dragCompatibility === "incompatible") return "border-orange-400 bg-orange-50/50 dark:bg-orange-950/50";
        return "border-blue-400 bg-blue-50/50 dark:bg-blue-950/50";
    };

    const handleFlagClick = () => {
        setColumnViewMode(columnViewMode === "view" ? "queue" : "view");
    };

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };

    const getDragOverBg = () => {
        if (dragOverTeacher !== queue.teacher.username) return "border-border";
        if (dragCompatibility === "compatible") return "border-green-400 bg-green-50/50 dark:bg-green-950/50";
        if (dragCompatibility === "incompatible") return "border-orange-400 bg-orange-50/50 dark:bg-orange-950/50";
        return "border-blue-400 bg-blue-50/50 dark:bg-blue-950/50";
    };

    return (
        <div
            key={refreshKey}
            onDragOver={onDragOver}
            onDragEnter={(e) => onDragEnter(e, queue.teacher.username)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, queue.teacher.username, queue)}
            className={`flex-1 min-w-[280px] bg-transparent p-0 space-y-0 flex flex-col transition-colors border-r ${getDragOverBg()} last:border-r-0`}
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

            <div className="py-4 px-5.5 border-b border-border">
                <TeacherHeader username={queue.teacher.username} />
            </div>

            <div className="px-3 py-3 flex-1 overflow-y-auto">
                {columnViewMode === "view" ? (
                    <TeacherEventQueue
                        events={events}
                        viewMode={viewMode}
                        onDragOver={onDragOver}
                        onDragEnter={(e) => onDragEnter(e, queue.teacher.username)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, queue.teacher.username, queue)}
                        isDragOver={dragOverTeacher === queue.teacher.username}
                        dragCompatibility={dragCompatibility}
                        onRemoveEvent={(eventId) => onEventDeleted?.(eventId)}
                    />
                ) : (
                    <TeacherQueueEditor events={events} teacherQueue={queue} onRefresh={handleRefresh} controller={controller} />
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
}

export default function TeacherClassDaily({ teacherQueues, draggedBooking, isLessonTeacher, classboardStats, controller, selectedDate, onEventDeleted }: TeacherClassDailyProps) {
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

    const handleDrop = async (e: React.DragEvent, teacherUsername: string, queue: TeacherQueue) => {
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

            // Get next available slot from teacher queue
            const nextSlot = queue.getNextAvailableSlot(controller);

            // Calculate event date/time
            const dateObj = new Date(selectedDate);
            const [hours, minutes] = nextSlot.split(":").map(Number);
            dateObj.setHours(hours, minutes, 0, 0);
            const eventDate = dateObj.toISOString();

            // Calculate duration based on capacity
            let duration: number;
            if (booking.capacityStudents === 1) {
                duration = controller.durationCapOne;
            } else if (booking.capacityStudents <= 3) {
                duration = controller.durationCapTwo;
            } else {
                duration = controller.durationCapThree;
            }

            // Create the event
            await createClassboardEvent(lesson.id, eventDate, duration, controller.location);
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
        <div className="space-y-4 flex flex-col">
            {/* Header */}
            <div className="space-y-4 pb-4 border-b border-border px-6 pt-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg text-foreground">Teachers</h3>
                        <p className="text-sm text-muted-foreground mt-1">Manage and assign lessons to teachers</p>
                    </div>

                    {/* View/Edit Toggle */}
                    <div className="flex gap-2 bg-muted rounded-lg p-1.5">
                        <button
                            onClick={() => setViewMode("view")}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${viewMode === "view" ? "bg-background text-foreground shadow-md border border-border" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                }`}
                        >
                            View
                        </button>
                        <button
                            onClick={() => setViewMode("edit")}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${viewMode === "edit" ? "bg-background text-foreground shadow-md border border-border" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
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
                <div className="min-h-[500px] flex items-center justify-center border border-border rounded-lg">
                    <div className="text-center">
                        <div className="text-muted-foreground text-sm mb-2">No teachers found</div>
                        <p className="text-xs text-muted-foreground/70">Assign teachers to bookings to see them here</p>
                    </div>
                </div>
            ) : (
                <div className="min-h-[500px] flex flex-wrap overflow-x-auto border border-border rounded-lg bg-card">
                    {teacherQueues.map((queue) => {
                        const stats = classboardStats.getTeacherStats(queue.teacher.username);
                        if (!stats) return null;

                        return (
                            <TeacherColumn
                                key={queue.teacher.username}
                                queue={queue}
                                stats={stats}
                                viewMode={viewMode}
                                dragOverTeacher={dragOverTeacher}
                                dragCompatibility={dragCompatibility}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, queue.teacher.username, queue)}
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
