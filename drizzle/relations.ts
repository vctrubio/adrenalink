import { relations } from "drizzle-orm";
import { school, student, schoolStudents, schoolPackage, studentPackage, booking, bookingStudent } from "./schema";

export const schoolRelations = relations(school, ({ many }) => ({
    schoolStudents: many(schoolStudents),
    schoolPackages: many(schoolPackage),
    bookings: many(booking),
}));

export const studentRelations = relations(student, ({ many }) => ({
    schoolStudents: many(schoolStudents),
    studentPackages: many(studentPackage),
    bookingStudents: many(bookingStudent),
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
    bookings: many(booking),
}));

export const studentPackageRelations = relations(studentPackage, ({ one, many }) => ({
    student: one(student, {
        fields: [studentPackage.studentId],
        references: [student.id],
    }),
    schoolPackage: one(schoolPackage, {
        fields: [studentPackage.packageId],
        references: [schoolPackage.id],
    }),
    bookings: many(booking),
}));

export const bookingRelations = relations(booking, ({ one, many }) => ({
    schoolPackage: one(schoolPackage, {
        fields: [booking.packageId],
        references: [schoolPackage.id],
    }),
    school: one(school, {
        fields: [booking.schoolId],
        references: [school.id],
    }),
    studentPackage: one(studentPackage, {
        fields: [booking.studentPackageId],
        references: [studentPackage.id],
    }),
    bookingStudents: many(bookingStudent),
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