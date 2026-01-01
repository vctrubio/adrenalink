"use client";

import { useState, useMemo, useEffect } from "react";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import EventCard from "./EventCard";
import TeacherClassCard from "./TeacherClassCard";
import type { TeacherQueue, ControllerSettings } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";

// Muted green - softer than entity color
const TEACHER_COLOR = "#16a34a";

interface TeacherClassDailyProps {
    teacherQueues: TeacherQueue[];
    selectedDate: string;
    draggedBooking?: DraggableBooking | null;
    isLessonTeacher?: (bookingId: string, teacherId: string) => boolean;
    controller: ControllerSettings;
    onAddLessonEvent?: (booking: DraggableBooking, lessonId: string) => Promise<void>;
}

type TeacherFilter = "active" | "all";

/**
 * TeacherClassDaily - Displays teacher queues in a list
 *
 * CURRENT STATE: Display only - no edit functionality yet
 * - Shows teacher cards with stats
 * - Displays event cards for each teacher
 * - Supports expand/collapse
 * - Filters active vs all teachers
 */
export default function TeacherClassDaily({ teacherQueues, selectedDate, draggedBooking, isLessonTeacher, controller, onAddLessonEvent }: TeacherClassDailyProps) {
    console.log("👨‍🏫 [TeacherClassDaily] Rendering");
    console.log("   - Teacher queues:", teacherQueues.length);
    console.log("   - Selected date:", selectedDate);

    const [filter, setFilter] = useState<TeacherFilter>("active");
    const [expandedTeachers, setExpandedTeachers] = useState<Set<string>>(new Set(teacherQueues.map((q) => q.teacher.id)));

    const toggleTeacherExpanded = (teacherId: string) => {
        console.log("🔄 [TeacherClassDaily] Toggling teacher:", teacherId);
        setExpandedTeachers((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(teacherId)) {
                newSet.delete(teacherId);
            } else {
                newSet.add(teacherId);
            }
            return newSet;
        });
    };

    const expandAllTeachers = () => {
        console.log("🔄 [TeacherClassDaily] Expanding all teachers");
        setExpandedTeachers(new Set(teacherQueues.map((q) => q.teacher.id)));
    };

    const collapseAllTeachers = () => {
        console.log("🔄 [TeacherClassDaily] Collapsing all teachers");
        setExpandedTeachers(new Set());
    };

    // Filter teachers based on whether they have events today
    const { filteredQueues, counts } = useMemo(() => {
        console.log("🔄 [TeacherClassDaily] Filtering queues, filter:", filter);

        const activeQueues: TeacherQueue[] = [];
        const allQueues: TeacherQueue[] = teacherQueues;

        teacherQueues.forEach((queue) => {
            const events = queue.getAllEvents();
            const todayEvents = events.filter((event) => {
                if (!event.eventData.date) return false;
                const eventDate = new Date(event.eventData.date).toISOString().split("T")[0];
                return eventDate === selectedDate;
            });

            if (todayEvents.length > 0) {
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
    }, [teacherQueues, selectedDate, filter]);

    const allTeachersExpanded = filteredQueues.length > 0 && filteredQueues.every((q) => expandedTeachers.has(q.teacher.id));

    const toggleAllTeachers = () => {
        if (allTeachersExpanded) {
            collapseAllTeachers();
        } else {
            expandAllTeachers();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header: Global Toggles & Filter */}
            <div className="p-4 px-6 border-b-2 border-background bg-card flex items-center gap-4 cursor-pointer hover:bg-muted/30 active:bg-muted/50 transition-colors select-none flex-shrink-0" onClick={toggleAllTeachers}>
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
                                const isExpanded = expandedTeachers.has(queue.teacher.id);

                                return (
                                    <div key={`${queue.teacher.id}-${index}`} className="py-2">
                                        <TeacherQueueRow
                                            queue={queue}
                                            selectedDate={selectedDate}
                                            isExpanded={isExpanded}
                                            onToggleExpand={() => toggleTeacherExpanded(queue.teacher.id)}
                                            draggedBooking={draggedBooking}
                                            isLessonTeacher={isLessonTeacher}
                                            controller={controller}
                                            onAddLessonEvent={onAddLessonEvent}
                                        />
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
    selectedDate: string;
    isExpanded: boolean;
    onToggleExpand: () => void;
    draggedBooking?: DraggableBooking | null;
    isLessonTeacher?: (bookingId: string, teacherId: string) => boolean;
    controller: ControllerSettings;
    onAddLessonEvent?: (booking: DraggableBooking, lessonId: string) => Promise<void>;
}

function TeacherQueueRow({ queue, selectedDate, isExpanded, onToggleExpand, draggedBooking, isLessonTeacher, controller, onAddLessonEvent }: TeacherQueueRowProps) {
    console.log("👤 [TeacherQueueRow] Rendering:", queue.teacher.username);

    const [isAdjustmentMode, setIsAdjustmentMode] = useState(false);

    const events = queue.getAllEvents();
    const todayEvents = events.filter((event) => {
        if (!event.eventData.date) return false;
        const eventDate = new Date(event.eventData.date).toISOString().split("T")[0];
        return eventDate === selectedDate;
    });

    console.log("   - Events today:", todayEvents.length);

    // Auto-expand when entering adjustment mode
    useEffect(() => {
        if (isAdjustmentMode && !isExpanded) {
            console.log("🔄 [TeacherQueueRow] Auto-expanding due to adjustment mode");
            onToggleExpand();
        }
    }, [isAdjustmentMode, isExpanded, onToggleExpand]);

    // Check if this teacher can accept the dragged booking
    const canAcceptDrop = useMemo(() => {
        if (!draggedBooking || !isLessonTeacher) return false;
        return isLessonTeacher(draggedBooking.bookingId, queue.teacher.id);
    }, [draggedBooking, isLessonTeacher, queue.teacher.id]);

    // Drag-and-drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        if (!canAcceptDrop) return;
        e.preventDefault(); // Allow drop
        console.log("🎯 [TeacherQueueRow] Drag over:", queue.teacher.username);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        if (!canAcceptDrop || !draggedBooking || !onAddLessonEvent) return;

        console.log("📍 [TeacherQueueRow] Drop booking on teacher:", queue.teacher.username);
        console.log("   - Booking:", draggedBooking.leaderStudentName);

        // Find the lesson for this teacher in the dragged booking
        const lesson = draggedBooking.lessons.find((l) => l.teacherId === queue.teacher.id);
        if (!lesson) {
            console.error("❌ No lesson found for teacher:", queue.teacher.id);
            return;
        }

        console.log("   - Found lesson:", lesson.id, "for teacher ID:", queue.teacher.id);
        await onAddLessonEvent(draggedBooking, lesson.id);
    };

    const completedCount = todayEvents.filter((e) => e.eventData.status === "completed").length;
    const pendingCount = todayEvents.filter((e) => e.eventData.status !== "completed").length;

    // Calculate stats
    const stats = useMemo(() => queue.getStats(), [queue]);
    const earliestTime = useMemo(() => queue.getEarliestEventTime(), [queue]);

    const equipmentCounts = useMemo(() => {
        const counts = new Map<string, number>();
        todayEvents.forEach((e) => {
            const cat = e.packageData?.categoryEquipment;
            if (cat) counts.set(cat, (counts.get(cat) || 0) + 1);
        });
        return Array.from(counts.entries()).map(([categoryId, count]) => ({ categoryId, count }));
    }, [todayEvents]);

    const eventProgress = useMemo(() => {
        const completed = todayEvents.filter((e) => e.eventData.status === "completed").reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
        const planned = todayEvents.filter((e) => e.eventData.status === "planned").reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
        const tbc = todayEvents.filter((e) => e.eventData.status === "tbc").reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
        const total = completed + planned + tbc;
        const eventIds = todayEvents.map((e) => e.id);
        return { completed, planned, tbc, total, eventIds };
    }, [todayEvents]);

    return (
        <div
            className={`w-full bg-transparent overflow-hidden transition-all duration-200 flex flex-row items-stretch group/row rounded-xl ${canAcceptDrop ? "ring-2 ring-green-500/50 bg-green-500/5" : ""}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Teacher Card */}
            <div className={`flex-shrink-0 transition-all duration-200 p-2 ${isExpanded ? "w-[340px] border-r-2 border-background" : "flex-1 border-r-0"}`}>
                <TeacherClassCard
                    teacherName={queue.teacher.username}
                    stats={stats}
                    earliestTime={earliestTime}
                    pendingCount={pendingCount}
                    completedCount={completedCount}
                    equipmentCounts={equipmentCounts}
                    eventProgress={eventProgress}
                    onClick={onToggleExpand}
                    isExpanded={isExpanded}
                    queue={queue}
                    selectedDate={selectedDate}
                    controller={controller}
                    isAdjustmentMode={isAdjustmentMode}
                    onToggleAdjustment={setIsAdjustmentMode}
                />
            </div>

            {/* Event Cards */}
            {isExpanded && (
                <div className="flex-1 min-w-0 flex items-center p-2 overflow-x-auto scrollbar-hide">
                    <div className="flex flex-row gap-4 h-full items-center">
                        {todayEvents.length > 0 ? (
                            todayEvents.map((event) => (
                                <div key={event.id} className="w-[320px] flex-shrink-0 h-full flex flex-col justify-center">
                                    <EventCard event={event} queue={queue} showLocation={true} />
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
