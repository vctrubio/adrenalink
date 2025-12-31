import { useCallback, useEffect, useMemo, useState } from "react";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import { type EventNode, type ControllerSettings } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import { getTodayDateString, isDateInRange } from "@/getters/date-getter";
import { DEFAULT_DURATION_CAP_ONE, DEFAULT_DURATION_CAP_TWO, DEFAULT_DURATION_CAP_THREE } from "@/getters/duration-getter";
import { calculateTeacherStatsFromEvents } from "@/getters/classboard-getter";
import { useAdminClassboardEventListener, useAdminClassboardBookingListener } from "@/supabase/subscribe";
import { getClassboardBookings } from "@/actions/classboard-action";
import { useSchoolTeachers } from "./useSchoolTeachers";
import { useTeacherSortOrder } from "@/src/providers/teacher-sort-order-provider";
import { calculateTeacherQueues } from "@/getters/teacher-queue-getter";

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

export function useClassboard(initialData: ClassboardModel) {
    const [mounted, setMounted] = useState(false);
    const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
    const [searchQuery, setSearchQuery] = useState("");
    const [classboardData, setClassboardData] = useState<ClassboardModel>(initialData);
    
    // Optimistic UI state
    const [optimisticEvents, setOptimisticEvents] = useState<EventNode[]>([]);

    const { teachers: allSchoolTeachers } = useSchoolTeachers();
    const { order: teacherSortOrder } = useTeacherSortOrder();

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY_DATE);
        if (stored) setSelectedDate(stored);
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem(STORAGE_KEY_DATE, selectedDate);
    }, [selectedDate, mounted]);

    const schoolId = useMemo(() => {
        const firstBooking = Object.values(classboardData)[0];
        return firstBooking?.booking.schoolId || "";
    }, [classboardData]);

    const handleEventDetected = useCallback((newData: ClassboardModel) => {
        setClassboardData(newData);
        setOptimisticEvents([]); 
    }, []);

    useAdminClassboardEventListener({
        schoolId,
        onEventDetected: handleEventDetected,
    });

    const handleNewBookingDetected = useCallback(async () => {
        try {
            const result = await getClassboardBookings();
            if (result.success) setClassboardData(result.data);
        } catch (error) {
            console.error("Error refetching classboard data:", error);
        }
    }, []);

    useAdminClassboardBookingListener({
        schoolId,
        onNewBooking: handleNewBookingDetected,
    });

    const [controller, setController] = useState<ControllerSettings>(DEFAULT_CONTROLLER);
    const [draggedBooking, setDraggedBooking] = useState<DraggableBooking | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY_CONTROLLER);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as ControllerSettings;
                setController(parsed);
            } catch (error) {
                console.error("Failed to parse controller settings:", error);
                setController(DEFAULT_CONTROLLER);
            }
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem(STORAGE_KEY_CONTROLLER, JSON.stringify(controller));
    }, [controller, mounted]);

    const bookingsArray = useMemo(() => {
        return Object.entries(classboardData).map(([bookingId, bookingData]) => ({
            booking: { ...bookingData.booking, id: bookingId },
            schoolPackage: bookingData.schoolPackage,
            bookingStudents: bookingData.bookingStudents,
            lessons: bookingData.lessons,
        }));
    }, [classboardData]);

    const filteredBookingsBySearch = useMemo(() => {
        if (!searchQuery.trim()) return bookingsArray;
        const query = searchQuery.toLowerCase().trim();
        return bookingsArray.filter((booking) => {
            const studentNames = booking.bookingStudents.map((bs) => `${bs.student.firstName} ${bs.student.lastName}`.toLowerCase()).join(" ");
            return studentNames.includes(query);
        });
    }, [bookingsArray, searchQuery]);

    const bookingsForSelectedDate = useMemo(() => {
        return filteredBookingsBySearch.filter((booking) => {
            return isDateInRange(selectedDate, booking.booking.dateStart, booking.booking.dateEnd);
        });
    }, [filteredBookingsBySearch, selectedDate]);

    const draggableBookings = useMemo((): DraggableBooking[] => {
        return bookingsForSelectedDate.map((booking) => ({
            bookingId: booking.booking.id,
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
        }));
    }, [bookingsForSelectedDate]);

    const teacherQueues = useMemo(() => {
        return calculateTeacherQueues({
            allSchoolTeachers,
            bookingsForSelectedDate,
            selectedDate,
            gapMinutes: controller.gapMinutes,
            optimisticEvents,
            teacherSortOrder
        });
    }, [allSchoolTeachers, bookingsForSelectedDate, selectedDate, controller.gapMinutes, optimisticEvents, teacherSortOrder]);

    const teacherLessonCounts = useMemo(() => {
        const counts = new Map<string, number>();
        bookingsForSelectedDate.forEach((booking) => {
            booking.lessons.forEach((lesson) => {
                if (lesson.status === "rest") return;
                counts.set(lesson.teacher.username, (counts.get(lesson.teacher.username) || 0) + 1);
            });
        });
        return counts;
    }, [bookingsForSelectedDate]);

    const isLessonTeacher = (bookingId: string, teacherUsername: string): boolean => {
        const booking = bookingsForSelectedDate.find((b) => b.booking.id === bookingId);
        if (!booking) return false;
        return booking.lessons.some((lesson) => lesson.teacher.username === teacherUsername);
    };

    const addOptimisticEvent = useCallback((event: EventNode, teacherUsername: string) => {
        const eventWithMeta = { ...event, _teacherUsername: teacherUsername };
        setOptimisticEvents(prev => [...prev, eventWithMeta]);
    }, []);

    return {
        mounted,
        selectedDate,
        setSelectedDate,
        searchQuery,
        setSearchQuery,
        controller,
        setController,
        draggedBooking,
        setDraggedBooking,
        classboardData,
        setClassboardData,
        draggableBookings,
        teacherQueues,
        isLessonTeacher,
        addOptimisticEvent,
    };
}
