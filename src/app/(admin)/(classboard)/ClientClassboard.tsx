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
import { TeacherQueue, type EventNode } from "@/src/app/(admin)/(classboard)/TeacherQueue";
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

    // Step 2: Create teacher queues directly using TeacherQueue class
    const teacherQueues = useMemo(() => {
        const queues = new Map<string, TeacherQueue>();

        // 1. Initialize queues for all active teachers
        const activeTeachers = allSchoolTeachers.filter((teacher) => teacher.schema.active);
        activeTeachers.forEach((teacher) => {
            queues.set(
                teacher.schema.id,
                new TeacherQueue({
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

                // Add each existing event to queue in chronological order
                (lesson.events || []).forEach((event) => {
                    const eventNode: EventNode = {
                        id: event.id,
                        lessonId: lesson.id,
                        bookingId: booking.booking.id,
                        eventData: {
                            date: event.date,
                            duration: event.duration,
                            location: event.location,
                            status: event.status,
                        },
                        studentData: booking.bookingStudents.map((bs) => ({
                            id: bs.student.id,
                            firstName: bs.student.firstName,
                            lastName: bs.student.lastName,
                            passport: bs.student.passport,
                            country: bs.student.country,
                            phone: bs.student.phone,
                        })),
                        packageData: {
                            pricePerStudent: booking.schoolPackage.pricePerStudent,
                            durationMinutes: booking.schoolPackage.durationMinutes,
                            description: booking.schoolPackage.description,
                            categoryEquipment: booking.schoolPackage.categoryEquipment,
                            capacityEquipment: booking.schoolPackage.capacityEquipment,
                        },
                        commission: {
                            type: lesson.commission.type,
                            cph: parseFloat(lesson.commission.cph),
                        },
                        next: null,
                    };
                    queue.addToQueueInChronologicalOrder(eventNode, controller.gapMinutes);
                });
            });
        });

        // Return queues in order of allSchoolTeachers (which are already sorted)
        return activeTeachers
            .map((teacher) => queues.get(teacher.schema.id))
            .filter((queue) => queue !== undefined) as TeacherQueue[];
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
        async (bookingData: ClassboardData, lessonId: string) => {
            console.log("➕ [ClientClassboard] Adding event for lesson:", lessonId);

            try {
                // Get lesson and teacher ID from booking data
                const lesson = bookingData.lessons.find((l) => l.id === lessonId);
                if (!lesson?.teacher) {
                    toast.error("Lesson or teacher not found");
                    return;
                }

                const teacherId = lesson.teacher.id;
                const bookingId = bookingData.booking.id;

                // Find queue for this teacher
                const queue = teacherQueues.find((q) => q.teacher.id === teacherId);
                if (!queue) {
                    toast.error("Teacher not on board - cannot add lesson");
                    return;
                }

                // Get insertion time and duration from queue
                const { time, duration } = queue.addEventWithSmartInsertion(
                    lessonId,
                    bookingId,
                    selectedDate,
                    bookingData.schoolPackage.capacityStudents,
                    controller,
                );

                // Prepare event creation data
                const eventDate = `${selectedDate}T${time}:00`;
                const eventData = {
                    lessonId,
                    eventDate,
                    duration,
                    location: controller.location,
                };

                console.log("📋 [ClientClassboard] Event data prepared:");
                console.log("   - lessonId:", eventData.lessonId);
                console.log("   - eventDate:", eventData.eventDate);
                console.log("   - duration:", eventData.duration);
                console.log("   - location:", eventData.location);

                // TODO: Create the event via server action
                // const result = await createClassboardEvent(eventData.lessonId, eventData.eventDate, eventData.duration, eventData.location);
                
            } catch (error) {
                console.error("❌ [ClientClassboard] Error adding event:", error);
                toast.error("Failed to add event");
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
