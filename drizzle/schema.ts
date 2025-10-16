import { pgTable, uuid, timestamp, varchar, text, unique, check, boolean, integer, pgEnum, foreignKey, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const equipmentCategoryEnum = pgEnum("equipment_category", ["kite", "wing", "windsurf", "surf", "snowboard"]);

export const student = pgTable("student", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    passport: varchar({ length: 50 }).notNull().unique(),
    country: varchar({ length: 100 }).notNull(),
    phone: varchar({ length: 20 }).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
});

export const school = pgTable("school", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    username: varchar({ length: 50 }).notNull().unique(),
    country: varchar({ length: 100 }).notNull(),
    phone: varchar({ length: 20 }).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
});

// NOTE: CHECK constraint for username format was removed due to drizzle-kit parsing issues
// Original constraint: usernameFormat: check("username_format", sql`${table.username} ~ '^[a-z0-9_]+$'`)
// This caused TypeError during schema introspection in drizzle-kit push command

export const schoolStudents = pgTable("school_students", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    schoolId: uuid().notNull().references(() => school.id),
    studentId: uuid().notNull().references(() => student.id),
    description: text(),
    active: boolean().default(true).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
}, (table) => ({
    uniqueStudentSchool: unique("unique_student_school").on(table.studentId, table.schoolId),
}));

export const schoolPackage = pgTable("school_package", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    durationMinutes: integer().notNull(),
    description: text(),
    pricePerStudent: integer().notNull(),
    capacityStudents: integer().notNull(),
    capacityEquipment: integer().notNull().default(1),
    categoryEquipment: equipmentCategoryEnum().notNull(),
    schoolId: uuid(),
    isPublic: boolean().notNull().default(true),
    active: boolean().notNull().default(true),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.schoolId],
        foreignColumns: [school.id],
        name: "school_package_school_id_fk",
    }),
    index("school_package_school_id_idx").on(table.schoolId),
]);

// Types
export type StudentType = typeof student.$inferSelect;
export type StudentForm = typeof student.$inferInsert;
export type SchoolType = typeof school.$inferSelect;
export type SchoolForm = typeof school.$inferInsert;
export type SchoolStudentType = typeof schoolStudents.$inferSelect;
export type SchoolStudentForm = typeof schoolStudents.$inferInsert;
export type SchoolPackageType = typeof schoolPackage.$inferSelect;
export type SchoolPackageForm = typeof schoolPackage.$inferInsert;
