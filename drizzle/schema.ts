import { pgTable, uuid, timestamp, varchar, text, unique, boolean, integer, pgEnum, foreignKey, index, date, decimal } from "drizzle-orm/pg-core";

export const equipmentCategoryEnum = pgEnum("equipment_category", ["kite", "wing", "windsurf", "surf", "snowboard"]);
export const studentPackageStatusEnum = pgEnum("student_package_status", ["requested", "accepted", "rejected"]);

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
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 10, scale: 8 }),
    googlePlaceId: varchar("google_place_id", { length: 255 }),
    equipmentCategories: text("equipment_categories"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// NOTE: CHECK constraint for username format was removed due to drizzle-kit parsing issues
// Original constraint: usernameFormat: check("username_format", sql`${table.username} ~ '^[a-z0-9_]+$'`)
// This caused TypeError during schema introspection in drizzle-kit push command

export const schoolStudents = pgTable(
    "school_students",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        schoolId: uuid("school_id")
            .notNull()
            .references(() => school.id),
        studentId: uuid("student_id")
            .notNull()
            .references(() => student.id),
        description: text("description"),
        active: boolean("active").default(true).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        uniqueStudentSchool: unique("unique_student_school").on(table.studentId, table.schoolId),
    }),
);

export const schoolPackage = pgTable(
    "school_package",
    {
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
    },
    (table) => [
        foreignKey({
            columns: [table.schoolId],
            foreignColumns: [school.id],
            name: "school_package_school_id_fk",
        }),
        index("school_package_school_id_idx").on(table.schoolId),
    ],
);

export const studentPackage = pgTable(
    "student_package",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        studentId: uuid("student_id")
            .notNull()
            .references(() => student.id),
        packageId: uuid("package_id")
            .notNull()
            .references(() => schoolPackage.id),
        requestedDateStart: date("requested_date_start").notNull(),
        requestedDateEnd: date("requested_date_end").notNull(),
        status: studentPackageStatusEnum("status").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.studentId],
            foreignColumns: [student.id],
            name: "student_package_student_id_fk",
        }),
        foreignKey({
            columns: [table.packageId],
            foreignColumns: [schoolPackage.id],
            name: "student_package_package_id_fk",
        }),
        index("student_package_student_id_idx").on(table.studentId),
        index("student_package_package_id_idx").on(table.packageId),
    ],
);

export const booking = pgTable(
    "booking",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        packageId: uuid("package_id")
            .notNull()
            .references(() => schoolPackage.id),
        dateStart: date("date_start").notNull(),
        dateEnd: date("date_end").notNull(),
        schoolId: uuid("school_id").references(() => school.id),
        studentPackageId: uuid("student_package_id").references(() => studentPackage.id),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.packageId],
            foreignColumns: [schoolPackage.id],
            name: "booking_package_id_fk",
        }),
        foreignKey({
            columns: [table.schoolId],
            foreignColumns: [school.id],
            name: "booking_school_id_fk",
        }),
        foreignKey({
            columns: [table.studentPackageId],
            foreignColumns: [studentPackage.id],
            name: "booking_student_package_id_fk",
        }),
        index("booking_school_id_idx").on(table.schoolId),
        index("booking_package_id_idx").on(table.packageId),
        index("booking_student_package_id_idx").on(table.studentPackageId),
    ],
);

export const bookingStudent = pgTable(
    "booking_student",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        bookingId: uuid("booking_id")
            .notNull()
            .references(() => booking.id),
        studentId: uuid("student_id")
            .notNull()
            .references(() => student.id),
    },
    (table) => [
        foreignKey({
            columns: [table.bookingId],
            foreignColumns: [booking.id],
            name: "booking_student_booking_id_fk",
        }),
        foreignKey({
            columns: [table.studentId],
            foreignColumns: [student.id],
            name: "booking_student_student_id_fk",
        }),
        unique("booking_student_unique").on(table.bookingId, table.studentId),
        index("booking_student_booking_id_idx").on(table.bookingId),
        index("booking_student_student_id_idx").on(table.studentId),
    ],
);

// Types
export type StudentType = typeof student.$inferSelect;
export type StudentForm = typeof student.$inferInsert;
export type SchoolType = typeof school.$inferSelect;
export type SchoolForm = typeof school.$inferInsert;
export type SchoolStudentType = typeof schoolStudents.$inferSelect;
export type SchoolStudentForm = typeof schoolStudents.$inferInsert;
export type SchoolPackageType = typeof schoolPackage.$inferSelect;
export type SchoolPackageForm = typeof schoolPackage.$inferInsert;
export type StudentPackageType = typeof studentPackage.$inferSelect;
export type StudentPackageForm = typeof studentPackage.$inferInsert;
export type BookingType = typeof booking.$inferSelect;
export type BookingForm = typeof booking.$inferInsert;
export type BookingStudentType = typeof bookingStudent.$inferSelect;
export type BookingStudentForm = typeof bookingStudent.$inferInsert;
