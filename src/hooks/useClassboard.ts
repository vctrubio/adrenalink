import { useCallback, useEffect, useMemo, useState } from "react";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import { TeacherQueue, type EventNode, type ControllerSettings } from "@/backend/TeacherQueue";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import { ClassboardStats } from "@/backend/ClassboardStats";
import { getTodayDateString, isDateInRange } from "@/getters/date-getter";
import { DEFAULT_DURATION_CAP_ONE, DEFAULT_DURATION_CAP_TWO, DEFAULT_DURATION_CAP_THREE } from "@/getters/duration-getter";
import { calculateTeacherStatsFromEvents } from "@/getters/classboard-getter";
import { useAdminClassboardEventListener, useAdminClassboardBookingListener } from "@/supabase/subscribe";
import { getClassboardBookings } from "@/actions/classboard-action";
import { useSchoolTeachers } from "./useSchoolTeachers";

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
};

export function useClassboard(initialData: ClassboardModel) {
    // Initialize with today's date (server/client match)
    const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
    const [searchQuery, setSearchQuery] = useState("");
    const [classboardData, setClassboardData] = useState<ClassboardModel>(initialData);

    // Get all active teachers from the school
    const { teachers: allSchoolTeachers } = useSchoolTeachers();

    // Load from localStorage after hydration
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY_DATE);
        if (stored) {
            setSelectedDate(stored);
        }
    }, []);

    // Save selected date to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_DATE, selectedDate);
    }, [selectedDate]);

    // Get school ID from first booking
    const schoolId = useMemo(() => {
        const firstBooking = Object.values(classboardData)[0];
        const id = firstBooking?.booking.schoolId || "";
        // console.log("DEV:LISTENER::: 📍 Extracted schoolId:", id);
        // console.log("DEV:LISTENER::: 📊 First booking:", firstBooking?.booking);
        return id;
    }, [classboardData]);

    // Setup real-time event listener (detects when events are created/updated)
    const handleEventDetected = useCallback((newData: ClassboardModel) => {
        setClassboardData(newData);
    }, []);

    useAdminClassboardEventListener({
        schoolId,
        onEventDetected: handleEventDetected,
    });

    // Setup real-time booking listener
    const [onNewBooking, setOnNewBooking] = useState<(() => void) | null>(null);

    const handleNewBookingDetected = useCallback(async () => {
        try {
            const result = await getClassboardBookings();
            if (result.success) {
                setClassboardData(result.data);
            } else {
                console.error("Failed to refetch classboard data:", result.error);
            }
        } catch (error) {
            console.error("Error refetching classboard data:", error);
        }
    }, []);

    const handleBookingDetected = useCallback(async () => {
        await handleNewBookingDetected();
        if (onNewBooking) {
            onNewBooking();
        }
    }, [handleNewBookingDetected, onNewBooking]);

    useAdminClassboardBookingListener({
        schoolId,
        onNewBooking: handleBookingDetected,
    });

    const [controller, setController] = useState<ControllerSettings>(DEFAULT_CONTROLLER);
    const [draggedBooking, setDraggedBooking] = useState<DraggableBooking | null>(null);

    // Load controller settings from localStorage after hydration
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY_CONTROLLER);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as ControllerSettings;
                setController(parsed);
            } catch (error) {
                console.error("Failed to parse controller settings from localStorage:", error);
                setController(DEFAULT_CONTROLLER);
            }
        }
    }, []);

    // Save controller settings to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_CONTROLLER, JSON.stringify(controller));
    }, [controller]);

    const bookingsArray = useMemo(() => {
        const bookings = Object.entries(classboardData).map(([bookingId, bookingData]) => ({
            booking: { ...bookingData.booking, id: bookingId },
            schoolPackage: bookingData.schoolPackage,
            bookingStudents: bookingData.bookingStudents,
            lessons: bookingData.lessons,
        }));
        return bookings;
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
        const filtered = filteredBookingsBySearch.filter((booking) => {
            const inRange = isDateInRange(selectedDate, booking.booking.dateStart, booking.booking.dateEnd);
            return inRange;
        });
        return filtered;
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

    const availableBookings = useMemo(() => {
        const available = draggableBookings.filter((booking) => {
            const hasEventOnSelectedDate = bookingsForSelectedDate
                .find((b) => b.booking.id === booking.bookingId)
                ?.lessons.some((lesson) =>
                    lesson.events.some((event) => {
                        const eventDate = new Date(event.date).toISOString().split("T")[0];
                        return eventDate === selectedDate;
                    }),
                );
            const isAvailable = !hasEventOnSelectedDate;
            return isAvailable;
        });
        return available;
    }, [draggableBookings, bookingsForSelectedDate, selectedDate]);

    const teacherQueues = useMemo((): TeacherQueue[] => {
        const teacherMap = new Map<string, TeacherQueue>();

        // First, initialize queues for ALL active teachers from the school
        allSchoolTeachers.forEach((teacher) => {
            const teacherUsername = teacher.schema.username;
            const teacherName = `${teacher.schema.firstName} ${teacher.schema.lastName}`;

            if (!teacherMap.has(teacherUsername)) {
                const queue = new TeacherQueue({ username: teacherUsername, name: teacherName });
                teacherMap.set(teacherUsername, queue);
            }
        });

        // Then, populate events from bookings for the selected date
        bookingsForSelectedDate.forEach((booking) => {
            booking.lessons.forEach((lesson) => {
                if (lesson.status === "rest") {
                    return;
                }

                // Skip lessons without commission (legacy data)
                if (!lesson.commission) {
                    console.warn(`Lesson ${lesson.id} missing commission (legacy data), skipping...`);
                    return;
                }

                const teacherUsername = lesson.teacher.username;
                const teacherName = `${lesson.teacher.firstName} ${lesson.teacher.lastName}`;

                // Create queue if teacher not in allSchoolTeachers (shouldn't happen but safety)
                if (!teacherMap.has(teacherUsername)) {
                    const queue = new TeacherQueue({ username: teacherUsername, name: teacherName });
                    teacherMap.set(teacherUsername, queue);
                }

                const queue = teacherMap.get(teacherUsername)!;

                // Collect all events for this date
                const eventsForDate: EventNode[] = [];

                lesson.events.forEach((event) => {
                    // Convert UTC to local timezone and extract date (YYYY-MM-DD)
                    const eventDateObj = new Date(event.date);
                    const year = eventDateObj.getFullYear();
                    const month = String(eventDateObj.getMonth() + 1).padStart(2, "0");
                    const day = String(eventDateObj.getDate()).padStart(2, "0");
                    const eventDate = `${year}-${month}-${day}`;

                    if (eventDate === selectedDate) {
                        const studentData = booking.bookingStudents.map((bs) => ({
                            id: bs.student.id,
                            firstName: bs.student.firstName,
                            lastName: bs.student.lastName,
                            passport: bs.student.passport || "",
                            country: bs.student.country || "",
                            phone: bs.student.phone || "",
                        }));

                        const eventNode: EventNode = {
                            id: event.id,
                            lessonId: lesson.id,
                            bookingId: booking.booking.id,
                            commission: {
                                type: lesson.commission.type as "fixed" | "percentage",
                                cph: parseFloat(lesson.commission.cph),
                            },
                            eventData: {
                                date: event.date,
                                duration: event.duration,
                                location: event.location || "",
                                status: event.status,
                            },
                            studentData,
                            packageData: {
                                pricePerStudent: booking.schoolPackage.pricePerStudent,
                                durationMinutes: booking.schoolPackage.durationMinutes,
                                description: booking.schoolPackage.description,
                                categoryEquipment: booking.schoolPackage.categoryEquipment,
                                capacityEquipment: booking.schoolPackage.capacityEquipment,
                            },
                            next: null,
                        };

                        eventsForDate.push(eventNode);
                    }
                });

                // Sort events by date and rebuild queue to ensure chronological order
                eventsForDate.sort((a, b) => new Date(a.eventData.date).getTime() - new Date(b.eventData.date).getTime());
                eventsForDate.forEach((eventNode) => {
                    queue.addToQueueInChronologicalOrder(eventNode, controller.gapMinutes);
                });
            });
        });

        const queues = Array.from(teacherMap.values());
        return queues;
    }, [bookingsForSelectedDate, selectedDate, allSchoolTeachers, controller.gapMinutes]);

    const teacherLessonCounts = useMemo(() => {
        const counts = new Map<string, number>();

        bookingsForSelectedDate.forEach((booking) => {
            booking.lessons.forEach((lesson) => {
                if (lesson.status === "rest") return;

                const teacherUsername = lesson.teacher.username;
                counts.set(teacherUsername, (counts.get(teacherUsername) || 0) + 1);
            });
        });

        return counts;
    }, [bookingsForSelectedDate]);

    const classboardStats = useMemo(() => {
        const teacherStats = teacherQueues.map((queue) => {
            const lessonCount = teacherLessonCounts.get(queue.teacher.username) || 0;
            const events = queue.getAllEvents();

            return calculateTeacherStatsFromEvents(queue.teacher.username, events, lessonCount);
        });

        return new ClassboardStats(teacherStats);
    }, [teacherQueues, teacherLessonCounts]);

    const isLessonTeacher = (bookingId: string, teacherUsername: string): boolean => {
        const booking = bookingsForSelectedDate.find((b) => b.booking.id === bookingId);
        if (!booking) return false;

        return booking.lessons.some((lesson) => lesson.teacher.username === teacherUsername);
    };

    return {
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
        availableBookings,
        teacherQueues,
        classboardStats,
        isLessonTeacher,
        setOnNewBooking,
    };
}
