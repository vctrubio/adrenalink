import type { TransactionEventData } from "@/types/transaction-event";
import type { TimelineEvent } from "@/src/components/timeline/types";

/**
 * Transform lessons data to TransactionEventData
 * Single source of truth for all event transformations
 */
export function lessonsToTransactionEvents(
    lessons: any[],
    schoolPackage: any,
    students: any[],
    bookingLeaderName: string,
    currency: string,
): TransactionEventData[] {
    const events: TransactionEventData[] = [];

    for (const lesson of lessons) {
        const teacher = lesson.teacher;
        const commission = lesson.teacher_commission;
        const lessonEvents = lesson.events || [];

        for (const evt of lessonEvents) {
            const duration = evt.duration || 0;
            const hours = duration / 60;
            const pricePerStudent = schoolPackage?.price_per_student || 0;
            const studentRevenue = pricePerStudent * students.length * hours;

            let teacherEarnings = 0;
            if (commission?.commission_type === "fixed") {
                teacherEarnings = parseFloat(commission.cph) * hours;
            } else if (commission?.commission_type === "percentage") {
                teacherEarnings = studentRevenue * (parseFloat(commission.cph) / 100);
            }

            events.push({
                event: {
                    id: evt.id,
                    lessonId: lesson.id,
                    date: evt.date,
                    duration,
                    location: evt.location,
                    status: evt.status,
                },
                teacher: {
                    username: teacher?.username || "",
                },
                leaderStudentName: bookingLeaderName,
                studentCount: students.length,
                studentNames: students.map((s: any) => `${s.first_name} ${s.last_name}`),
                packageData: {
                    description: schoolPackage?.description || "",
                    pricePerStudent: schoolPackage?.price_per_student || 0,
                    durationMinutes: schoolPackage?.duration_minutes || 0,
                    categoryEquipment: schoolPackage?.category_equipment || "",
                    capacityEquipment: schoolPackage?.capacity_equipment || 0,
                    capacityStudents: schoolPackage?.capacity_students || 0,
                },
                commission: {
                    id: commission?.id || "",
                    type: (commission?.commission_type as "fixed" | "percentage") || "fixed",
                    cph: commission ? parseFloat(commission.cph) : 0,
                },
                financials: {
                    teacherEarnings,
                    studentRevenue,
                    profit: studentRevenue - teacherEarnings,
                    currency,
                    commissionType: (commission?.commission_type as "fixed" | "percentage") || "fixed",
                    commissionValue: commission ? parseFloat(commission.cph) : 0,
                },
                equipments: evt.equipments,
            });
        }
    }

    return events;
}

/**
 * Adapt TransactionEventData to TimelineEvent format
 * Used when displaying events in timeline view
 */
export function transactionEventToTimelineEvent(event: TransactionEventData): TimelineEvent {
    const date = new Date(event.event.date);
    const duration = event.event.duration;
    const hours = duration / 60;
    const hoursInt = Math.floor(hours);
    const minutes = Math.round((hours - hoursInt) * 60);
    const durationLabel = hoursInt > 0 ? `${hoursInt}h${minutes > 0 ? ` ${minutes}m` : ""}` : `${minutes}m`;

    return {
        eventId: event.event.id,
        lessonId: event.event.lessonId || "",
        date,
        time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dayOfWeek: date.toLocaleDateString("en-US", { weekday: "short" }),
        duration,
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
    };
}
