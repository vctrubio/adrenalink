"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import EventCard from "./EventCard";
import EventModCard from "./EventModCard";
import TeacherClassCard from "./TeacherClassCard";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { useTeacherQueue } from "./useTeacherQueue";
import { LockMutationQueue } from "@/src/components/ui/LockMutationQueue";
import type { TeacherQueue } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";

// Muted green - softer than entity color
const TEACHER_COLOR = "#16a34a";

interface TeacherClassDailyProps {
    teacherQueues: TeacherQueue[];
    draggedBooking?: DraggableBooking | null;
    onAddLessonEvent: (lessonId: string, teacherId: string, capacityStudents: number) => Promise<void>;
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
}: TeacherClassDailyProps) {
    console.log("👨‍🏫 [TeacherClassDaily] Rendering");
    console.log("   - Teacher queues:", teacherQueues.length);
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
    queue: TeacherQueue;
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
    const { controller } = useClassboardContext();
    
    // Use custom hook for all queue management logic
    const {
        isAdjustmentMode,
        setIsAdjustmentMode,
        hasChanges,
        isQueueOptimised,
        optimisationStats,
        isLocked,
        queueController,
        handleSubmit,
        handleReset,
        handleCancel,
        handleOptimise,
        handleToggleLock,
    } = useTeacherQueue({ queue, controller });

    const canReceiveBooking = draggedBooking?.lessons.some((l) => l.teacherId === queue.teacher.id) ?? false;
    const events = queue.getAllEvents();

    // Drag-and-drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        if (!draggedBooking) return;
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedBooking) return;

        const lesson = draggedBooking.lessons.find((l) => l.teacherId === queue.teacher.id);
        if (!lesson) {
            toast.error(`No lesson available for ${queue.teacher.username}`);
            return;
        }

        await onAddLessonEvent(lesson.id, queue.teacher.id, draggedBooking.capacityStudents);
    };

    // Calculate stats
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
                    hasChanges={hasChanges}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    onCancel={handleCancel}
                />
                {/* Optimise and Lock controls - always show in adjustment mode */}
                {isAdjustmentMode && (
                    <div className="mt-2 px-2">
                        <LockMutationQueue
                            isLocked={isLocked}
                            onToggle={handleToggleLock}
                            isOptimised={isQueueOptimised}
                            optimisationStats={optimisationStats}
                            onOptimise={handleOptimise}
                        />
                    </div>
                )}
            </div>

            {/* Event Cards */}
            {isExpanded && (
                <div className="flex-1 min-w-0 flex items-center p-2 overflow-x-auto scrollbar-hide">
                    <div className="flex flex-row gap-4 h-full items-center">
                        {events.length > 0 ? (
                            events.map((event) => (
                                <div key={event.id} className="w-[320px] flex-shrink-0 h-full flex flex-col justify-center">
                                    {isAdjustmentMode && queueController ? (
                                        <EventModCard 
                                            eventId={event.id} 
                                            queueController={queueController} 
                                            onDelete={() => queueController.removeFromSnapshot(event.id)}
                                        />
                                    ) : (
                                        <EventCard 
                                            event={event} 
                                            queueController={queueController} 
                                            onDeleteWithCascade={async (eventId: string) => {
                                                if (!queueController) return;
                                                
                                                try {
                                                    // Get cascade delete plan
                                                    const { deletedId, updates } = queueController.cascadeDeleteAndOptimise(eventId);
                                                    
                                                    console.log(`🗑️ [TeacherClassDaily] Cascade delete: ${deletedId}, ${updates.length} events to update`);
                                                    
                                                    // Execute: delete from DB + bulk update remaining events
                                                    const { deleteClassboardEvent } = await import("@/actions/classboard-action");
                                                    const { bulkUpdateClassboardEvents } = await import("@/actions/classboard-bulk-action");
                                                    
                                                    await deleteClassboardEvent(deletedId);
                                                    
                                                    if (updates.length > 0) {
                                                        await bulkUpdateClassboardEvents(updates, []);
                                                    }
                                                    
                                                    console.log("✅ [TeacherClassDaily] Cascade delete complete");
                                                } catch (error) {
                                                    console.error("❌ [TeacherClassDaily] Cascade delete failed:", error);
                                                    throw error;
                                                }
                                            }}
                                            showLocation={true} 
                                        />
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
