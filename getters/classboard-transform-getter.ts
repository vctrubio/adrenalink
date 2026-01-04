import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";

/**
 * Post-processes raw SQL result into ClassboardModel structure
 * Groups flat rows back into nested booking/lesson/event structure
 */
export function transformRawToClassboardModel(rawData: any[]): ClassboardModel {
    const bookingMap = new Map();

    rawData.forEach((row) => {
        const bookingId = row.booking_id;

        // Initialize booking if not exists
        if (!bookingMap.has(bookingId)) {
            bookingMap.set(bookingId, {
                booking: {
                    id: row.booking_id,
                    dateStart: row.date_start,
                    dateEnd: row.date_end,
                    leaderStudentName: row.leader_student_name,
                },
                schoolPackage: {
                    id: row.school_package_id,
                    durationMinutes: row.duration_minutes,
                    description: row.description,
                    pricePerStudent: row.price_per_student,
                    capacityStudents: row.capacity_students,
                    capacityEquipment: row.capacity_equipment,
                    categoryEquipment: row.category_equipment,
                },
                bookingStudents: [],
                lessons: [],
            });
        }

        const bookingData = bookingMap.get(bookingId);

        // Add unique student
        if (row.student_id && !bookingData.bookingStudents.find((bs: any) => bs.student.id === row.student_id)) {
            const languages = typeof row.languages === "string" ? JSON.parse(row.languages) : (row.languages || []);
            bookingData.bookingStudents.push({
                student: {
                    id: row.student_id,
                    firstName: row.first_name,
                    lastName: row.last_name,
                    passport: row.passport || "",
                    country: row.country || "",
                    phone: row.phone || "",
                    languages: Array.isArray(languages) ? languages : [],
                    description: row.student_description || null,
                },
            });
        }

        // Add unique lesson
        if (row.lesson_id) {
            let lesson = bookingData.lessons.find((l: any) => l.id === row.lesson_id);

            if (!lesson) {
                lesson = {
                    id: row.lesson_id,
                    teacher: row.teacher_id
                        ? {
                              id: row.teacher_id,
                              username: row.username,
                          }
                        : undefined,
                    status: row.lesson_status,
                    commission: {
                        id: row.commission_id,
                        type: row.commission_type || "fixed",
                        cph: row.cph || "0",
                        description: row.commission_description,
                    },
                    events: [],
                };
                bookingData.lessons.push(lesson);
            }

            // Add unique event
            if (row.event_id && !lesson.events.find((e: any) => e.id === row.event_id)) {
                lesson.events.push({
                    id: row.event_id,
                    date: row.event_date,
                    duration: row.event_duration,
                    location: row.location,
                    status: row.event_status,
                });
            }
        }
    });

    return Array.from(bookingMap.values()) as ClassboardModel;
}
