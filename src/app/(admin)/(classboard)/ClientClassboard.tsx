"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { useBookingsForSelectedDate, type BookingForDate } from "@/src/hooks/useBookingsForSelectedDate";
import { HeaderDatePicker } from "@/src/components/ui/HeaderDatePicker";
import ClassboardContentBoard from "./classboard/ClassboardContentBoard";
import ClassboardStatisticsComponent from "./classboard/ClassboardHeaderStatsGrid";
import { ClassboardStatistics } from "@/backend/ClassboardStatistics";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import ClassboardFooter from "./classboard/ClassboardFooter";
import { deleteAllClassboardEvents, bulkUpdateClassboardEvents } from "@/actions/classboard-action";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import { TeacherQueue, type ControllerSettings, type EventNode } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import { getTodayDateString, isDateInRange } from "@/getters/date-getter";
import { DEFAULT_DURATION_CAP_ONE, DEFAULT_DURATION_CAP_TWO, DEFAULT_DURATION_CAP_THREE } from "@/getters/duration-getter";
import { useAdminClassboardEventListener, useAdminClassboardBookingListener } from "@/supabase/subscribe";
import { getClassboardBookings } from "@/actions/classboard-action";
import { createClassboardEvent } from "@/actions/classboard-action";

const STORAGE_KEY_DATE = "classboard-selected-date";
const STORAGE_KEY_CONTROLLER = "classboard-controller-settings";

const DEFAULT_CONTROLLER: ControllerSettings = {
    submitTime: "09:00",
    location: "Beach",
    durationCapOne: DEFAULT_DURATION_CAP_ONE,
    durationCapTwo: DEFAULT_DURATION_CAP_TWO,
    durationCapThree: DEFAULT_DURATION_CAP_THREE,
    gapMinutes: 0,
    stepDuration: 30,
    minDuration: 60,
    maxDuration: 180,
};

interface ClientClassboardProps {
    data: ClassboardModel;
}

/**
 * ClientClassboard - Main classboard client component
 *
 * OPTIMIZATION STRATEGY (following BillboardClient pattern):
 * - Minimal state: Only selectedDate, draggedBooking, controller
 * - Everything else derived via useMemo
 * - No refreshKey hacks - data flows naturally through subscriptions
 */
export default function ClientClassboard({ data }: ClientClassboardProps) {
    console.log("🎯 [ClientClassboard] Render started");

    // ============================================
    // MINIMAL STATE - Only what user can change
    // ============================================
    const [mounted, setMounted] = useState(false);
    const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
    const [draggedBooking, setDraggedBooking] = useState<DraggableBooking | null>(null);
    const [controller, setController] = useState<ControllerSettings>(DEFAULT_CONTROLLER);
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

    // Step 2: Create draggable bookings structure (minimal - only what's needed for event creation)
    const draggableBookings = useMemo((): DraggableBooking[] => {
        return bookingsForSelectedDate.map((booking) => {
            const leader = booking.bookingStudents[0]?.student;
            const leaderName = leader ? `${leader.firstName} ${leader.lastName}` : "Unknown Student";

            return {
                bookingId: booking.booking.id,
                leaderStudentName: leaderName,
                capacityStudents: booking.schoolPackage.capacityStudents,
                lessons: booking.lessons
                    .filter((lesson) => lesson.teacher?.id) // Skip lessons without teachers
                    .map((lesson) => ({
                        id: lesson.id,
                        teacherId: lesson.teacher?.id,
                    })),
            };
        });
    }, [bookingsForSelectedDate]);

    // Step 3: Create teacher queues directly using TeacherQueue class
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

    // Step 4: Calculate statistics
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
        async (booking: DraggableBooking, lessonId: string) => {
            console.log("➕ [ClientClassboard] Adding event for lesson:--------------------------------------", lessonId);
            console.log("   - Booking:", booking.leaderStudentName, "(ID:", booking.bookingId, ")");
            console.log("   - Date:", selectedDate);

            try {
                // Get teacher ID from lesson in booking
                const lesson = booking.lessons.find((l) => l.id === lessonId);
                if (!lesson) {
                    toast.error("Lesson not found");
                    return;
                }

                const teacherId = lesson.teacherId;
                if (!teacherId) {
                    toast.error("Teacher information missing for this lesson");
                    return;
                }

                // Find the teacher queue
                const queue = teacherQueues.find((q) => q.teacher.id === teacherId);
                if (!queue) {
                    const teacher = allSchoolTeachers.find((t) => t.schema.id === teacherId);
                    const teacherUsername = teacher?.schema.username || "Unknown";
                    toast.error(`Teacher (${teacherUsername}) is not on the board - not available for adding lesson`);
                    return;
                }

                // Get insertion time and duration from queue's smart logic
                const { time, duration } = queue.addEventWithSmartInsertion(
                    lessonId,
                    booking.bookingId,
                    selectedDate,
                    booking.capacityStudents,
                    controller,
                );

                console.log("📍 [ClientClassboard] Calculated insertion - Time:", time, "Duration:", duration);

                const eventDate = `${selectedDate}T${time}:00`;
                const tempEventId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // Create optimistic event
                const optimisticEvent = {
                    id: tempEventId,
                    lessonId,
                    bookingId: booking.bookingId,
                    eventData: {
                        date: eventDate,
                        duration,
                        location: controller.location,
                        status: "planned" as const,
                    },
                    next: null,
                    _teacherId: teacherId,
                };

                console.log("🎨 [ClientClassboard] Adding optimistic event:", tempEventId);
                setOptimisticEvents((prev) => [...prev, optimisticEvent]);

                // Safety timeout: remove optimistic event after 10 seconds if not confirmed
                const timeoutId: NodeJS.Timeout | null = setTimeout(() => {
                    console.log("⏰ [ClientClassboard] Optimistic event timeout, removing:", tempEventId);
                    setOptimisticEvents((prev) => prev.filter((e) => e.id !== tempEventId));
                }, 10000);

                try {
                    // Create the event via server action
                    const result = await createClassboardEvent(lessonId, eventDate, duration, controller.location);

                    if (result.success) {
                        console.log("✅ [ClientClassboard] Event created successfully");
                    } else {
                        console.error("❌ [ClientClassboard] Failed to create event:", result.error);
                        if (timeoutId) clearTimeout(timeoutId);
                        setOptimisticEvents((prev) => prev.filter((e) => e.id !== tempEventId));
                    }
                } catch (error) {
                    console.error("❌ [ClientClassboard] Error adding event:", error);
                    if (timeoutId) clearTimeout(timeoutId);
                    setOptimisticEvents((prev) => prev.filter((e) => e.id !== tempEventId));
                }
            } catch (error) {
                console.error("❌ [ClientClassboard] Outer error:", error);
            }
        },
        [selectedDate, teacherQueues, controller, allSchoolTeachers],
    );

    // ============================================
    // LIFECYCLE - Storage sync
    // ============================================
    useEffect(() => {
        console.log("🔧 [LIFECYCLE] Initializing from localStorage");
        const storedDate = localStorage.getItem(STORAGE_KEY_DATE);
        if (storedDate) {
            console.log("📅 [LIFECYCLE] Restored date:", storedDate);
            setSelectedDate(storedDate);
        }

        const storedController = localStorage.getItem(STORAGE_KEY_CONTROLLER);
        if (storedController) {
            try {
                const parsed = JSON.parse(storedController) as ControllerSettings;
                console.log("🎮 [LIFECYCLE] Restored controller:", parsed);
                setController(parsed);
            } catch (error) {
                console.error("❌ [LIFECYCLE] Failed to parse controller settings:", error);
            }
        }

        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        console.log("💾 [LIFECYCLE] Saving date to localStorage:", selectedDate);
        localStorage.setItem(STORAGE_KEY_DATE, selectedDate);
    }, [selectedDate, mounted]);

    useEffect(() => {
        if (!mounted) return;
        console.log("💾 [LIFECYCLE] Saving controller to localStorage");
        localStorage.setItem(STORAGE_KEY_CONTROLLER, JSON.stringify(controller));
    }, [controller, mounted]);

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
                        draggableBookings={draggableBookings}
                        classboardData={classboardData}
                        teacherQueues={teacherQueues}
                        draggedBooking={draggedBooking}
                        controller={controller}
                        onSetDraggedBooking={setDraggedBooking}
                        onAddLessonEvent={handleAddLessonEvent}
                    />
                </div>
            </div>

            {/* Footer */}
            <ClassboardFooter controller={controller} setController={setController} selectedDate={selectedDate} teacherQueues={teacherQueues} />
        </div>
    );
}
