import { TeacherQueue, type EventNode } from "@/backend/classboard/TeacherQueue";
import type { TeacherModel } from "@/backend/models";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";

interface CalculateTeacherQueuesParams {
    allSchoolTeachers: TeacherModel[];
    bookingsForSelectedDate: {
        booking: {
            id: string;
            dateStart: string;
            dateEnd: string;
            schoolId: string;
            studentPackageId: string;
            leaderStudentName: string;
            status: "active" | "completed" | "uncompleted";
            createdAt: Date;
            updatedAt: Date;
        };
        schoolPackage: any;
        bookingStudents: any[];
        lessons: any[];
    }[];
    gapMinutes: number;
    optimisticEvents: EventNode[];
}

export function calculateTeacherQueues({
    allSchoolTeachers,
    bookingsForSelectedDate,
    gapMinutes,
    optimisticEvents,
}: CalculateTeacherQueuesParams): TeacherQueue[] {
    const teacherMap = new Map<string, TeacherQueue>(); // key: teacherId

    // 1. Initialize queues for ALL active teachers
    allSchoolTeachers.forEach((teacher) => {
        const teacherId = teacher.schema.id;
        const teacherUsername = teacher.schema.username;
        const teacherName = `${teacher.schema.firstName} ${teacher.schema.lastName}`;
        if (!teacherMap.has(teacherId)) {
            teacherMap.set(teacherId, new TeacherQueue({ id: teacherId, username: teacherUsername, name: teacherName }));
        }
    });

    // 2. Add confirmed events from bookings
    bookingsForSelectedDate.forEach((booking) => {
        booking.lessons.forEach((lesson) => {
            if (lesson.status === "rest" || !lesson.commission) return;

            // Look up teacher ID from allSchoolTeachers using username
            const teacherUsername = lesson.teacher.username;
            const teacher = allSchoolTeachers.find((t) => t.schema.username === teacherUsername);
            const teacherId = teacher?.schema.id;
            const teacherName = `${lesson.teacher.firstName} ${lesson.teacher.lastName}`;

            if (!teacherId) {
                console.warn(
                    `⚠️ [calculateTeacherQueues] Teacher ${teacherUsername} not found in active teachers, skipping lesson ${lesson.id}`,
                );
                return;
            }

            if (!teacherMap.has(teacherId)) {
                teacherMap.set(teacherId, new TeacherQueue({ id: teacherId, username: teacherUsername, name: teacherName }));
            }

            const queue = teacherMap.get(teacherId)!;
            const studentData = booking.bookingStudents.map((bs) => ({
                id: bs.student.id,
                firstName: bs.student.firstName,
                lastName: bs.student.lastName,
                passport: bs.student.passport || "",
                country: bs.student.country || "",
                phone: bs.student.phone || "",
            }));

            const eventsForDate: EventNode[] = (lesson.events || []).map((event: any) => ({
                id: event.id,
                lessonId: lesson.id,
                bookingId: booking.booking.id,
                leaderStudentName: booking.booking.leaderStudentName,
                bookingStudents: studentData,
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
            }));

            eventsForDate.sort((a, b) => new Date(a.eventData.date).getTime() - new Date(b.eventData.date).getTime());
            eventsForDate.forEach((eventNode) => {
                queue.addToQueueInChronologicalOrder(eventNode, gapMinutes);
            });
        });
    });

    // 3. Add optimistic events (already filtered by selected date in ClientClassboard)
    optimisticEvents.forEach((optEvent) => {
        const teacherId = (optEvent as any)._teacherId;
        if (teacherId && teacherMap.has(teacherId)) {
            const eventClone = { ...optEvent, next: null };
            teacherMap.get(teacherId)!.addToQueueInChronologicalOrder(eventClone, gapMinutes);
        }
    });

    // Return queues in the order of allSchoolTeachers (which are already sorted by useSchoolTeachers hook)
    const queues = allSchoolTeachers
        .map((teacher) => teacherMap.get(teacher.schema.id))
        .filter((queue) => queue !== undefined) as TeacherQueue[];

    return queues;
}
