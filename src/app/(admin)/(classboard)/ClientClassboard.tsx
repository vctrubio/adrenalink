"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { useBookingsForSelectedDate } from "@/src/hooks/useBookingsForSelectedDate";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { HeaderDatePicker } from "@/src/components/ui/HeaderDatePicker";
import ClassboardContentBoard from "./classboard/ClassboardContentBoard";
import { useClassboardQueues } from "./classboard/useAddLessonEvent";
import ClassboardStatisticsComponent from "./classboard/ClassboardHeaderStatsGrid";
import { ClassboardStatistics } from "@/backend/ClassboardStatistics";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import ClassboardFooter from "./classboard/ClassboardFooter";
import type { ClassboardModel, ClassboardData } from "@/backend/models/ClassboardModel";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import { isDateInRange } from "@/getters/date-getter";
import { useAdminClassboardEventListener, useAdminClassboardBookingListener } from "@/supabase/subscribe";
import { getClassboardBookings } from "@/actions/classboard-action";

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

    console.log("👥 [ClientClassboard] Teachers loaded:", allSchoolTeachers.length);

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
        onEventDetected: handleEventDetected,
    });

    useAdminClassboardBookingListener({
        onNewBooking: handleNewBookingDetected,
    });

    // ============================================
    // DERIVED DATA - All computed via useMemo
    // ============================================

    // Step 1: Filter bookings by selected date (single source of truth)
    const bookingsForSelectedDate = useBookingsForSelectedDate(classboardData, selectedDate);

    // Step 2: Build teacher queues and get event handler (consolidated)
    const { teacherQueues, handleAddLessonEvent } = useClassboardQueues(allSchoolTeachers, bookingsForSelectedDate);

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
