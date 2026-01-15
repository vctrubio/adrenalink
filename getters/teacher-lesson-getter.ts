import type { TransactionEventData } from "@/types/transaction-event";
import type { TimelineEvent } from "@/src/components/timeline/types";
import type { EventStatusFilter } from "@/src/components/timeline/TimelineHeader";
import type { SortConfig } from "@/types/sort";

// ============================================================================
// Type Definitions
// ============================================================================

export interface LessonGroup {
    lessonId: string;
    bookingId: string;
    leaderName: string;
    dateStart: string;
    dateEnd: string;
    lessonStatus: string;
    bookingStatus: string;
    commissionType: string;
    cph: number;
    totalDuration: number;
    totalHours: number;
    totalEarning: number;
    eventCount: number;
    events: TransactionEventData[];
    equipmentCategory: string;
    studentCapacity: number;
}

export interface CommissionGroup {
    type: "fixed" | "percentage";
    cph: number;
    lessonCount: number;
    hours: number;
    earning: number;
    lessons: LessonGroup[];
}

// ============================================================================
// Build Functions
// ============================================================================

/**
 * Build flat list of TransactionEventData from lessons
 */
export function buildTransactionEvents(
    lessons: any[],
    teacher?: { id: string; first_name?: string; username: string },
): TransactionEventData[] {
    const events: TransactionEventData[] = [];

    for (const lesson of lessons) {
        const booking = lesson.booking;
        const schoolPackage = booking?.school_package;
        const commission = lesson.teacher_commission;
        const students = booking?.students || [];

        if (!schoolPackage || !commission) continue;

        const leaderStudent = students[0];
        const leaderName = leaderStudent ? `${leaderStudent.first_name} ${leaderStudent.last_name}` : "No Leader";

        for (const evt of lesson.event || []) {
            const duration = evt.duration || 0;
            const hours = duration / 60;
            const pricePerStudent = schoolPackage.price_per_student || 0;
            const studentRevenue = pricePerStudent * students.length * hours;

            let teacherEarnings = 0;
            if (commission.commission_type === "fixed") {
                teacherEarnings = parseFloat(commission.cph) * hours;
            } else if (commission.commission_type === "percentage") {
                teacherEarnings = studentRevenue * (parseFloat(commission.cph) / 100);
            }

            const profit = studentRevenue - teacherEarnings;

            const transactionEvent: TransactionEventData = {
                event: {
                    id: evt.id,
                    lessonId: lesson.id,
                    date: evt.date,
                    duration: evt.duration || 0,
                    location: evt.location,
                    status: evt.status,
                },
                teacher: {
                    username: teacher?.username || lesson.teacher?.username || "Unknown",
                },
                leaderStudentName: leaderName,
                studentCount: students.length,
                studentNames: students.map((s: any) => `${s.first_name} ${s.last_name}`),
                packageData: {
                    description: schoolPackage.description || "",
                    pricePerStudent: schoolPackage.price_per_student || 0,
                    durationMinutes: schoolPackage.duration_minutes || 0,
                    categoryEquipment: schoolPackage.category_equipment || "",
                    capacityEquipment: schoolPackage.capacity_equipment || 0,
                    capacityStudents: schoolPackage.capacity_students || 0,
                },
                financials: {
                    teacherEarnings,
                    studentRevenue,
                    profit,
                    currency: "EUR",
                    commissionType: commission.commission_type as "fixed" | "percentage",
                    commissionValue: parseFloat(commission.cph),
                },
                equipments: evt.equipments,
            };

            events.push(transactionEvent);
        }
    }

    return events;
}

// ============================================================================
// Grouping Functions
// ============================================================================

/**
 * Group TransactionEventData by lesson
 */
export function groupEventsByLesson(events: TransactionEventData[]): LessonGroup[] {
    const lessonMap = new Map<string, TransactionEventData[]>();

    for (const event of events) {
        const lessonId = event.event.lessonId || "unknown";
        if (!lessonMap.has(lessonId)) {
            lessonMap.set(lessonId, []);
        }
        lessonMap.get(lessonId)!.push(event);
    }

    const lessonGroups: LessonGroup[] = [];

    for (const [lessonId, lessonEvents] of lessonMap.entries()) {
        if (lessonEvents.length === 0) continue;

        const firstEvent = lessonEvents[0];
        const totalDuration = lessonEvents.reduce((sum, e) => sum + e.event.duration, 0);
        const totalHours = totalDuration / 60;
        const totalEarning = lessonEvents.reduce((sum, e) => sum + e.financials.teacherEarnings, 0);

        // Get date range
        const dates = lessonEvents.map((e) => new Date(e.event.date).getTime());
        const dateStart = new Date(Math.min(...dates)).toISOString();
        const dateEnd = new Date(Math.max(...dates)).toISOString();

        lessonGroups.push({
            lessonId,
            bookingId: "unknown",
            leaderName: firstEvent.leaderStudentName,
            dateStart,
            dateEnd,
            lessonStatus: "active",
            bookingStatus: "active",
            commissionType: firstEvent.financials.commissionType,
            cph: firstEvent.financials.commissionValue,
            totalDuration,
            totalHours,
            totalEarning,
            eventCount: lessonEvents.length,
            events: lessonEvents,
            equipmentCategory: firstEvent.packageData.categoryEquipment,
            studentCapacity: firstEvent.packageData.capacityStudents,
        });
    }

    return lessonGroups;
}

/**
 * Group lessons by commission type and CPH
 */
export function groupLessonsByCommission(lessonGroups: LessonGroup[]): CommissionGroup[] {
    const commissionMap = new Map<string, LessonGroup[]>();

    for (const lesson of lessonGroups) {
        const key = `${lesson.commissionType}-${lesson.cph}`;
        if (!commissionMap.has(key)) {
            commissionMap.set(key, []);
        }
        commissionMap.get(key)!.push(lesson);
    }

    const commissionGroups: CommissionGroup[] = [];

    for (const [key, lessons] of commissionMap.entries()) {
        if (lessons.length === 0) continue;

        const firstLesson = lessons[0];
        const hours = lessons.reduce((sum, l) => sum + l.totalHours, 0);
        const earning = lessons.reduce((sum, l) => sum + l.totalEarning, 0);

        commissionGroups.push({
            type: firstLesson.commissionType as "fixed" | "percentage",
            cph: firstLesson.cph,
            lessonCount: lessons.length,
            hours,
            earning,
            lessons,
        });
    }

    return commissionGroups;
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Convert TransactionEventData to TimelineEvent format
 */
export function transactionEventToTimelineEvent(event: TransactionEventData): TimelineEvent {
    const date = new Date(event.event.date);
    const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });

    const hours = event.event.duration / 60;
    const hoursInt = Math.floor(hours);
    const minutes = Math.round((hours - hoursInt) * 60);
    const durationLabel = hoursInt > 0 ? `${hoursInt}h${minutes > 0 ? ` ${minutes}m` : ""}` : `${minutes}m`;

    return {
        eventId: event.event.id,
        lessonId: event.event.lessonId || "",
        date,
        time: timeStr,
        dateLabel,
        dayOfWeek,
        duration: event.event.duration,
        durationLabel,
        location: event.event.location || "",
        teacherId: "",
        teacherName: "",
        teacherUsername: event.teacher.username,
        eventStatus: event.event.status,
        lessonStatus: "active",
        teacherEarning: event.financials.teacherEarnings,
        schoolRevenue: event.financials.studentRevenue,
        totalRevenue: event.financials.studentRevenue,
        commissionType: event.financials.commissionType,
        commissionCph: event.financials.commissionValue,
        bookingStudents: event.studentNames.map((name, idx) => ({
            id: `student-${idx}`,
            firstName: name.split(" ")[0] || "",
            lastName: name.split(" ")[1] || "",
        })),
    };
}

// ============================================================================
// Filter and Sort Functions
// ============================================================================

/**
 * Filter TransactionEventData by search query and status
 */
export function filterTransactionEvents(
    events: TransactionEventData[],
    searchQuery: string,
    statusFilter: EventStatusFilter,
): TransactionEventData[] {
    let filtered = events;

    // Filter by status
    if (statusFilter !== "all") {
        filtered = filtered.filter((event) => event.event.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
            (event) =>
                event.leaderStudentName.toLowerCase().includes(query) ||
                event.event.location?.toLowerCase().includes(query) ||
                event.teacher.username.toLowerCase().includes(query),
        );
    }

    return filtered;
}

/**
 * Sort TransactionEventData
 */
export function sortTransactionEvents(events: TransactionEventData[], sortConfig: SortConfig): TransactionEventData[] {
    const sorted = [...events];

    sorted.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.field) {
            case "date":
                aValue = new Date(a.event.date).getTime();
                bValue = new Date(b.event.date).getTime();
                break;
            case "duration":
                aValue = a.event.duration;
                bValue = b.event.duration;
                break;
            case "status":
                aValue = a.event.status;
                bValue = b.event.status;
                break;
            default:
                aValue = new Date(a.event.date).getTime();
                bValue = new Date(b.event.date).getTime();
        }

        if (sortConfig.direction === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    return sorted;
}
