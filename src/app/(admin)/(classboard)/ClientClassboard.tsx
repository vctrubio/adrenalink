"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { useTeacherSortOrder } from "@/src/providers/teacher-sort-order-provider";
import { HeaderDatePicker } from "@/src/components/ui/HeaderDatePicker";
import ClassboardContentBoard from "./classboard/ClassboardContentBoard";
import ClassboardStatisticsComponent from "./classboard/ClassboardHeaderStatsGrid";
import { ClassboardStatistics } from "@/backend/ClassboardStatistics";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import ClassboardFooter from "./classboard/ClassboardFooter";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import type { ControllerSettings } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import { getTodayDateString, isDateInRange } from "@/getters/date-getter";
import { calculateTeacherQueues } from "@/getters/teacher-queue-getter";
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
    const { order: teacherSortOrder } = useTeacherSortOrder();

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

    // Step 1: Convert classboard model to bookings array
    const bookingsArray = useMemo(() => {
        console.log("🔄 [DERIVE] Computing bookings array from classboard data");
        const bookings = Object.entries(classboardData).map(([bookingId, bookingData]) => ({
            booking: { ...bookingData.booking, id: bookingId },
            schoolPackage: bookingData.schoolPackage,
            bookingStudents: bookingData.bookingStudents,
            lessons: bookingData.lessons,
        }));
        console.log("📦 [DERIVE] Bookings array:", bookings.length, "bookings");
        return bookings;
    }, [classboardData]);

    // Step 2: Filter bookings by selected date
    const bookingsForSelectedDate = useMemo(() => {
        console.log("🔄 [DERIVE] Filtering bookings for date:", selectedDate);
        const filtered = bookingsArray.filter((booking) => {
            return isDateInRange(selectedDate, booking.booking.dateStart, booking.booking.dateEnd);
        });
        console.log("📅 [DERIVE] Filtered bookings:", filtered.length, "for", selectedDate);
        return filtered;
    }, [bookingsArray, selectedDate]);

    // Step 3: Create draggable bookings structure
    const draggableBookings = useMemo((): DraggableBooking[] => {
        console.log("🔄 [DERIVE] Creating draggable bookings");
        const draggable = bookingsForSelectedDate.map((booking) => {
            const leader = booking.bookingStudents[0]?.student;
            const leaderName = leader ? `${leader.firstName} ${leader.lastName}` : "Unknown Student";

            return {
                bookingId: booking.booking.id,
                leaderStudentName: leaderName,
                capacityStudents: booking.schoolPackage.capacityStudents,
                lessons: booking.lessons.map((lesson) => ({
                    id: lesson.id,
                    teacherUsername: lesson.teacher.username,
                    commissionType: lesson.commission.type as "fixed" | "percentage",
                    commissionCph: parseFloat(lesson.commission.cph),
                    events: lesson.events.map((event) => ({
                        id: event.id,
                        date: event.date,
                        duration: event.duration,
                        location: event.location || "",
                        status: event.status,
                    })),
                })),
            };
        });
        console.log("🎯 [DERIVE] Draggable bookings:", draggable.length);
        return draggable;
    }, [bookingsForSelectedDate]);

    // Step 4: Calculate teacher queues
    const teacherQueues = useMemo(() => {
        console.log("🔄 [DERIVE] Calculating teacher queues");
        console.log("   - Teachers:", allSchoolTeachers.length);
        console.log("   - Bookings:", bookingsForSelectedDate.length);
        console.log("   - Date:", selectedDate);
        console.log("   - Gap minutes:", controller.gapMinutes);

        const queues = calculateTeacherQueues({
            allSchoolTeachers,
            bookingsForSelectedDate,
            selectedDate,
            gapMinutes: controller.gapMinutes,
            optimisticEvents,
            teacherSortOrder,
        });

        console.log("✅ [DERIVE] Teacher queues calculated:", queues.length, "queues");
        queues.forEach((queue, index) => {
            const events = queue.getAllEvents();
            console.log(`   Queue ${index + 1}: ${queue.teacher.username} - ${events.length} events`);
        });

        return queues;
    }, [allSchoolTeachers, bookingsForSelectedDate, selectedDate, controller.gapMinutes, optimisticEvents, teacherSortOrder]);

    // Step 5: Calculate statistics
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
    const handleAddLessonEvent = useCallback(async (booking: DraggableBooking, teacherUsername: string) => {
        console.log("➕ [ClientClassboard] Adding event for:", teacherUsername);
        console.log("   - Booking:", booking.leaderStudentName);
        console.log("   - Date:", selectedDate);

        try {
            // Find the lesson for this teacher
            const lesson = booking.lessons.find((l) => l.teacherUsername === teacherUsername);
            if (!lesson) {
                console.error("❌ No lesson found for teacher:", teacherUsername);
                return;
            }

            // Find the teacher queue to calculate insertion time
            const queue = teacherQueues.find((q) => q.teacher.username === teacherUsername);
            if (!queue) {
                console.error("❌ No queue found for teacher:", teacherUsername);
                return;
            }

            // Find booking data for package info
            const bookingData = bookingsForSelectedDate.find((b) => b.booking.id === booking.bookingId);
            if (!bookingData) {
                console.error("❌ No booking data found");
                return;
            }

            // Calculate insertion time using controller settings
            const { time, duration } = queue.getInsertionTime(
                controller.submitTime,
                booking.capacityStudents,
                controller
            );

            console.log("📍 [ClientClassboard] Calculated insertion:");
            console.log("   - Time:", time);
            console.log("   - Duration:", duration);

            const eventDate = `${selectedDate}T${time}:00`;
            const tempEventId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Create optimistic event
            const optimisticEvent = {
                id: tempEventId,
                lessonId: lesson.id,
                bookingId: booking.bookingId,
                leaderStudentName: booking.leaderStudentName,
                bookingStudents: bookingData.bookingStudents.map((bs) => ({
                    id: bs.student.id,
                    firstName: bs.student.firstName,
                    lastName: bs.student.lastName,
                    passport: bs.student.passport || "",
                    country: bs.student.country || "",
                    phone: bs.student.phone || "",
                })),
                commission: {
                    type: lesson.commissionType,
                    cph: lesson.commissionCph,
                },
                eventData: {
                    date: eventDate,
                    duration: duration,
                    location: controller.location,
                    status: "planned",
                },
                studentData: bookingData.bookingStudents.map((bs) => ({
                    id: bs.student.id,
                    firstName: bs.student.firstName,
                    lastName: bs.student.lastName,
                    passport: bs.student.passport || "",
                    country: bs.student.country || "",
                    phone: bs.student.phone || "",
                })),
                packageData: {
                    pricePerStudent: bookingData.schoolPackage.pricePerStudent,
                    durationMinutes: bookingData.schoolPackage.durationMinutes,
                    description: bookingData.schoolPackage.description,
                    categoryEquipment: bookingData.schoolPackage.categoryEquipment,
                    capacityEquipment: bookingData.schoolPackage.capacityEquipment,
                },
                next: null,
                _teacherUsername: teacherUsername, // For queue identification
            };

            console.log("🎨 [ClientClassboard] Adding optimistic event:", tempEventId);

            // Add optimistic event
            setOptimisticEvents((prev) => [...prev, optimisticEvent]);

            // Safety timeout: remove optimistic event after 10 seconds if not confirmed
            let timeoutId: NodeJS.Timeout | null = setTimeout(() => {
                console.log("⏰ [ClientClassboard] Optimistic event timeout, removing:", tempEventId);
                setOptimisticEvents((prev) => prev.filter((e) => e.id !== tempEventId));
            }, 10000);

            try {
                // Create the event via server action
                const result = await createClassboardEvent(
                    lesson.id,
                    eventDate,
                    duration,
                    controller.location
                );

                if (result.success) {
                    console.log("✅ [ClientClassboard] Event created successfully");
                    // Keep optimistic event until subscription confirms real event exists
                    // handleEventDetected will remove it when the real event arrives
                } else {
                    console.error("❌ [ClientClassboard] Failed to create event:", result.error);
                    // Remove optimistic event on failure
                    if (timeoutId) clearTimeout(timeoutId);
                    setOptimisticEvents((prev) => prev.filter((e) => e.id !== tempEventId));
                }
            } catch (error) {
                console.error("❌ [ClientClassboard] Error adding event:", error);
                // Remove optimistic event on error
                if (timeoutId) clearTimeout(timeoutId);
                setOptimisticEvents((prev) => prev.filter((e) => e.id !== tempEventId));
            }
        } catch (error) {
            console.error("❌ [ClientClassboard] Outer error:", error);
        }
    }, [selectedDate, teacherQueues, controller, bookingsForSelectedDate]);

    // Helper function
    const isLessonTeacher = useCallback((bookingId: string, teacherUsername: string): boolean => {
        const booking = bookingsForSelectedDate.find((b) => b.booking.id === bookingId);
        if (!booking) return false;
        return booking.lessons.some((lesson) => lesson.teacher.username === teacherUsername);
    }, [bookingsForSelectedDate]);

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
                        selectedDate={selectedDate}
                        teacherQueues={teacherQueues}
                        draggedBooking={draggedBooking}
                        isLessonTeacher={isLessonTeacher}
                        controller={controller}
                        onSetDraggedBooking={setDraggedBooking}
                        onAddLessonEvent={handleAddLessonEvent}
                    />
                </div>
            </div>

            {/* Footer */}
            <ClassboardFooter
                controller={controller}
                setController={setController}
                selectedDate={selectedDate}
                teacherQueues={teacherQueues}
            />
        </div>
    );
}
