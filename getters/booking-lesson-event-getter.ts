import type { TransactionEventData, TransactionEventStudent } from "@/types/transaction-event";
import type { TimelineEvent } from "@/src/components/timeline/types";
import { getTimeFromISO } from "@/getters/queue-getter";
import { calculateLessonRevenue, calculateCommission } from "@/getters/commission-calculator";
import { safeArray } from "@/backend/error-handlers";
import { getHMDuration } from "./duration-getter";

/**
 * Unified resource generator for Booking, Lesson, and Event views.
 * Transforms raw database relations into rich TransactionEventData objects.
 * Matches DB schema: Event -> Lesson -> Booking.
 */
export function lessonsToTransactionEvents(
    lessons: any[],
    currency: string,
): TransactionEventData[] {
    const transactions: TransactionEventData[] = [];

    for (const lesson of safeArray(lessons)) {
        const teacher = lesson.teacher;
        const commission = lesson.teacher_commission;
        const booking = lesson.booking;
        const schoolPackage = booking?.school_package;
        
        // Map Students (Full objects)
        const rawStudents = safeArray(booking?.booking_student || booking?.students);
        const students: TransactionEventStudent[] = rawStudents.map((s: any) => {
            const student = s.student || s;
            return {
                id: student.id,
                firstName: student.first_name,
                lastName: student.last_name,
                passport: student.passport,
                country: student.country,
                phone: student.phone,
            };
        });
        
        const lessonEvents = safeArray(lesson.event || lesson.events);

        if (!schoolPackage || !commission || !booking) continue;

        for (const evt of lessonEvents) {
            const studentRevenue = calculateLessonRevenue(
                schoolPackage.price_per_student,
                students.length,
                evt.duration,
                schoolPackage.duration_minutes
            );

            const commCalc = calculateCommission(
                evt.duration,
                { 
                    type: commission.commission_type as "fixed" | "percentage", 
                    cph: parseFloat(commission.cph) 
                },
                studentRevenue,
                schoolPackage.duration_minutes
            );

            // Map equipment_event relations
            const equipments = safeArray(evt.equipment_event).map((ee: any) => ({
                id: ee.equipment?.id || "",
                brand: ee.equipment?.brand || "",
                model: ee.equipment?.model || "",
                size: ee.equipment?.size ? parseFloat(ee.equipment.size) : null,
                sku: ee.equipment?.sku,
                color: ee.equipment?.color,
            }));

            transactions.push({
                event: {
                    id: evt.id,
                    lessonId: lesson.id,
                    date: typeof evt.date === "string" 
                        ? evt.date 
                        : new Date(evt.date).toLocaleString("sv-SE").replace(" ", "T"),
                    duration: evt.duration || 0,
                    location: evt.location,
                    status: evt.status,
                },
                lesson: {
                    id: lesson.id,
                    status: lesson.status,
                },
                booking: {
                    id: booking.id,
                    leaderStudentName: booking.leader_student_name,
                    status: booking.status,
                    students,
                },
                teacher: {
                    id: teacher?.id,
                    username: teacher?.username || "Unknown",
                },
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
                    cph: parseFloat(commission.cph || "0"),
                    description: commission.description || null,
                },
                financials: {
                    teacherEarnings: commCalc.earned,
                    studentRevenue,
                    profit: studentRevenue - commCalc.earned,
                    currency,
                    commissionType: (commission.commission_type as "fixed" | "percentage") || "fixed",
                    commissionValue: parseFloat(commission.cph || "0"),
                },
                equipments: equipments.length > 0 ? equipments : (evt.equipments || []),
            });
        }
    }

    return transactions;
}

/**
 * Group a flat list of TransactionEventData into UI-friendly LessonRows.
 * Centralizes the summation logic for hours, earnings, and revenue.
 */
export function groupTransactionsByLesson(
    transactions: TransactionEventData[],
    lessonPaymentsMap: Record<string, number> = {}
) {
    const lessonMap = new Map<string, TransactionEventData[]>();

    for (const tx of transactions) {
        const lessonId = tx.lesson.id;
        if (!lessonMap.has(lessonId)) {
            lessonMap.set(lessonId, []);
        }
        lessonMap.get(lessonId)!.push(tx);
    }

    return Array.from(lessonMap.entries()).map(([lessonId, events]) => {
        const first = events[0];
        const totalDuration = events.reduce((sum, e) => sum + e.event.duration, 0);
        const totalEarning = events.reduce((sum, e) => sum + e.financials.teacherEarnings, 0);
        const totalRevenue = events.reduce((sum, e) => sum + e.financials.studentRevenue, 0);
        const totalPayments = lessonPaymentsMap[lessonId] || 0;

        // Sort events within lesson by date
        const sortedEvents = [...events].sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());

        return {
            lessonId,
            bookingId: first.booking.id,
            leaderName: first.booking.leaderStudentName,
            dateStart: sortedEvents[0].event.date,
            dateEnd: sortedEvents[sortedEvents.length - 1].event.date,
            lessonStatus: first.lesson.status,
            bookingStatus: first.booking.status,
            commissionType: first.financials.commissionType,
            cph: first.financials.commissionValue,
            commissionDescription: first.commission.description,
            totalDuration,
            totalHours: totalDuration / 60,
            totalEarning,
            totalRevenue,
            totalPayments,
            eventCount: events.length,
            events: sortedEvents.map(transactionEventToTimelineEvent),
            equipmentCategory: first.packageData.categoryEquipment,
            studentCapacity: first.packageData.capacityStudents,
        };
    });
}

/**
 * Adapt TransactionEventData to TimelineEvent format.
 */
export function transactionEventToTimelineEvent(event: TransactionEventData): TimelineEvent {
    const date = new Date(event.event.date);

    return {
        eventId: event.event.id,
        lessonId: event.event.lessonId,
        date,
        time: getTimeFromISO(event.event.date),
        dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dayOfWeek: date.toLocaleDateString("en-US", { weekday: "short" }),
        duration: event.event.duration,
        durationLabel: getHMDuration(event.event.duration),
        location: event.event.location || "",
        teacherId: event.teacher.id || "",
        teacherName: "",
        teacherUsername: event.teacher.username,
        eventStatus: event.event.status,
        lessonStatus: event.lesson.status,
        teacherEarning: event.financials.teacherEarnings,
        schoolRevenue: event.financials.studentRevenue,
        totalRevenue: event.financials.studentRevenue,
        commissionType: event.financials.commissionType,
        commissionCph: event.financials.commissionValue,
        bookingStudents: event.booking.students.map(s => ({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
        })),
        equipmentCategory: event.packageData.categoryEquipment || null,
        capacityEquipment: event.packageData.capacityEquipment || null,
        capacityStudents: event.packageData.capacityStudents || null,
        equipments: event.equipments || [],
    };
}