import type { StudentType } from "@/drizzle/schema";
import type { StudentModel } from "@/backend/models";

//this will be first_name + last_name later?
export function getStudentName(student: StudentType): string {
    return student.name;
}

export function getStudentSchoolCount(student: StudentModel): number {
    return student.relations?.schoolStudents?.length || 0;
}

export function getStudentBookingsCount(student: StudentModel): number {
    return student.relations?.bookingStudents?.length || 0;
}

export function getStudentEventsCount(student: StudentModel): number {
    const bookingStudents = student.relations?.bookingStudents || [];
    let totalEvents = 0;

    for (const bookingStudent of bookingStudents) {
        const booking = bookingStudent.booking;
        if (booking?.lessons) {
            for (const lesson of booking.lessons) {
                totalEvents += lesson.events?.length || 0;
            }
        }
    }

    return totalEvents;
}

export function getStudentTotalHours(student: StudentModel): number {
    const bookingStudents = student.relations?.bookingStudents || [];
    let totalMinutes = 0;

    for (const bookingStudent of bookingStudents) {
        const booking = bookingStudent.booking;
        if (booking?.lessons) {
            for (const lesson of booking.lessons) {
                if (lesson.events) {
                    for (const event of lesson.events) {
                        totalMinutes += event.duration || 0;
                    }
                }
            }
        }
    }

    return Math.round(totalMinutes / 60);
}

export function getStudentRequestedPackagesCount(student: StudentModel): number {
    const studentPackageStudents = student.relations?.studentPackageStudents || [];
    return studentPackageStudents.filter(sps => sps.studentPackage?.status === "requested").length;
}

export function getStudentMoneyIn(student: StudentModel): number {
    const bookingPayments = student.relations?.bookingPayments || [];
    return bookingPayments.reduce((total, payment) => total + (payment.amount || 0), 0);
}

export function getStudentMoneyOut(student: StudentModel): number {
    const bookingStudents = student.relations?.bookingStudents || [];
    let totalCost = 0;

    for (const bookingStudent of bookingStudents) {
        const booking = bookingStudent.booking;
        if (!booking) continue;

        const studentPackage = booking.studentPackage;
        const schoolPackage = studentPackage?.schoolPackage;

        if (!schoolPackage) continue;

        const pricePerMinute = schoolPackage.pricePerStudent / schoolPackage.durationMinutes;
        const lessons = booking.lessons || [];

        for (const lesson of lessons) {
            const events = lesson.events || [];
            for (const event of events) {
                totalCost += event.duration * pricePerMinute;
            }
        }
    }

    return Math.round(totalCost);
}
