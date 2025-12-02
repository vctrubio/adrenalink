import { relations } from "drizzle-orm";
import { school, student, schoolStudents, schoolPackage, studentPackage, studentPackageStudent, booking, bookingStudent, lesson, event, equipment, equipmentEvent, teacher, teacherCommission, teacherEquipment, studentLessonFeedback, teacherLessonPayment, studentBookingPayment, rental, equipmentRepair, referral } from "./schema";

export const schoolRelations = relations(school, ({ many }) => ({
    schoolStudents: many(schoolStudents),
    schoolPackages: many(schoolPackage),
    bookings: many(booking),
}));

export const studentRelations = relations(student, ({ many }) => ({
    schoolStudents: many(schoolStudents),
    studentPackageStudents: many(studentPackageStudent),
    bookingStudents: many(bookingStudent),
    bookingPayments: many(studentBookingPayment),
}));

export const schoolStudentsRelations = relations(schoolStudents, ({ one }) => ({
    school: one(school, {
        fields: [schoolStudents.schoolId],
        references: [school.id],
    }),
    student: one(student, {
        fields: [schoolStudents.studentId],
        references: [student.id],
    }),
}));

export const schoolPackageRelations = relations(schoolPackage, ({ one, many }) => ({
    school: one(school, {
        fields: [schoolPackage.schoolId],
        references: [school.id],
    }),
    studentPackages: many(studentPackage),
}));

export const studentPackageRelations = relations(studentPackage, ({ one, many }) => ({
    schoolPackage: one(schoolPackage, {
        fields: [studentPackage.schoolPackageId],
        references: [schoolPackage.id],
    }),
    referral: one(referral, {
        fields: [studentPackage.referralId],
        references: [referral.id],
    }),
    studentPackageStudents: many(studentPackageStudent),
    bookings: many(booking),
}));

export const studentPackageStudentRelations = relations(studentPackageStudent, ({ one }) => ({
    studentPackage: one(studentPackage, {
        fields: [studentPackageStudent.studentPackageId],
        references: [studentPackage.id],
    }),
    student: one(student, {
        fields: [studentPackageStudent.studentId],
        references: [student.id],
    }),
}));

export const bookingRelations = relations(booking, ({ one, many }) => ({
    school: one(school, {
        fields: [booking.schoolId],
        references: [school.id],
    }),
    studentPackage: one(studentPackage, {
        fields: [booking.studentPackageId],
        references: [studentPackage.id],
    }),
    bookingStudents: many(bookingStudent),
    lessons: many(lesson),
    studentBookingPayments: many(studentBookingPayment),
}));

export const bookingStudentRelations = relations(bookingStudent, ({ one }) => ({
    booking: one(booking, {
        fields: [bookingStudent.bookingId],
        references: [booking.id],
    }),
    student: one(student, {
        fields: [bookingStudent.studentId],
        references: [student.id],
    }),
}));

export const lessonRelations = relations(lesson, ({ one, many }) => ({
    teacher: one(teacher, {
        fields: [lesson.teacherId],
        references: [teacher.id],
    }),
    booking: one(booking, {
        fields: [lesson.bookingId],
        references: [booking.id],
    }),
    commission: one(teacherCommission, {
        fields: [lesson.commissionId],
        references: [teacherCommission.id],
    }),
    events: many(event),
    teacherLessonPayments: many(teacherLessonPayment),
    feedback: many(studentLessonFeedback),
}));

export const eventRelations = relations(event, ({ one, many }) => ({
    lesson: one(lesson, {
        fields: [event.lessonId],
        references: [lesson.id],
    }),
    equipmentEvents: many(equipmentEvent),
}));

export const equipmentEventRelations = relations(equipmentEvent, ({ one }) => ({
    equipment: one(equipment, {
        fields: [equipmentEvent.equipmentId],
        references: [equipment.id],
    }),
    event: one(event, {
        fields: [equipmentEvent.eventId],
        references: [event.id],
    }),
}));

export const equipmentRelations = relations(equipment, ({ one, many }) => ({
    school: one(school, {
        fields: [equipment.schoolId],
        references: [school.id],
    }),
    teacherEquipments: many(teacherEquipment),
    equipmentEvents: many(equipmentEvent),
    equipmentRepairs: many(equipmentRepair),
    rentals: many(rental),
}));

export const teacherEquipmentRelations = relations(teacherEquipment, ({ one }) => ({
    teacher: one(teacher, {
        fields: [teacherEquipment.teacherId],
        references: [teacher.id],
    }),
    equipment: one(equipment, {
        fields: [teacherEquipment.equipmentId],
        references: [equipment.id],
    }),
}));

export const teacherRelations = relations(teacher, ({ one, many }) => ({
    school: one(school, {
        fields: [teacher.schoolId],
        references: [school.id],
    }),
    commissions: many(teacherCommission),
    lessons: many(lesson),
    equipments: many(teacherEquipment),
}));

export const teacherCommissionRelations = relations(teacherCommission, ({ one, many }) => ({
    teacher: one(teacher, {
        fields: [teacherCommission.teacherId],
        references: [teacher.id],
    }),
    lessons: many(lesson),
}));

export const studentLessonFeedbackRelations = relations(studentLessonFeedback, ({ one }) => ({
    student: one(student, {
        fields: [studentLessonFeedback.studentId],
        references: [student.id],
    }),
    lesson: one(lesson, {
        fields: [studentLessonFeedback.lessonId],
        references: [lesson.id],
    }),
}));

export const teacherLessonPaymentRelations = relations(teacherLessonPayment, ({ one }) => ({
    lesson: one(lesson, {
        fields: [teacherLessonPayment.lessonId],
        references: [lesson.id],
    }),
}));

export const studentBookingPaymentRelations = relations(studentBookingPayment, ({ one }) => ({
    booking: one(booking, {
        fields: [studentBookingPayment.bookingId],
        references: [booking.id],
    }),
    student: one(student, {
        fields: [studentBookingPayment.studentId],
        references: [student.id],
    }),
}));

export const rentalRelations = relations(rental, ({ one }) => ({
    student: one(student, {
        fields: [rental.studentId],
        references: [student.id],
    }),
    equipment: one(equipment, {
        fields: [rental.equipmentId],
        references: [equipment.id],
    }),
}));

export const equipmentRepairRelations = relations(equipmentRepair, ({ one }) => ({
    equipment: one(equipment, {
        fields: [equipmentRepair.equipmentId],
        references: [equipment.id],
    }),
}));

export const referralRelations = relations(referral, ({ one, many }) => ({
    school: one(school, {
        fields: [referral.schoolId],
        references: [school.id],
    }),
    studentPackages: many(studentPackage),
}));