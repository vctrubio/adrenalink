import { relations } from "drizzle-orm";
import { school, student, schoolStudents } from "./schema";

export const schoolRelations = relations(school, ({ many }) => ({
    schoolStudents: many(schoolStudents),
}));

export const studentRelations = relations(student, ({ many }) => ({
    schoolStudents: many(schoolStudents),
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