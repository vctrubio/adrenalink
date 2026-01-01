"use client";

import { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import EventCard from "./EventCard";
import TeacherClassCard from "./TeacherClassCard";
import LessonFlagLocationSettingsController from "./LessonFlagLocationSettingsController";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { QueueController } from "@/src/app/(admin)/(classboard)/QueueController";
import type { TeacherQueueV2, ControllerSettings } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { GlobalFlag } from "@/backend/models/GlobalFlag";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";

// Muted green - softer than entity color
const TEACHER_COLOR = "#16a34a";

interface TeacherClassDailyProps {
    teacherQueues: TeacherQueueV2[];
    draggedBooking?: DraggableBooking | null;
    onAddLessonEvent: (lessonId: string, teacherId: string, capacityStudents: number) => Promise<void>;
    isAdjustmentMode?: boolean;
    globalFlag?: GlobalFlag;
    onCloseAdjustmentMode?: () => void;
    onRefresh?: () => void;
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
export default function TeacherClassDaily({
    teacherQueues,
    draggedBooking,
    onAddLessonEvent,
    isAdjustmentMode,
    globalFlag,
    onCloseAdjustmentMode,
    onRefresh,
}: TeacherClassDailyProps) {
    console.log("👨‍🏫 [TeacherClassDaily] Rendering");
    console.log("   - Teacher queues:", teacherQueues.length);
    console.log("   - Adjustment mode:", isAdjustmentMode);
    console.log("   - Dragged booking:", draggedBooking?.bookingId);

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

    // Filter teachers based on whether they have events
    const { filteredQueues, counts } = useMemo(() => {
        console.log("🔄 [TeacherClassDaily] Filtering queues, filter:", filter);

        const activeQueues: TeacherQueueV2[] = [];
        const allQueues: TeacherQueueV2[] = teacherQueues;

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

    const allTeachersExpanded = filteredQueues.length > 0 && filteredQueues.every((q) => expandedTeachers.has(q.teacher.id));

    const toggleAllTeachers = () => {
        if (allTeachersExpanded) {
            collapseAllTeachers();
        } else {
            expandAllTeachers();
        }
    };

    return (
        <div className={`flex flex-col h-full transition-colors ${draggedBooking ? "bg-green-500/10" : ""}`}>
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
                                    <div
                                        key={`${queue.teacher.id}-${index}`}
                                        className={"py-2 transition-colors"}
                                    >
                                        <TeacherQueueRow
                                            queue={queue}
                                            isExpanded={isExpanded}
                                            onToggleExpand={() => toggleTeacherExpanded(queue.teacher.id)}
                                            draggedBooking={draggedBooking}
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
    queue: TeacherQueueV2;
    isExpanded: boolean;
    onToggleExpand: () => void;
    draggedBooking?: DraggableBooking | null;
    onAddLessonEvent: (lessonId: string, teacherId: string, capacityStudents: number) => Promise<void>;
}

function TeacherQueueRow({
    queue,
    isExpanded,
    onToggleExpand,
    draggedBooking,
    onAddLessonEvent,
}: TeacherQueueRowProps) {
    console.log("👤 [TeacherQueueRow] Rendering:", queue.teacher.username);

    const { controller } = useClassboardContext();
    const [isAdjustmentMode, setIsAdjustmentMode] = useState(false);

    // Create QueueController for gap detection
    const queueController = useMemo(() => {
        if (!queue || !controller) return undefined;
        return new QueueController(queue, controller, () => {});
    }, [queue, controller]);

    // Check if this teacher can receive the dragged booking
    const canReceiveBooking = draggedBooking ? draggedBooking.lessons.some((l) => l.teacherId === queue.teacher.id) : false;

    // Events are already filtered by selected date in ClientClassboard
    const events = queue.getAllEvents();
    console.log("   - Events:", events.length);

    // Auto-expand when entering adjustment mode
    useEffect(() => {
        if (isAdjustmentMode && !isExpanded) {
            console.log("🔄 [TeacherQueueRow] Auto-expanding due to adjustment mode");
            onToggleExpand();
        }
    }, [isAdjustmentMode, isExpanded, onToggleExpand]);

    // Drag-and-drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        if (!draggedBooking) return;
        e.preventDefault(); // Allow drop
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only clear if leaving the entire row div
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const isOutside =
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom;

        if (isOutside) {
            console.log("🎯 [TeacherQueueRow] Drag leave:", queue.teacher.username);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedBooking) return;

        // Find the lesson for this teacher in the dragged booking
        const lesson = draggedBooking.lessons.find((l) => l.teacherId === queue.teacher.id);
        if (!lesson) {
            toast.error(`No lesson available for ${queue.teacher.username}`);
            return;
        }

        console.log("📍 [TeacherQueueRow] Lesson id:", lesson.id, "has teacher id:", queue.teacher.id);
        await onAddLessonEvent(lesson.id, queue.teacher.id, draggedBooking.capacityStudents);
    };

    // Calculate stats and times
    const stats = useMemo(() => queue.getStats(), [queue]);
    const earliestTime = useMemo(() => queue.getEarliestTime(), [queue]);

    const equipmentCounts = useMemo(() => {
        const counts = new Map<string, number>();
        events.forEach((e) => {
            const cat = e.categoryEquipment;
            if (cat) counts.set(cat, (counts.get(cat) || 0) + 1);
        });
        return Array.from(counts.entries()).map(([categoryId, count]) => ({ categoryId, count }));
    }, [events]);

    const eventProgress = useMemo(() => {
        const completed = events.filter((e) => e.eventData.status === "completed").reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
        const planned = events.filter((e) => e.eventData.status === "planned").reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
        const tbc = events.filter((e) => e.eventData.status === "tbc").reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
        const total = completed + planned + tbc;
        const eventIds = events.map((e) => e.id);
        return { completed, planned, tbc, total, eventIds };
    }, [events]);

    return (
        <div
            className={`w-full bg-transparent overflow-hidden transition-all duration-200 flex flex-row items-stretch group/row rounded-xl ${
                canReceiveBooking
                    ? "ring-2 ring-green-500/50 bg-green-500/5"
                    : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Teacher Card */}
            <div className={`flex-shrink-0 transition-all duration-200 p-2 ${isExpanded ? "w-[340px] border-r-2 border-background" : "flex-1 border-r-0"}`}>
                <TeacherClassCard
                    teacherName={queue.teacher.username}
                    stats={stats}
                    earliestTime={earliestTime}
                    equipmentCounts={equipmentCounts}
                    eventProgress={eventProgress}
                    onClick={onToggleExpand}
                    isExpanded={isExpanded}
                    queue={queue}
                    isAdjustmentMode={isAdjustmentMode}
                    onToggleAdjustment={setIsAdjustmentMode}
                />
            </div>

            {/* Event Cards */}
            {isExpanded && (
                <div className="flex-1 min-w-0 flex items-center p-2 overflow-x-auto scrollbar-hide">
                    <div className="flex flex-row gap-4 h-full items-center">
                        {events.length > 0 ? (
                            events.map((event) => (
                                <div key={event.id} className="w-[320px] flex-shrink-0 h-full flex flex-col justify-center">
                                    <EventCard event={event} queue={queue} queueController={queueController} showLocation={true} />
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
