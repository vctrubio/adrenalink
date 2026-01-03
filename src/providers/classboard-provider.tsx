"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import type { ClassboardModel, ClassboardData } from "@/backend/models/ClassboardModel";
import type { ControllerSettings, TeacherQueue } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import { TeacherQueue as TeacherQueueClass } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import { getTodayDateString } from "@/getters/date-getter";
import { DEFAULT_DURATION_CAP_ONE, DEFAULT_DURATION_CAP_TWO, DEFAULT_DURATION_CAP_THREE } from "@/getters/duration-getter";
import { isDateInRange } from "@/getters/date-getter";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { createClassboardEvent } from "@/actions/classboard-action";
import { GlobalFlag } from "@/backend/models/GlobalFlag";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { EventNode } from "@/src/app/(admin)/(classboard)/TeacherQueue";

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

export interface OptimisticEvent {
    id: string;
    lessonId: string;
    teacherId: string;
    bookingId: string;
    bookingLeaderName: string;
    bookingStudents: {
        id: string;
        firstName: string;
        lastName: string;
        passport: string;
        country: string;
        phone: string;
    }[];
    capacityStudents: number;
    pricePerStudent: number;
    categoryEquipment: string;
    capacityEquipment: number;
    commission: {
        type: string;
        cph: number;
    };
    date: string;
    duration: number;
    location: string;
}

interface ClassboardContextType {
    // Data
    bookingsForSelectedDate: ClassboardData[];
    teacherQueues: TeacherQueue[];
    mounted: boolean;

    // Date selection
    selectedDate: string;
    setSelectedDate: (date: string) => void;

    // Controller settings
    controller: ControllerSettings;
    setController: (controller: ControllerSettings) => void;

    // Drag state
    draggedBooking: DraggableBooking | null;
    setDraggedBooking: (booking: DraggableBooking | null) => void;

    // Event actions
    addLessonEvent: (bookingData: ClassboardData, lessonId: string) => Promise<void>;

    // Optimistic updates
    optimisticEvents: Map<string, OptimisticEvent>;
    clearOptimisticEvents: () => void;

    // Global state
    globalFlag: GlobalFlag;

    // Internal (only for ClassboardRealtimeSync)
    setClassboardModel: (model: ClassboardModel) => void;
}

function createEventNode(event: any, lesson: any, booking: ClassboardData): EventNode {
    return {
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
}

export function optimisticEventToNode(event: OptimisticEvent): EventNode {
    return {
        id: event.id,
        lessonId: event.lessonId,
        bookingId: event.bookingId,
        bookingLeaderName: event.bookingLeaderName,
        bookingStudents: event.bookingStudents,
        capacityStudents: event.capacityStudents,
        pricePerStudent: event.pricePerStudent,
        categoryEquipment: event.categoryEquipment,
        capacityEquipment: event.capacityEquipment,
        commission: event.commission,
        eventData: {
            date: event.date,
            duration: event.duration,
            location: event.location,
            status: "planned",
        },
        next: null,
    };
}

const ClassboardContext = createContext<ClassboardContextType | undefined>(undefined);

interface ClassboardProviderProps {
    children: ReactNode;
    initialClassboardModel: ClassboardModel;
}

export function ClassboardProvider({ children, initialClassboardModel }: ClassboardProviderProps) {
    const { teachers: allSchoolTeachers } = useSchoolTeachers();

    // Core state
    const [mounted, setMounted] = useState(false);
    const [classboardModel, setClassboardModel] = useState<ClassboardModel>(initialClassboardModel);
    const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
    const [controller, setController] = useState<ControllerSettings>(DEFAULT_CONTROLLER);
    const [draggedBooking, setDraggedBooking] = useState<DraggableBooking | null>(null);
    const [optimisticEvents, setOptimisticEvents] = useState<Map<string, OptimisticEvent>>(new Map());
    const [flagTick, setFlagTick] = useState(0);

    // Filter bookings by selected date
    const bookingsForSelectedDate = useMemo(() => {
        return classboardModel.filter((booking) =>
            isDateInRange(selectedDate, booking.booking.dateStart, booking.booking.dateEnd)
        );
    }, [classboardModel, selectedDate]);

    // Build teacher queues from bookings
    const teacherQueues = useMemo(() => {
        const queues = new Map<string, TeacherQueueClass>();
        const activeTeachers = allSchoolTeachers.filter((teacher) => teacher.schema.active);

        activeTeachers.forEach((teacher) => {
            queues.set(
                teacher.schema.id,
                new TeacherQueueClass({
                    id: teacher.schema.id,
                    username: teacher.schema.username,
                }),
            );
        });

        bookingsForSelectedDate.forEach((booking) => {
            booking.lessons.forEach((lesson) => {
                const teacherId = lesson.teacher?.id;
                if (!teacherId) return;

                const queue = queues.get(teacherId);
                if (!queue) return;

                const sortedEvents = (lesson.events || []).sort((a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );

                sortedEvents.forEach((event) => {
                    const eventNode = createEventNode(event, lesson, booking);
                    queue.constructEvents(eventNode);
                });
            });
        });

        return activeTeachers.map((teacher) => queues.get(teacher.schema.id)).filter((queue): queue is TeacherQueueClass => queue !== undefined);
    }, [allSchoolTeachers, bookingsForSelectedDate]);

    // Global flag for adjustment mode
    const globalFlag = useMemo(() => {
        return new GlobalFlag(teacherQueues, controller, () => setFlagTick(t => t + 1));
    }, []);

    useEffect(() => {
        globalFlag.updateTeacherQueues(teacherQueues);
        globalFlag.updateController(controller);
    }, [teacherQueues, controller, globalFlag]);

    // Add lesson event
    const addLessonEvent = useCallback(
        async (bookingData: ClassboardData, lessonId: string) => {
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            try {
                const lesson = bookingData.lessons.find((l) => l.id === lessonId);
                if (!lesson?.teacher) {
                    console.error("❌ Lesson or teacher not found");
                    toast.error("Teacher not found for this lesson");
                    return;
                }

                const queue = teacherQueues.find((q) => q.teacher.id === lesson.teacher.id);
                if (!queue) {
                    console.error("❌ Teacher not on board:", lesson.teacher.username);
                    toast.error(`${lesson.teacher.username} is not on board today`);
                    return;
                }

                const capacityStudents = bookingData.schoolPackage.capacityStudents;
                const duration = capacityStudents === 1 ? controller.durationCapOne : capacityStudents === 2 ? controller.durationCapTwo : controller.durationCapThree;
                const slotTime = queue.getNextAvailableSlot(controller.submitTime, duration, controller.gapMinutes);
                const eventDate = `${selectedDate}T${slotTime}:00`;

                const optimisticEvent: OptimisticEvent = {
                    id: tempId,
                    lessonId,
                    teacherId: lesson.teacher.id,
                    bookingId: bookingData.booking.id,
                    bookingLeaderName: bookingData.booking.leaderStudentName,
                    bookingStudents: bookingData.bookingStudents.map((bs) => ({
                        id: bs.student.id,
                        firstName: bs.student.firstName,
                        lastName: bs.student.lastName,
                        passport: bs.student.passport,
                        country: bs.student.country,
                        phone: bs.student.phone,
                    })),
                    capacityStudents: bookingData.schoolPackage.capacityStudents,
                    pricePerStudent: bookingData.schoolPackage.pricePerStudent,
                    categoryEquipment: bookingData.schoolPackage.categoryEquipment,
                    capacityEquipment: bookingData.schoolPackage.capacityEquipment,
                    commission: {
                        type: lesson.commission.type,
                        cph: parseFloat(lesson.commission.cph),
                    },
                    date: eventDate,
                    duration,
                    location: controller.location,
                };

                setOptimisticEvents((prev) => new Map(prev).set(tempId, optimisticEvent));

                const result = await createClassboardEvent(lessonId, eventDate, duration, controller.location);

                if (!result.success) {
                    console.error("❌ Failed to create event:", result.error);
                    setOptimisticEvents((prev) => {
                        const updated = new Map(prev);
                        updated.delete(tempId);
                        return updated;
                    });
                    toast.error("Failed to create event");
                    return;
                }

                console.log("✅ Event created, waiting for subscription");
            } catch (error) {
                console.error("❌ Error adding event:", error);
                setOptimisticEvents((prev) => {
                    const updated = new Map(prev);
                    updated.delete(tempId);
                    return updated;
                });
                toast.error("Error creating event");
            }
        },
        [selectedDate, teacherQueues, controller],
    );

    // Clear optimistic events
    const clearOptimisticEvents = useCallback(() => {
        setOptimisticEvents(new Map());
    }, []);

    // Initialize from localStorage on mount
    useEffect(() => {
        const storedDate = localStorage.getItem(STORAGE_KEY_DATE);
        if (storedDate) {
            setSelectedDate(storedDate);
        }

        const storedController = localStorage.getItem(STORAGE_KEY_CONTROLLER);
        if (storedController) {
            try {
                const parsed = JSON.parse(storedController) as ControllerSettings;
                setController(parsed);
            } catch (error) {
                console.error("❌ [ClassboardProvider] Failed to parse controller settings:", error);
            }
        }

        setMounted(true);
    }, []);

    // Persist selectedDate to localStorage
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem(STORAGE_KEY_DATE, selectedDate);
    }, [selectedDate, mounted]);

    // Persist controller to localStorage
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem(STORAGE_KEY_CONTROLLER, JSON.stringify(controller));
    }, [controller, mounted]);

    const value: ClassboardContextType = {
        bookingsForSelectedDate,
        teacherQueues,
        mounted,
        selectedDate,
        setSelectedDate,
        controller,
        setController,
        draggedBooking,
        setDraggedBooking,
        addLessonEvent,
        optimisticEvents,
        clearOptimisticEvents,
        globalFlag,
        setClassboardModel,
    };

    return (
        <ClassboardContext.Provider value={value}>
            {children}
        </ClassboardContext.Provider>
    );
}

export function useClassboardContext(): ClassboardContextType {
    const context = useContext(ClassboardContext);
    if (!context) {
        throw new Error("useClassboardContext must be used within ClassboardProvider");
    }
    return context;
}
