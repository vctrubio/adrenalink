import { pgTable, uuid, timestamp, varchar, text, unique, check, boolean, integer, pgEnum, foreignKey, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const equipmentCategoryEnum = pgEnum("equipment_category", ["kite", "wing", "windsurf", "surf", "snowboard"]);

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

// NOTE: CHECK constraint for username format was removed due to drizzle-kit parsing issues
// Original constraint: usernameFormat: check("username_format", sql`${table.username} ~ '^[a-z0-9_]+$'`)
// This caused TypeError during schema introspection in drizzle-kit push command

export const schoolStudents = pgTable("school_students", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    schoolId: uuid("school_id").notNull().references(() => school.id),
    studentId: uuid("student_id").notNull().references(() => student.id),
    description: text("description"),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    uniqueStudentSchool: unique("unique_student_school").on(table.studentId, table.schoolId),
}));

export const schoolPackage = pgTable("school_package", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    description: text("description"),
    pricePerStudent: integer("price_per_student").notNull(),
    capacityStudents: integer("capacity_students").notNull(),
    capacityEquipment: integer("capacity_equipment").notNull().default(1),
    categoryEquipment: equipmentCategoryEnum("category_equipment").notNull(),
    schoolId: uuid("school_id"),
    isPublic: boolean("is_public").notNull().default(true),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
