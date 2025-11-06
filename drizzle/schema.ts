import { pgTable, uuid, timestamp, varchar, text, unique, boolean, integer, pgEnum, foreignKey, index, date, decimal } from "drizzle-orm/pg-core";

// ENUMS
export const equipmentCategoryEnum = pgEnum("equipment_category", ["kite", "wing", "windsurf"]);
export const studentPackageStatusEnum = pgEnum("student_package_status", ["requested", "accepted", "rejected"]);
export const schoolStatusEnum = pgEnum("school_status", ["active", "pending", "closed"]);
export const commissionTypeEnum = pgEnum("commission_type", ["fixed", "percentage"]);
export const equipmentStatusEnum = pgEnum("equipment_status", ["rental", "public", "selling", "sold", "inrepair", "rip"]);
export const lessonStatusEnum = pgEnum("lesson_status", ["active", "rest", "completed", "uncompleted"]);
export const eventStatusEnum = pgEnum("event_status", ["planned", "tbc", "completed", "uncompleted"]);
export const rentalStatusEnum = pgEnum("rental_status", ["planned", "completed", "cancelled"]);
export const packageTypeEnum = pgEnum("package_type", ["rental", "lessons"]);
export const languagesEnum = pgEnum("languages", ["Spanish", "French", "English", "German", "Italian"]);
export const bookingStatusEnum = pgEnum("booking_status", ["active", "completed", "uncompleted"]);

// 1. school
export const school = pgTable("school", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    country: varchar("country", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    status: schoolStatusEnum("status").notNull().default("pending"),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 10, scale: 8 }),
    googlePlaceId: varchar("google_place_id", { length: 255 }),
    equipmentCategories: text("equipment_categories"),
    websiteUrl: varchar("website_url", { length: 255 }),
    instagramUrl: varchar("instagram_url", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. school_package
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
        packageType: packageTypeEnum("package_type").notNull(),
        schoolId: uuid("school_id").references(() => school.id),
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

// 3. equipment
export const equipment = pgTable(
    "equipment",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        sku: varchar("sku", { length: 100 }).notNull(),
        model: varchar("model", { length: 255 }).notNull(),
        color: varchar("color", { length: 100 }),
        size: integer("size"),
        status: equipmentStatusEnum("status"),
        schoolId: uuid("school_id")
            .notNull()
            .references(() => school.id),
        category: equipmentCategoryEnum("category").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [index("equipment_school_id_idx").on(table.schoolId), index("equipment_category_idx").on(table.category)],
);

// 4. student
export const student = pgTable("student", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    passport: varchar("passport", { length: 50 }).notNull().unique(),
    country: varchar("country", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    languages: text("languages").array().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 5. student_package
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
        referralId: uuid("referral_id").references(() => referral.id),
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
        foreignKey({
            columns: [table.referralId],
            foreignColumns: [referral.id],
            name: "student_package_referral_id_fk",
        }),
        index("student_package_student_id_idx").on(table.studentId),
        index("student_package_package_id_idx").on(table.packageId),
        index("student_package_referral_id_idx").on(table.referralId),
    ],
);

// 6. school_students
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
        rental: boolean("rental").default(false).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        uniqueStudentSchool: unique("unique_student_school").on(table.studentId, table.schoolId),
    }),
);

// 7. referral
export const referral = pgTable("referral", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    schoolId: uuid("school_id")
        .notNull()
        .references(() => school.id),
    description: text("description"),
    commissionType: commissionTypeEnum("commission_type").notNull().default("fixed"),
    commissionValue: decimal("commission_value", { precision: 10, scale: 2 }).notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 8. teacher
export const teacher = pgTable(
    "teacher",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        firstName: varchar("first_name", { length: 255 }).notNull(),
        lastName: varchar("last_name", { length: 255 }).notNull(),
        username: varchar("username", { length: 50 }).notNull(),
        passport: varchar("passport", { length: 50 }).notNull().unique(),
        country: varchar("country", { length: 100 }).notNull(),
        phone: varchar("phone", { length: 20 }).notNull(),
        languages: text("languages").array().notNull(),
        schoolId: uuid("school_id")
            .notNull()
            .references(() => school.id),
        active: boolean("active").default(true).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [unique("unique_teacher_username_school").on(table.schoolId, table.username)],
);

// 9. teacher_commission
export const teacherCommission = pgTable("teacher_commission", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    teacherId: uuid("teacher_id")
        .notNull()
        .references(() => teacher.id),
    commissionType: commissionTypeEnum("commission_type").notNull(),
    description: text("description"),
    cph: decimal("cph", { precision: 10, scale: 2 }).notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 10. booking
export const booking = pgTable(
    "booking",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        dateStart: date("date_start").notNull(),
        dateEnd: date("date_end").notNull(),
        schoolId: uuid("school_id").references(() => school.id),
        studentPackageId: uuid("student_package_id").references(() => studentPackage.id),
        // status: bookingStatusEnum("status").notNull().default("active"), // TODO: Add via migration
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
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
        index("booking_student_package_id_idx").on(table.studentPackageId),
    ],
);

// 11. booking_student
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

// 12. lesson
export const lesson = pgTable(
    "lesson",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        teacherId: uuid("teacher_id")
            .notNull()
            .references(() => teacher.id),
        bookingId: uuid("booking_id")
            .notNull()
            .references(() => booking.id),
        commissionId: uuid("commission_id")
            .notNull()
            .references(() => teacherCommission.id),
        status: lessonStatusEnum("status").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.teacherId],
            foreignColumns: [teacher.id],
            name: "lesson_teacher_id_fk",
        }),
        foreignKey({
            columns: [table.bookingId],
            foreignColumns: [booking.id],
            name: "lesson_booking_id_fk",
        }),
        foreignKey({
            columns: [table.commissionId],
            foreignColumns: [teacherCommission.id],
            name: "lesson_commission_id_fk",
        }),
        index("lesson_teacher_booking_id_idx").on(table.teacherId, table.bookingId),
    ],
);

// 13. event
export const event = pgTable(
    "event",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        lessonId: uuid("lesson_id")
            .notNull()
            .references(() => lesson.id),
        date: timestamp("date").notNull(),
        duration: integer("duration").notNull(),
        location: varchar("location", { length: 100 }),
        status: eventStatusEnum("status").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.lessonId],
            foreignColumns: [lesson.id],
            name: "event_lesson_id_fk",
        }),
        index("event_lesson_id_idx").on(table.lessonId),
    ],
);

// 14. equipment_event
export const equipmentEvent = pgTable(
    "equipment_event",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        equipmentId: uuid("equipment_id")
            .notNull()
            .references(() => equipment.id),
        eventId: uuid("event_id")
            .notNull()
            .references(() => event.id),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [unique("unique_equipment_event").on(table.equipmentId, table.eventId), index("equipment_event_equipment_id_idx").on(table.equipmentId), index("equipment_event_event_id_idx").on(table.eventId)],
);

// 15. equipment_repair
export const equipmentRepair = pgTable(
    "equipment_repair",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        equipmentId: uuid("equipment_id")
            .notNull()
            .references(() => equipment.id),
        checkIn: date("check_in").notNull(),
        checkOut: date("check_out"),
        price: integer("price").notNull(),
        description: text("description"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [index("equipment_repair_equipment_id_idx").on(table.equipmentId)],
);

// 16. student_lesson_feedback
export const studentLessonFeedback = pgTable(
    "student_lesson_feedback",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        studentId: uuid("student_id")
            .notNull()
            .references(() => student.id),
        lessonId: uuid("lesson_id")
            .notNull()
            .references(() => lesson.id),
        description: text("description"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [unique("unique_student_lesson_feedback").on(table.studentId, table.lessonId)],
);

// 17. rental (formerly eventRental)
export const rental = pgTable(
    "rental",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        date: timestamp("date").notNull(),
        duration: integer("duration").notNull(),
        location: varchar("location", { length: 255 }).notNull(),
        status: rentalStatusEnum("status").notNull(),
        studentId: uuid("student_id")
            .notNull()
            .references(() => student.id),
        equipmentId: uuid("equipment_id")
            .notNull()
            .references(() => equipment.id),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [index("rental_student_id_idx").on(table.studentId), index("rental_equipment_id_idx").on(table.equipmentId)],
);

// 18. link equipment to teacher
export const teacherEquipment = pgTable(
    "teacher_equipment",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        teacherId: uuid("teacher_id")
            .notNull()
            .references(() => teacher.id),
        equipmentId: uuid("equipment_id")
            .notNull()
            .references(() => equipment.id),
        active: boolean("active").default(true).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [unique("unique_teacher_equipment").on(table.teacherId, table.equipmentId)],
);

// 19. teacher_lesson_payment
export const teacherLessonPayment = pgTable(
    "teacher_lesson_payment",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        amount: integer("amount").notNull(),
        lessonId: uuid("lesson_id").notNull().references(() => lesson.id),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("payment_lesson_id_idx").on(table.lessonId),
    ],
);

export type StudentType = typeof student.$inferSelect;
export type StudentForm = typeof student.$inferInsert;
export type SchoolType = typeof school.$inferSelect;
export type SchoolForm = typeof school.$inferInsert;
export type SchoolStudentType = typeof schoolStudents.$inferSelect;
export type SchoolStudentForm = typeof schoolStudents.$inferInsert;
export type SchoolPackageType = typeof schoolPackage.$inferSelect;
export type SchoolPackageForm = typeof schoolPackage.$inferInsert;
export type TeacherType = typeof teacher.$inferSelect;
export type TeacherForm = typeof teacher.$inferInsert;
export type TeacherCommissionType = typeof teacherCommission.$inferSelect;
export type TeacherCommissionForm = typeof teacherCommission.$inferInsert;
export type ReferralType = typeof referral.$inferSelect;
export type ReferralForm = typeof referral.$inferInsert;
export type EquipmentType = typeof equipment.$inferSelect;
export type EquipmentForm = typeof equipment.$inferInsert;
export type TeacherEquipmentType = typeof teacherEquipment.$inferSelect;
export type TeacherEquipmentForm = typeof teacherEquipment.$inferInsert;
export type EquipmentRepairType = typeof equipmentRepair.$inferSelect;
export type EquipmentRepairForm = typeof equipmentRepair.$inferInsert;
export type LessonType = typeof lesson.$inferSelect;
export type LessonForm = typeof lesson.$inferInsert;
export type EventType = typeof event.$inferSelect;
export type EventForm = typeof event.$inferInsert;
export type StudentLessonFeedbackType = typeof studentLessonFeedback.$inferSelect;
export type StudentLessonFeedbackForm = typeof studentLessonFeedback.$inferInsert;
export type RentalType = typeof rental.$inferSelect;
export type RentalForm = typeof rental.$inferInsert;
export type EquipmentEventType = typeof equipmentEvent.$inferSelect;
export type EquipmentEventForm = typeof equipmentEvent.$inferInsert;
export type StudentPackageType = typeof studentPackage.$inferSelect;
export type StudentPackageForm = typeof studentPackage.$inferInsert;
export type BookingType = typeof booking.$inferSelect;
export type BookingForm = typeof booking.$inferInsert;
export type BookingStudentType = typeof bookingStudent.$inferSelect;
export type BookingStudentForm = typeof bookingStudent.$inferInsert;
export type TeacherLessonPaymentType = typeof teacherLessonPayment.$inferSelect;
export type TeacherLessonPaymentForm = typeof teacherLessonPayment.$inferInsert;
