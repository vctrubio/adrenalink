import { TeacherQueue, type EventNode } from "@/src/app/(admin)/(classboard)/TeacherQueue";
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
        schoolPackage: any; // Using any for brevity if complex, but preferably precise type
        bookingStudents: any[];
        lessons: any[];
    }[];
    selectedDate: string;
    gapMinutes: number;
    optimisticEvents: EventNode[];
    teacherSortOrder: string[];
}

export function calculateTeacherQueues({
    allSchoolTeachers,
    bookingsForSelectedDate,
    selectedDate,
    gapMinutes,
    optimisticEvents,
    teacherSortOrder,
}: CalculateTeacherQueuesParams): TeacherQueue[] {
    const teacherMap = new Map<string, TeacherQueue>();

    // 1. Initialize queues for ALL active teachers
    allSchoolTeachers.forEach((teacher) => {
        const teacherUsername = teacher.schema.username;
        const teacherName = `${teacher.schema.firstName} ${teacher.schema.lastName}`;
        if (!teacherMap.has(teacherUsername)) {
            teacherMap.set(teacherUsername, new TeacherQueue({ username: teacherUsername, name: teacherName }));
        }
    });

    // 2. Add confirmed events from bookings
    bookingsForSelectedDate.forEach((booking) => {
        booking.lessons.forEach((lesson) => {
            if (lesson.status === "rest" || !lesson.commission) return;

            const teacherUsername = lesson.teacher.username;
            const teacherName = `${lesson.teacher.firstName} ${lesson.teacher.lastName}`;

            if (!teacherMap.has(teacherUsername)) {
                teacherMap.set(teacherUsername, new TeacherQueue({ username: teacherUsername, name: teacherName }));
            }

            const queue = teacherMap.get(teacherUsername)!;
            const eventsForDate: EventNode[] = [];

            lesson.events.forEach((event: any) => {
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

                    eventsForDate.push({
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
                    });
                }
            });

            eventsForDate.sort((a, b) => new Date(a.eventData.date).getTime() - new Date(b.eventData.date).getTime());
            eventsForDate.forEach((eventNode) => {
                queue.addToQueueInChronologicalOrder(eventNode, gapMinutes);
            });
        });
    });

    // 3. Add optimistic events
    optimisticEvents.forEach((optEvent) => {
        const eventDateObj = new Date(optEvent.eventData.date);
        const year = eventDateObj.getFullYear();
        const month = String(eventDateObj.getMonth() + 1).padStart(2, "0");
        const day = String(eventDateObj.getDate()).padStart(2, "0");
        const eventDate = `${year}-${month}-${day}`;

        if (eventDate === selectedDate) {
            const teacherUsername = (optEvent as any)._teacherUsername;
            if (teacherUsername && teacherMap.has(teacherUsername)) {
                // Clone to avoid mutation issues
                const eventClone = { ...optEvent, next: null };
                teacherMap.get(teacherUsername)!.addToQueueInChronologicalOrder(eventClone, gapMinutes);
            }
        }
    });

    const queues = Array.from(teacherMap.values());

    if (teacherSortOrder.length > 0) {
        queues.sort((a, b) => {
            const aTeacher = allSchoolTeachers.find(t => t.schema.username === a.teacher.username);
            const bTeacher = allSchoolTeachers.find(t => t.schema.username === b.teacher.username);
            const aIndex = aTeacher ? teacherSortOrder.indexOf(aTeacher.schema.id) : -1;
            const bIndex = bTeacher ? teacherSortOrder.indexOf(bTeacher.schema.id) : -1;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });
    }

    return queues;
}
