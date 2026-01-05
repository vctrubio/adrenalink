/**
 * Supabase Relations Map
 * 
 * Documents all foreign key relationships between tables.
 * Used for understanding joins, building queries, and API documentation.
 * 
 * Unlike Drizzle, Supabase uses PostgREST which infers relationships from FKs.
 * This file is a reference and can be used to generate complex queries.
 */

/**
 * Relationship Graph
 * 
 * One-to-Many (parent -> child):
 * - school -> school_package
 * - school -> equipment
 * - school -> booking
 * - school -> teacher
 * - school -> school_subscription
 * - school_package -> student_package
 * - student_package -> rental (via wallet_id - implicit)
 * - booking -> booking_student
 * - booking -> lesson
 * - lesson -> event
 * - lesson -> teacher_lesson_payment
 * - event -> equipment_event
 * - teacher -> teacher_commission
 * - teacher -> teacher_equipment
 * - equipment -> equipment_event
 * - equipment -> equipment_repair
 * - equipment -> rental_equipment
 * - rental -> rental_student
 * - rental -> rental_equipment
 * - school_subscription -> subscription_payment
 * 
 * Many-to-Many (junction tables):
 * - school_students (school <-> student)
 * - booking_student (booking <-> student)
 * - teacher_equipment (teacher <-> equipment)
 * - equipment_event (equipment <-> event)
 * - rental_student (rental <-> student)
 * - rental_equipment (rental <-> equipment)
 */

/**
 * Table Relationships Definition
 * 
 * Each entry describes:
 * - table: The table name
 * - foreign_keys: Array of {column, references_table, references_column}
 * - one_to_many: Array of {table, via_column}
 * - many_to_many: Array of {through_table, parent_column, child_column}
 */
export const relations = {
    school: {
        table: "school",
        primary_key: "id",
        foreign_keys: [],
        one_to_many: [
            { table: "school_package", via_column: "school_id" },
            { table: "equipment", via_column: "school_id" },
            { table: "booking", via_column: "school_id" },
            { table: "teacher", via_column: "school_id" },
            { table: "lesson", via_column: "school_id" },
            { table: "event", via_column: "school_id" },
            { table: "referral", via_column: "school_id" },
            { table: "school_subscription", via_column: "school_id" },
        ],
        many_to_many: [
            { through_table: "school_students", parent_column: "school_id", child_table: "student", child_column: "student_id" },
        ],
    },

    school_package: {
        table: "school_package",
        primary_key: "id",
        foreign_keys: [{ column: "school_id", references_table: "school", references_column: "id" }],
        one_to_many: [{ table: "student_package", via_column: "school_package_id" }],
    },

    student: {
        table: "student",
        primary_key: "id",
        foreign_keys: [],
        one_to_many: [
            { table: "booking_student", via_column: "student_id" },
            { table: "student_booking_payment", via_column: "student_id" },
            { table: "student_lesson_feedback", via_column: "student_id" },
        ],
        many_to_many: [
            { through_table: "school_students", parent_column: "student_id", child_table: "school", child_column: "school_id" },
            { through_table: "booking_student", parent_column: "student_id", child_table: "booking", child_column: "booking_id" },
            { through_table: "rental_student", parent_column: "student_id", child_table: "rental", child_column: "rental_id" },
        ],
    },

    school_students: {
        table: "school_students",
        primary_key: ["school_id", "student_id"],
        foreign_keys: [
            { column: "school_id", references_table: "school", references_column: "id" },
            { column: "student_id", references_table: "student", references_column: "id" },
        ],
        junction_table: true,
    },

    student_package: {
        table: "student_package",
        primary_key: "id",
        foreign_keys: [
            { column: "school_package_id", references_table: "school_package", references_column: "id" },
            { column: "referral_id", references_table: "referral", references_column: "id" },
        ],
    },

    referral: {
        table: "referral",
        primary_key: "id",
        foreign_keys: [{ column: "school_id", references_table: "school", references_column: "id" }],
        one_to_many: [{ table: "student_package", via_column: "referral_id" }],
    },

    teacher: {
        table: "teacher",
        primary_key: "id",
        foreign_keys: [{ column: "school_id", references_table: "school", references_column: "id" }],
        one_to_many: [
            { table: "teacher_commission", via_column: "teacher_id" },
            { table: "lesson", via_column: "teacher_id" },
            { table: "teacher_equipment", via_column: "teacher_id" },
        ],
        many_to_many: [
            { through_table: "teacher_equipment", parent_column: "teacher_id", child_table: "equipment", child_column: "equipment_id" },
        ],
    },

    teacher_commission: {
        table: "teacher_commission",
        primary_key: "id",
        foreign_keys: [{ column: "teacher_id", references_table: "teacher", references_column: "id" }],
        one_to_many: [{ table: "lesson", via_column: "commission_id" }],
    },

    teacher_equipment: {
        table: "teacher_equipment",
        primary_key: ["teacher_id", "equipment_id"],
        foreign_keys: [
            { column: "teacher_id", references_table: "teacher", references_column: "id" },
            { column: "equipment_id", references_table: "equipment", references_column: "id" },
        ],
        junction_table: true,
    },

    equipment: {
        table: "equipment",
        primary_key: "id",
        foreign_keys: [{ column: "school_id", references_table: "school", references_column: "id" }],
        one_to_many: [
            { table: "equipment_event", via_column: "equipment_id" },
            { table: "equipment_repair", via_column: "equipment_id" },
            { table: "rental_equipment", via_column: "equipment_id" },
            { table: "teacher_equipment", via_column: "equipment_id" },
        ],
        many_to_many: [
            { through_table: "teacher_equipment", parent_column: "equipment_id", child_table: "teacher", child_column: "teacher_id" },
            { through_table: "equipment_event", parent_column: "equipment_id", child_table: "event", child_column: "event_id" },
            { through_table: "rental_equipment", parent_column: "equipment_id", child_table: "rental", child_column: "rental_id" },
        ],
    },

    equipment_repair: {
        table: "equipment_repair",
        primary_key: "id",
        foreign_keys: [{ column: "equipment_id", references_table: "equipment", references_column: "id" }],
    },

    booking: {
        table: "booking",
        primary_key: "id",
        foreign_keys: [
            { column: "school_id", references_table: "school", references_column: "id" },
            { column: "school_package_id", references_table: "school_package", references_column: "id" },
        ],
        one_to_many: [
            { table: "booking_student", via_column: "booking_id" },
            { table: "lesson", via_column: "booking_id" },
            { table: "student_booking_payment", via_column: "booking_id" },
        ],
        many_to_many: [
            { through_table: "booking_student", parent_column: "booking_id", child_table: "student", child_column: "student_id" },
        ],
    },

    booking_student: {
        table: "booking_student",
        primary_key: ["booking_id", "student_id"],
        foreign_keys: [
            { column: "booking_id", references_table: "booking", references_column: "id" },
            { column: "student_id", references_table: "student", references_column: "id" },
        ],
        junction_table: true,
    },

    lesson: {
        table: "lesson",
        primary_key: "id",
        foreign_keys: [
            { column: "school_id", references_table: "school", references_column: "id" },
            { column: "teacher_id", references_table: "teacher", references_column: "id" },
            { column: "booking_id", references_table: "booking", references_column: "id" },
            { column: "commission_id", references_table: "teacher_commission", references_column: "id" },
        ],
        one_to_many: [
            { table: "event", via_column: "lesson_id" },
            { table: "teacher_lesson_payment", via_column: "lesson_id" },
            { table: "student_lesson_feedback", via_column: "lesson_id" },
        ],
    },

    event: {
        table: "event",
        primary_key: "id",
        foreign_keys: [
            { column: "school_id", references_table: "school", references_column: "id" },
            { column: "lesson_id", references_table: "lesson", references_column: "id" },
        ],
        one_to_many: [{ table: "equipment_event", via_column: "event_id" }],
        many_to_many: [
            { through_table: "equipment_event", parent_column: "event_id", child_table: "equipment", child_column: "equipment_id" },
        ],
    },

    equipment_event: {
        table: "equipment_event",
        primary_key: ["equipment_id", "event_id"],
        foreign_keys: [
            { column: "equipment_id", references_table: "equipment", references_column: "id" },
            { column: "event_id", references_table: "event", references_column: "id" },
        ],
        junction_table: true,
    },

    rental: {
        table: "rental",
        primary_key: "id",
        foreign_keys: [
            { column: "school_id", references_table: "school", references_column: "id" },
            { column: "school_package_id", references_table: "school_package", references_column: "id" },
        ],
        one_to_many: [
            { table: "rental_student", via_column: "rental_id" },
            { table: "rental_equipment", via_column: "rental_id" },
        ],
        many_to_many: [
            { through_table: "rental_student", parent_column: "rental_id", child_table: "student", child_column: "student_id" },
            { through_table: "rental_equipment", parent_column: "rental_id", child_table: "equipment", child_column: "equipment_id" },
        ],
    },

    rental_student: {
        table: "rental_student",
        primary_key: ["rental_id", "student_id"],
        foreign_keys: [
            { column: "rental_id", references_table: "rental", references_column: "id" },
            { column: "student_id", references_table: "student", references_column: "id" },
        ],
        junction_table: true,
    },

    rental_equipment: {
        table: "rental_equipment",
        primary_key: ["rental_id", "equipment_id"],
        foreign_keys: [
            { column: "rental_id", references_table: "rental", references_column: "id" },
            { column: "equipment_id", references_table: "equipment", references_column: "id" },
        ],
        junction_table: true,
    },

    student_lesson_feedback: {
        table: "student_lesson_feedback",
        primary_key: "id",
        foreign_keys: [
            { column: "student_id", references_table: "student", references_column: "id" },
            { column: "lesson_id", references_table: "lesson", references_column: "id" },
        ],
    },

    teacher_lesson_payment: {
        table: "teacher_lesson_payment",
        primary_key: "id",
        foreign_keys: [{ column: "lesson_id", references_table: "lesson", references_column: "id" }],
    },

    student_booking_payment: {
        table: "student_booking_payment",
        primary_key: "id",
        foreign_keys: [
            { column: "booking_id", references_table: "booking", references_column: "id" },
            { column: "student_id", references_table: "student", references_column: "id" },
        ],
    },

    school_subscription: {
        table: "school_subscription",
        primary_key: "id",
        foreign_keys: [{ column: "school_id", references_table: "school", references_column: "id" }],
        one_to_many: [{ table: "subscription_payment", via_column: "subscription_id" }],
    },

    subscription_payment: {
        table: "subscription_payment",
        primary_key: "id",
        foreign_keys: [{ column: "subscription_id", references_table: "school_subscription", references_column: "id" }],
    },
} as const;

/**
 * Query Helper Functions
 * 
 * These help build PostgREST queries with proper joins
 */

export const getTableRelation = (tableName: string) => {
    return (relations as Record<string, any>)[tableName];
};

export const getTableForeignKeys = (tableName: string) => {
    const table = getTableRelation(tableName);
    return table?.foreign_keys || [];
};

export const getTableOneToMany = (tableName: string) => {
    const table = getTableRelation(tableName);
    return table?.one_to_many || [];
};

export const getTableManyToMany = (tableName: string) => {
    const table = getTableRelation(tableName);
    return table?.many_to_many || [];
};

/**
 * Example Usage:
 * 
 * // Get all schools with their packages
 * const schoolsWithPackages = await supabase
 *   .from('school')
 *   .select(`
 *     *,
 *     school_package(*)
 *   `)
 * 
 * // Get booking with students and lessons
 * const booking = await supabase
 *   .from('booking')
 *   .select(`
 *     *,
 *     booking_student(student_id),
 *     lesson(*)
 *   `)
 *   .eq('id', bookingId)
 *   .single()
 * 
 * // Get teacher with equipment and lessons
 * const teacher = await supabase
 *   .from('teacher')
 *   .select(`
 *     *,
 *     teacher_equipment(equipment_id),
 *     lesson(*)
 *   `)
 *   .eq('id', teacherId)
 *   .single()
 */
