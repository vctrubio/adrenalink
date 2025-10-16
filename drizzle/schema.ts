import { pgTable, uuid, timestamp, varchar, text, unique } from "drizzle-orm/pg-core";

export const student = pgTable("student", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    passport: varchar("passport", { length: 50 }).notNull().unique(),
    country: varchar("country", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const school = pgTable("school", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    country: varchar("country", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const schoolStudents = pgTable("school_students", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    schoolId: uuid("school_id")
        .notNull()
        .references(() => school.id),
    studentId: uuid("student_id")
        .notNull()
        .references(() => student.id),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    uniqueStudentSchool: unique("unique_student_school").on(table.studentId, table.schoolId),
}));

export type StudentType = typeof student.$inferSelect;
export type StudentForm = typeof student.$inferInsert;
export type SchoolType = typeof school.$inferSelect;
export type SchoolForm = typeof school.$inferInsert;
export type SchoolStudentType = typeof schoolStudents.$inferSelect;
export type SchoolStudentForm = typeof schoolStudents.$inferInsert;
