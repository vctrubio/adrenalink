import { getHMDuration } from "@/getters/duration-getter";
import { transformEventsToRows } from "@/getters/event-getter";
import { calculateLessonRevenue, calculateCommission } from "@/getters/commission-calculator";
import type { EventData } from "@/types/booking-lesson-event";
import type { TimelineEvent } from "@/src/components/timeline";
import type { TransactionEventData } from "@/types/transaction-event";

/**
 * Centralized Event Model - Single Source of Truth
 * All events contain the same data structure, regardless of how they're grouped
 */
export interface EventModel {
    // Event core data
    eventId: string;
    date: Date;
    time: string;
    dateLabel: string;
    dayOfWeek: string;
    duration: number;
    durationLabel: string;
    location: string;
    eventStatus: string;

    // Lesson context
    lessonId: string;
    lessonStatus: string;
    commissionType: "fixed" | "percentage";
    commissionCph: number;

    // Booking context
    bookingId: string;
    leaderName: string;
    dateStart: string;
    dateEnd: string;
    bookingStatus: string;

    // School package context
    equipmentCategory?: string;
    capacityEquipment?: number;
    capacityStudents?: number;
    packageDurationMinutes: number;
    pricePerStudent: number;

    // Teacher context
    teacherId: string;
    teacherName: string;
    teacherUsername: string;

    // Students
    bookingStudents: { id: string; firstName: string; lastName: string }[];

    // Equipment
    equipments?: { id: string; brand: string; model: string; size: number | null; sku?: string; color?: string }[];

    // Financials (calculated)
    teacherEarning: number;
    schoolRevenue: number;
    totalRevenue: number;
}

/**
 * Lesson Group - Groups events by lesson
 */
export interface LessonGroup {
    lessonId: string;
    bookingId: string;
    leaderName: string;
    dateStart: string;
    dateEnd: string;
    lessonStatus: string;
    bookingStatus: string;
    commissionType: "fixed" | "percentage";
    cph: number;
    equipmentCategory: string;
    studentCapacity: number;
    
    // Aggregated stats
    totalDuration: number;
    totalHours: number;
    totalEarning: number;
    eventCount: number;
    
    // Events in this lesson
    events: EventModel[];
}

/**
 * Commission Group - Groups lessons by commission type + cph
 */
export interface CommissionGroup {
    type: "fixed" | "percentage";
    cph: number;
    hours: number;
    earning: number;
    lessonCount: number;
    lessons: LessonGroup[];
}

/**
 * Teacher Group - Groups events by teacher
 */
export interface TeacherGroup {
    teacherId: string;
    teacherName: string;
    teacherUsername: string;
    totalDuration: number;
    totalHours: number;
    totalEarning: number;
    eventCount: number;
    events: EventModel[];
}

/**
 * Process raw lesson data and create a flat list of events (single source of truth)
 */
export function buildEventModels(
    lessons: any[],
    teacher?: { id: string; first_name?: string; username: string },
): EventModel[] {
    const events: EventModel[] = [];

    for (const lesson of lessons) {
        const rawEvents = (lesson.event || []) as EventData[];
        const booking = lesson.booking;
        const commission = lesson.teacher_commission;
        const school_package = booking?.school_package;

        const cph = parseFloat(commission?.cph || "0");
        const commissionType = (commission?.commission_type as "fixed" | "percentage") || "fixed";
        const lessonTeacher = lesson.teacher || teacher;

        const eventRows = transformEventsToRows(rawEvents as any);

        for (let i = 0; i < eventRows.length; i++) {
            const eventRow = eventRows[i];
            const rawEvent = rawEvents[i];

            // Extract equipment from equipment_event relation
            const equipments = rawEvent?.equipment_event?.map((ee: any) => ({
                id: ee.equipment?.id,
                brand: ee.equipment?.brand,
                model: ee.equipment?.model,
                size: ee.equipment?.size ? parseFloat(ee.equipment.size) : null,
                sku: ee.equipment?.sku,
                color: ee.equipment?.color,
            })).filter((eq: any) => eq.id) || [];

            // Calculate financials
            const studentCount = school_package?.capacity_students || 1;
            const pricePerStudent = school_package?.price_per_student || 0;
            const packageDurationMinutes = school_package?.duration_minutes || 60;

            const eventRevenue = calculateLessonRevenue(pricePerStudent, studentCount, eventRow.duration, packageDurationMinutes);
            const eventCommission = calculateCommission(
                eventRow.duration,
                { type: commissionType, cph },
                eventRevenue,
                packageDurationMinutes,
            );
            const eventEarning = eventCommission.earned;
            const schoolRevenue = eventRevenue - eventEarning;

            // Extract students
            const bookingStudents = (booking?.students || []).map((student: any) => ({
                id: student.id,
                firstName: student.first_name || student.firstName || "",
                lastName: student.last_name || student.lastName || "",
            }));

            events.push({
                eventId: eventRow.eventId,
                date: eventRow.date,
                time: eventRow.time,
                dateLabel: eventRow.dateLabel,
                dayOfWeek: eventRow.dayOfWeek || "",
                duration: eventRow.duration,
                durationLabel: getHMDuration(eventRow.duration),
                location: eventRow.location,
                eventStatus: eventRow.status,
                lessonId: lesson.id,
                lessonStatus: lesson.status,
                commissionType,
                commissionCph: cph,
                bookingId: booking?.id || "",
                leaderName: booking?.leader_student_name || "Unknown",
                dateStart: booking?.date_start || "",
                dateEnd: booking?.date_end || "",
                bookingStatus: booking?.status || "unknown",
                equipmentCategory: school_package?.category_equipment,
                capacityEquipment: school_package?.capacity_equipment,
                capacityStudents: school_package?.capacity_students,
                packageDurationMinutes,
                pricePerStudent,
                teacherId: lessonTeacher?.id || "",
                teacherName: lessonTeacher?.first_name || "Unknown",
                teacherUsername: lessonTeacher?.username || "unknown",
                bookingStudents,
                equipments: equipments.length > 0 ? equipments : undefined,
                teacherEarning: eventEarning,
                schoolRevenue,
                totalRevenue: eventRevenue,
            });
        }
    }

    return events;
}

/**
 * Group events by lesson
 */
export function groupEventsByLesson(events: EventModel[]): LessonGroup[] {
    const lessonMap = new Map<string, LessonGroup>();

    for (const event of events) {
        if (!lessonMap.has(event.lessonId)) {
            lessonMap.set(event.lessonId, {
                lessonId: event.lessonId,
                bookingId: event.bookingId,
                leaderName: event.leaderName,
                dateStart: event.dateStart,
                dateEnd: event.dateEnd,
                lessonStatus: event.lessonStatus,
                bookingStatus: event.bookingStatus,
                commissionType: event.commissionType,
                cph: event.commissionCph,
                equipmentCategory: event.equipmentCategory || "",
                studentCapacity: event.capacityStudents || 0,
                totalDuration: 0,
                totalHours: 0,
                totalEarning: 0,
                eventCount: 0,
                events: [],
            });
        }

        const lesson = lessonMap.get(event.lessonId)!;
        lesson.events.push(event);
        lesson.totalDuration += event.duration;
        lesson.totalHours += event.duration / 60;
        lesson.totalEarning += event.teacherEarning;
        lesson.eventCount += 1;
    }

    return Array.from(lessonMap.values());
}

/**
 * Group events by teacher
 */
export function groupEventsByTeacher(events: EventModel[]): TeacherGroup[] {
    const teacherMap = new Map<string, TeacherGroup>();

    for (const event of events) {
        if (!teacherMap.has(event.teacherId)) {
            teacherMap.set(event.teacherId, {
                teacherId: event.teacherId,
                teacherName: event.teacherName,
                teacherUsername: event.teacherUsername,
                totalDuration: 0,
                totalHours: 0,
                totalEarning: 0,
                eventCount: 0,
                events: [],
            });
        }

        const teacher = teacherMap.get(event.teacherId)!;
        teacher.events.push(event);
        teacher.totalDuration += event.duration;
        teacher.totalHours += event.duration / 60;
        teacher.totalEarning += event.teacherEarning;
        teacher.eventCount += 1;
    }

    return Array.from(teacherMap.values());
}

/**
 * Group lessons by commission (type + cph)
 */
export function groupLessonsByCommission(lessons: LessonGroup[]): CommissionGroup[] {
    const commissionMap = new Map<string, CommissionGroup>();

    for (const lesson of lessons) {
        const key = `${lesson.commissionType}-${lesson.cph}`;
        
        if (!commissionMap.has(key)) {
            commissionMap.set(key, {
                type: lesson.commissionType,
                cph: lesson.cph,
                hours: 0,
                earning: 0,
                lessonCount: 0,
                lessons: [],
            });
        }

        const commission = commissionMap.get(key)!;
        commission.lessons.push(lesson);
        commission.hours += lesson.totalHours;
        commission.earning += lesson.totalEarning;
        commission.lessonCount += 1;
    }

    return Array.from(commissionMap.values()).sort((a, b) => b.earning - a.earning);
}

/**
 * Convert EventModel to TimelineEvent format
 */
export function eventModelToTimelineEvent(event: EventModel): TimelineEvent {
    return {
        eventId: event.eventId,
        lessonId: event.lessonId,
        date: event.date,
        time: event.time,
        dateLabel: event.dateLabel,
        dayOfWeek: event.dayOfWeek,
        duration: event.duration,
        durationLabel: event.durationLabel,
        location: event.location,
        teacherId: event.teacherId,
        teacherName: event.teacherName,
        teacherUsername: event.teacherUsername,
        eventStatus: event.eventStatus,
        lessonStatus: event.lessonStatus,
        teacherEarning: event.teacherEarning,
        schoolRevenue: event.schoolRevenue,
        totalRevenue: event.totalRevenue,
        commissionType: event.commissionType,
        commissionCph: event.commissionCph,
        bookingStudents: event.bookingStudents,
        equipmentCategory: event.equipmentCategory,
        capacityEquipment: event.capacityEquipment,
        capacityStudents: event.capacityStudents,
        equipments: event.equipments,
    };
}

/**
 * Convert EventModel to TransactionEventData format
 */
export function eventModelToTransactionEventData(event: EventModel, currency: string): TransactionEventData {
    return {
        event: {
            id: event.eventId,
            lessonId: event.lessonId,
            date: event.date.toISOString(),
            duration: event.duration,
            location: event.location,
            status: event.eventStatus,
        },
        teacher: {
            username: event.teacherUsername,
        },
        leaderStudentName: event.leaderName,
        studentCount: event.capacityStudents || 1,
        studentNames: event.bookingStudents.map((s) => `${s.firstName} ${s.lastName}`.trim()),
        packageData: {
            description: "", // Not available in EventModel, can be added if needed
            pricePerStudent: event.pricePerStudent,
            durationMinutes: event.packageDurationMinutes,
            categoryEquipment: event.equipmentCategory || "",
            capacityEquipment: event.capacityEquipment || 0,
            capacityStudents: event.capacityStudents || 1,
        },
        financials: {
            teacherEarnings: event.teacherEarning,
            studentRevenue: event.totalRevenue,
            profit: event.schoolRevenue,
            currency,
            commissionType: event.commissionType,
            commissionValue: event.commissionCph,
        },
        equipments: event.equipments,
    };
}

/**
 * Filter events by search query and status
 */
export function filterEvents(
    events: EventModel[],
    searchQuery: string,
    statusFilter?: string,
): EventModel[] {
    let filtered = events;

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
            (event) =>
                event.location.toLowerCase().includes(query) ||
                event.leaderName.toLowerCase().includes(query) ||
                event.teacherName.toLowerCase().includes(query),
        );
    }

    if (statusFilter && statusFilter !== "all") {
        filtered = filtered.filter((event) => event.eventStatus === statusFilter);
    }

    return filtered;
}

/**
 * Sort events
 */
export function sortEvents(events: EventModel[], sort: { field: string; direction: "asc" | "desc" }): EventModel[] {
    const sorted = [...events];

    sorted.sort((a, b) => {
        let valA: number, valB: number;

        if (sort.field === "date") {
            valA = a.date.getTime();
            valB = b.date.getTime();
        } else {
            // Default to date
            valA = a.date.getTime();
            valB = b.date.getTime();
        }

        return sort.direction === "desc" ? valB - valA : valA - valB;
    });

    return sorted;
}
