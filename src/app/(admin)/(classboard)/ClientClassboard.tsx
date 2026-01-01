"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { useBookingsForSelectedDate } from "@/src/hooks/useBookingsForSelectedDate";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { HeaderDatePicker } from "@/src/components/ui/HeaderDatePicker";
import ClassboardContentBoard from "./classboard/ClassboardContentBoard";
import ClassboardStatisticsComponent from "./classboard/ClassboardHeaderStatsGrid";
import { ClassboardStatistics } from "@/backend/ClassboardStatistics";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import ClassboardFooter from "./classboard/ClassboardFooter";
import type { ClassboardModel, ClassboardData } from "@/backend/models/ClassboardModel";
import { TeacherQueueV2, type EventNodeV2 } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import { isDateInRange } from "@/getters/date-getter";
import { useAdminClassboardEventListener, useAdminClassboardBookingListener } from "@/supabase/subscribe";
import { getClassboardBookings } from "@/actions/classboard-action";
import { createClassboardEvent } from "@/actions/classboard-action";

interface ClientClassboardProps {
    data: ClassboardModel;
}

/**
 * ClientClassboard - Main classboard client component
 *
 * OPTIMIZATION STRATEGY (following BillboardClient pattern):
 * - Minimal state: Only classboardData and draggedBooking
 * - selectedDate and controller managed via ClassboardProvider
 * - Everything else derived via useMemo
 * - No refreshKey hacks - data flows naturally through subscriptions
 */
export default function ClientClassboard({ data }: ClientClassboardProps) {
    console.log("🎯 [ClientClassboard] Render started");

    // ============================================
    // CONTROLLER STATE - From provider
    // ============================================
    const { mounted, selectedDate, setSelectedDate, controller, setController } = useClassboardContext();

    // ============================================
    // MINIMAL STATE - Only what changes dynamically
    // ============================================
    const [draggedBooking, setDraggedBooking] = useState<DraggableBooking | null>(null);
    const [classboardData, setClassboardData] = useState<ClassboardModel>(data);
    const [optimisticEvents, setOptimisticEvents] = useState<any[]>([]);

    console.log("📅 [ClientClassboard] Selected Date:", selectedDate);
    console.log("🎮 [ClientClassboard] Controller:", controller);

    // ============================================
    // CONTEXT DATA - From providers
    // ============================================
    const { teachers: allSchoolTeachers, error: teachersError } = useSchoolTeachers();
    const credentials = useSchoolCredentials();

    // Get school ID from credentials for subscriptions
    const schoolId = credentials?.id || "";

    console.log("👥 [ClientClassboard] Teachers loaded:", allSchoolTeachers.length);
    console.log("🏫 [ClientClassboard] School:", credentials?.username);
    console.log("🆔 [ClientClassboard] School ID:", schoolId);

    // ============================================
    // REAL-TIME SUBSCRIPTIONS
    // ============================================
    const handleEventDetected = useCallback((newData: ClassboardModel) => {
        console.log("🔔 [SUBSCRIPTION] Event detected, updating classboard data");
        setClassboardData(newData);

        // Clear optimistic events that now have real events in data
        setOptimisticEvents((prev) => {
            if (prev.length === 0) return prev;

            const remaining = prev.filter((optEvent) => {
                // If the lesson now has ANY events in real data, remove this optimistic event
                const lessonId = optEvent.lessonId;

                // Search for the lesson in real data
                const hasRealEvents = Object.values(newData).some((bookingData) => {
                    return bookingData.lessons.some((lesson) => {
                        if (lesson.id !== lessonId) return false;
                        // If lesson has any events, the real event has been created
                        return lesson.events && lesson.events.length > 0;
                    });
                });

                if (hasRealEvents) {
                    console.log("✅ [SUBSCRIPTION] Real event confirmed for lesson, removing optimistic:", optEvent.id);
                    return false; // Remove this optimistic event
                }

                return true; // Keep this optimistic event
            });

            return remaining;
        });
    }, []);

    const handleNewBookingDetected = useCallback(async () => {
        console.log("🔔 [SUBSCRIPTION] New booking detected, refetching data");
        try {
            const result = await getClassboardBookings();
            if (result.success) {
                console.log("✅ [SUBSCRIPTION] Booking data refetched successfully");
                setClassboardData(result.data);
            }
        } catch (error) {
            console.error("❌ [SUBSCRIPTION] Error refetching classboard data:", error);
        }
    }, []);

    useAdminClassboardEventListener({
        schoolId,
        onEventDetected: handleEventDetected,
    });

    useAdminClassboardBookingListener({
        schoolId,
        onNewBooking: handleNewBookingDetected,
    });

    // ============================================
    // DERIVED DATA - All computed via useMemo
    // ============================================

    // Step 1: Filter bookings by selected date (single source of truth)
    const bookingsForSelectedDate = useBookingsForSelectedDate(classboardData, selectedDate);

    // Step 2: Create teacher queues directly using TeacherQueueV2 class
    const teacherQueues = useMemo(() => {
        const queues = new Map<string, TeacherQueueV2>();

        // 1. Initialize queues for all active teachers
        const activeTeachers = allSchoolTeachers.filter((teacher) => teacher.schema.active);
        activeTeachers.forEach((teacher) => {
            queues.set(
                teacher.schema.id,
                new TeacherQueueV2({
                    id: teacher.schema.id,
                    username: teacher.schema.username,
                }),
            );
        });

        // 2. Add existing events from bookings to queues
        bookingsForSelectedDate.forEach((booking) => {
            booking.lessons.forEach((lesson) => {
                const teacherId = lesson.teacher?.id;
                if (!teacherId) return;

                const queue = queues.get(teacherId);
                if (!queue) return;

                // Construct events in queue from database records
                (lesson.events || []).forEach((event) => {
                    const eventNode: EventNodeV2 = {
                        id: event.id,
                        lessonId: lesson.id,
                        bookingId: booking.booking.id,
                        bookingLeaderName: booking.booking.leaderStudentName,
                        bookingStudents: booking.bookingStudents.map((bs) => ({
                            id: bs.student.id,
                            firstName: bs.student.firstName,
                            lastName: bs.student.lastName,
                            passport: bs.student.passport,
                            country: bs.student.country,
                            phone: bs.student.phone,
                        })),
                        capacityStudents: booking.schoolPackage.capacityStudents,
                        pricePerStudent: booking.schoolPackage.pricePerStudent,
                        categoryEquipment: booking.schoolPackage.categoryEquipment,
                        capacityEquipment: booking.schoolPackage.capacityEquipment,
                        commission: {
                            type: lesson.commission.type,
                            cph: parseFloat(lesson.commission.cph),
                        },
                        eventData: {
                            date: event.date,
                            duration: event.duration,
                            location: event.location,
                            status: event.status,
                        },
                        next: null,
                    };
                    queue.constructEvents(eventNode);
                });
            });
        });

        // Return queues in order of allSchoolTeachers (which are already sorted)
        return activeTeachers
            .map((teacher) => queues.get(teacher.schema.id))
            .filter((queue) => queue !== undefined) as TeacherQueueV2[];
    }, [allSchoolTeachers, bookingsForSelectedDate, controller]);

    // Step 3: Calculate statistics
    const stats = useMemo(() => {
        console.log("🔄 [DERIVE] Calculating statistics");
        const statistics = new ClassboardStatistics(teacherQueues);
        const dailyStats = statistics.getDailyLessonStats();
        console.log("📊 [DERIVE] Stats:", dailyStats);
        return dailyStats;
    }, [teacherQueues]);

    // ============================================
    // EVENT HANDLERS
    // ============================================

    // Add event to teacher queue
    const handleAddLessonEvent = useCallback(
        async (lessonId: string, teacherId: string, capacityStudents: number) => {
            console.log("➕ [ClientClassboard] Adding event for lesson:", lessonId);
            console.log("   - teacherId:", teacherId);
            console.log("   - capacityStudents:", capacityStudents);
            console.log("   - Available teacher queues:", teacherQueues.map((q) => ({ id: q.teacher.id, username: q.teacher.username })));

            try {
                // Find queue for this teacher
                const queue = teacherQueues.find((q) => q.teacher.id === teacherId);
                if (!queue) {
                    console.error("❌ [ClientClassboard] Teacher not found in queues. teacherId:", teacherId);
                    toast.error("Teacher not on board - cannot add lesson");
                    return;
                }
                console.log("✅ [ClientClassboard] Found teacher queue:", queue.teacher.username);

                // Calculate duration based on capacity
                let duration: number;
                if (capacityStudents === 1) {
                    duration = controller.durationCapOne;
                } else if (capacityStudents === 2) {
                    duration = controller.durationCapTwo;
                } else {
                    duration = controller.durationCapThree;
                }

                // Get next available slot from queue
                const slotTime = queue.getNextAvailableSlot(
                    controller.submitTime,
                    duration,
                    controller.gapMinutes,
                );

                console.log("📍 [ClientClassboard] Next available slot:", slotTime);

                // Prepare event creation data
                const eventDate = `${selectedDate}T${slotTime}:00`;

                console.log("📋 [ClientClassboard] Event data prepared:");
                console.log("   - lessonId:", lessonId);
                console.log("   - eventDate:", eventDate);
                console.log("   - duration:", duration);
                console.log("   - location:", controller.location);

                // Create the event via server action
                const result = await createClassboardEvent(lessonId, eventDate, duration, controller.location);
                if (!result.success) {
                    console.error("❌ [ClientClassboard] Server action failed:", result.error);
                    return;
                }

                console.log("✅ [ClientClassboard] Event created, subscription will sync");

            } catch (error) {
                console.error("❌ [ClientClassboard] Error adding event:", error);
            }
        },
        [selectedDate, teacherQueues, controller],
    );

    // ============================================
    // RENDER
    // ============================================
    if (!mounted || teachersError) {
        console.log("⏳ [RENDER] Showing skeleton...");
        return <ClassboardSkeleton error={!!teachersError} />;
    }

    console.log("✅ [RENDER] Rendering classboard content");

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-wrap gap-4 p-4">
                <div className="flex-1 min-w-[280px] max-w-2xl p-4 rounded-2xl flex items-center justify-center bg-card border border-zinc-200 dark:border-zinc-700">
                    <HeaderDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
                </div>
                <ClassboardStatisticsComponent stats={stats} />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden h-full flex flex-col">
                <div className="flex-1 overflow-hidden">
                    <ClassboardContentBoard
                        bookingsForSelectedDate={bookingsForSelectedDate}
                        teacherQueues={teacherQueues}
                        draggedBooking={draggedBooking}
                        onSetDraggedBooking={setDraggedBooking}
                        onAddLessonEvent={handleAddLessonEvent}
                    />
                </div>
            </div>

            {/* Footer */}
            <ClassboardFooter controller={controller} setController={setController} />
        </div>
    );
}
