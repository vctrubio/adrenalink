import type { TransactionEventData } from "@/types/transaction-event";
import type { TimelineEvent } from "@/src/components/timeline/types";
import { getTimeFromISO } from "@/getters/queue-getter";
import { calculateLessonRevenue, calculateCommission } from "@/getters/commission-calculator";
import { safeArray } from "@/backend/error-handlers";

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

    for (const lesson of safeArray(lessons)) {
        const teacher = lesson.teacher;
        const commission = lesson.teacher_commission;
        const booking = lesson.booking;
        const schoolPackage = booking?.school_package;
        
        // Handle both student relation names (students or booking_student)
        const rawStudents = safeArray(booking?.booking_student || booking?.students);
        const students = rawStudents.map((s: any) => s.student || s);
        
        const lessonEvents = safeArray(lesson.event || lesson.events);

        if (!schoolPackage || !commission) continue;

        const leaderName = booking?.leader_student_name || "";

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

            const teacherEarnings = commCalc.earned;

            // Map equipments from equipment_event if present
            const equipments = safeArray(evt.equipment_event).map((ee: any) => ({
                id: ee.equipment?.id || "",
                brand: ee.equipment?.brand || "",
                model: ee.equipment?.model || "",
                size: ee.equipment?.size || null,
                sku: ee.equipment?.sku,
                color: ee.equipment?.color,
            }));

            events.push({
                event: {
                    id: evt.id,
                    lessonId: lesson.id,
                    bookingId: booking?.id,
                    // Force string format to preserve Wall Clock Time across the network
                    date: typeof evt.date === 'string' 
                        ? evt.date 
                        : new Date(evt.date).toLocaleString('sv-SE').replace(' ', 'T'),
                    duration: evt.duration || 0,
                    location: evt.location,
                    status: evt.status,
                },
                teacher: {
                    id: teacher?.id,
                    username: teacher?.username || "",
                },
                leaderStudentName: leaderName,
                studentCount: students.length,
                studentNames: students.map((s: any) => `${s.first_name} ${s.last_name}`),
                bookingStudents: students.map((s: any) => ({
                    id: s.id,
                    firstName: s.first_name,
                    lastName: s.last_name,
                    passport: s.passport,
                    country: s.country,
                    phone: s.phone,
                })),
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
                    teacherEarnings,
                    studentRevenue,
                    profit: studentRevenue - teacherEarnings,
                    currency,
                    commissionType: (commission.commission_type as "fixed" | "percentage") || "fixed",
                    commissionValue: parseFloat(commission.cph || "0"),
                },
                equipments: equipments.length > 0 ? equipments : (evt.equipments || []),
                lessonStatus: lesson.status,
                bookingStatus: booking?.status,
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
        teacherId: event.teacher.id || "",
        teacherName: "",
        teacherUsername: event.teacher.username,
        eventStatus: event.event.status,
        lessonStatus: event.lessonStatus || "active",
        teacherEarning: event.financials.teacherEarnings,
        schoolRevenue: event.financials.studentRevenue,
        totalRevenue: event.financials.studentRevenue,
        commissionType: event.financials.commissionType,
        commissionCph: event.financials.commissionValue,
        bookingStudents: event.bookingStudents?.map((s: any) => ({
            id: s.id,
            firstName: s.firstName || s.first_name,
            lastName: s.lastName || s.last_name,
        })) || event.studentNames.map((name, idx) => ({
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
