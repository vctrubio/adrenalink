import type { TransactionEventData } from "@/types/transaction-event";
import type { TimelineEvent } from "@/src/components/timeline/types";
import { getTimeFromISO } from "@/getters/queue-getter";

/**
 * Transform lessons to TransactionEventData
 * Single source of truth for all event transformations
 * Works for Teacher.lessons, Booking.lessons, and Student.bookings.lessons
 */
export function lessonsToTransactionEvents(
    lessons: any[],
    currency: string,
): TransactionEventData[] {
    const events: TransactionEventData[] = [];

    for (const lesson of lessons) {
        const teacher = lesson.teacher;
        const commission = lesson.teacher_commission;
        const booking = lesson.booking;
        const schoolPackage = booking?.school_package;
        const students = booking?.students || [];
        const lessonEvents = lesson.event || lesson.events || [];

        if (!schoolPackage || !commission) continue;

        const leaderName = booking?.leader_student_name || "";

        for (const evt of lessonEvents) {
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

            events.push({
                event: {
                    id: evt.id,
                    lessonId: lesson.id,
                    // Force string format to preserve Wall Clock Time across the network
                    date: typeof evt.date === 'string' 
                        ? evt.date 
                        : new Date(evt.date).toLocaleString('sv-SE').replace(' ', 'T'),
                    duration,
                    location: evt.location,
                    status: evt.status,
                },
                teacher: {
                    username: teacher?.username || "",
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
                commission: {
                    id: commission.id || "",
                    type: (commission.commission_type as "fixed" | "percentage") || "fixed",
                    cph: commission ? parseFloat(commission.cph) : 0,
                },
                financials: {
                    teacherEarnings,
                    studentRevenue,
                    profit: studentRevenue - teacherEarnings,
                    currency,
                    commissionType: (commission.commission_type as "fixed" | "percentage") || "fixed",
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
        time: getTimeFromISO(event.event.date),
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
        bookingStudents: event.studentNames.map((name, idx) => ({
            id: `student-${idx}`,
            firstName: name.split(" ")[0] || "",
            lastName: name.split(" ")[1] || "",
        })),
        equipmentCategory: event.packageData.categoryEquipment || null,
        capacityEquipment: event.packageData.capacityEquipment || null,
        capacityStudents: event.packageData.capacityStudents || null,
        equipments: event.equipments || [],
    };
}
