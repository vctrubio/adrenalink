-- ============================================================================
-- School Domain Tables
-- Manages school accounts, packages, and subscriptions
-- ============================================================================

CREATE TABLE school (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status TEXT NOT NULL DEFAULT 'beta',
    currency TEXT NOT NULL DEFAULT 'EUR',
    latitude NUMERIC(12, 8),
    longitude NUMERIC(12, 8),
    timezone VARCHAR(50),
    google_place_id VARCHAR(255),
    equipment_categories TEXT,
    website_url VARCHAR(255),
    instagram_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE school_package (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    duration_minutes INTEGER NOT NULL,
    description TEXT NOT NULL,
    price_per_student INTEGER NOT NULL,
    capacity_students INTEGER NOT NULL DEFAULT 1,
    capacity_equipment INTEGER NOT NULL DEFAULT 1,
    category_equipment TEXT NOT NULL,
    package_type TEXT NOT NULL,
    school_id UUID REFERENCES school(id),
    is_public BOOLEAN NOT NULL DEFAULT true,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX school_package_school_id_idx ON school_package(school_id);

CREATE TABLE school_subscription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school(id),
    tier TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX school_subscription_school_id_idx ON school_subscription(school_id);
CREATE TABLE referral (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL,
    school_id UUID NOT NULL REFERENCES school(id),
    commission_type TEXT NOT NULL,
    commission_value VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX referral_school_id_idx ON referral(school_id);
CREATE INDEX referral_code_idx ON referral(code);-- ============================================================================
-- Student Domain Tables
-- Manages students, their packages, and associations with schools
-- ============================================================================

CREATE TABLE student (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    passport VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    languages TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE school_students (
    school_id UUID NOT NULL REFERENCES school(id),
    student_id UUID NOT NULL REFERENCES student(id),
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    rental BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (school_id, student_id)
);

CREATE INDEX school_students_school_id_idx ON school_students(school_id);
CREATE INDEX school_students_student_id_idx ON school_students(student_id);

CREATE TABLE student_package (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_package_id UUID NOT NULL REFERENCES school_package(id),
    referral_id UUID REFERENCES referral(id),
    wallet_id UUID NOT NULL,
    requested_date_start DATE NOT NULL,
    requested_date_end DATE NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX student_package_school_package_id_idx ON student_package(school_package_id);
CREATE INDEX student_package_referral_id_idx ON student_package(referral_id);
-- ============================================================================
-- Teacher Core Tables
-- Manages teachers and commissions
-- ============================================================================

CREATE TABLE teacher (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school(id),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    passport VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    languages TEXT[] NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX teacher_school_id_idx ON teacher(school_id);

CREATE TABLE teacher_commission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teacher(id),
    commission_type TEXT NOT NULL,
    cph VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX teacher_commission_teacher_id_idx ON teacher_commission(teacher_id);
-- ============================================================================
-- Booking Core Tables
-- Manages bookings and student associations
-- ============================================================================

CREATE TABLE booking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school(id),
    school_package_id UUID NOT NULL REFERENCES school_package(id),
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    leader_student_name VARCHAR(255) NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX booking_school_id_idx ON booking(school_id);
CREATE INDEX booking_school_package_id_idx ON booking(school_package_id);

CREATE TABLE booking_student (
    booking_id UUID NOT NULL REFERENCES booking(id),
    student_id UUID NOT NULL REFERENCES student(id),
    PRIMARY KEY (booking_id, student_id)
);

CREATE INDEX booking_student_booking_id_idx ON booking_student(booking_id);
CREATE INDEX booking_student_student_id_idx ON booking_student(student_id);
-- ============================================================================
-- Lesson Tables
-- Manages lessons assigned to bookings
-- ============================================================================

CREATE TABLE lesson (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school(id),
    teacher_id UUID NOT NULL REFERENCES teacher(id),
    booking_id UUID NOT NULL REFERENCES booking(id),
    commission_id UUID NOT NULL REFERENCES teacher_commission(id),
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX lesson_school_id_idx ON lesson(school_id);
CREATE INDEX lesson_teacher_id_idx ON lesson(teacher_id);
CREATE INDEX lesson_booking_id_idx ON lesson(booking_id);
CREATE INDEX lesson_commission_id_idx ON lesson(commission_id);
-- ============================================================================
-- Event Tables
-- Manages events within lessons
-- ============================================================================

CREATE TABLE event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school(id),
    lesson_id UUID NOT NULL REFERENCES lesson(id),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX event_school_id_idx ON event(school_id);
CREATE INDEX event_lesson_id_idx ON event(lesson_id);
-- ============================================================================
-- Equipment Domain Tables
-- Manages equipment inventory, repairs, and event assignments
-- ============================================================================

CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(255) NOT NULL,
    color VARCHAR(100),
    size NUMERIC(4, 1),
    status TEXT,
    school_id UUID NOT NULL REFERENCES school(id),
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX equipment_school_id_idx ON equipment(school_id);
CREATE INDEX equipment_category_idx ON equipment(category);

CREATE TABLE equipment_repair (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX equipment_repair_equipment_id_idx ON equipment_repair(equipment_id);

CREATE TABLE equipment_event (
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    event_id UUID NOT NULL REFERENCES event(id),
    PRIMARY KEY (equipment_id, event_id)
);

CREATE INDEX equipment_event_equipment_id_idx ON equipment_event(equipment_id);
CREATE INDEX equipment_event_event_id_idx ON equipment_event(event_id);
-- ============================================================================
-- Teacher Equipment Association
-- Links teachers to equipment after both are defined
-- ============================================================================

CREATE TABLE teacher_equipment (
    teacher_id UUID NOT NULL REFERENCES teacher(id),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (teacher_id, equipment_id)
);

CREATE INDEX teacher_equipment_teacher_id_idx ON teacher_equipment(teacher_id);
CREATE INDEX teacher_equipment_equipment_id_idx ON teacher_equipment(equipment_id);
-- ============================================================================
-- Rental Domain Tables
-- Manages equipment rentals with student and equipment relationships
-- ============================================================================

CREATE TABLE rental (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school(id),
    school_package_id UUID NOT NULL REFERENCES school_package(id),
    date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX rental_school_id_idx ON rental(school_id);
CREATE INDEX rental_school_package_id_idx ON rental(school_package_id);

CREATE TABLE rental_student (
    rental_id UUID NOT NULL REFERENCES rental(id),
    student_id UUID NOT NULL REFERENCES student(id),
    PRIMARY KEY (rental_id, student_id),
    UNIQUE (rental_id, student_id)
);

CREATE INDEX rental_student_rental_id_idx ON rental_student(rental_id);
CREATE INDEX rental_student_student_id_idx ON rental_student(student_id);

CREATE TABLE rental_equipment (
    rental_id UUID NOT NULL REFERENCES rental(id),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    PRIMARY KEY (rental_id, equipment_id),
    UNIQUE (rental_id, equipment_id)
);

CREATE INDEX rental_equipment_rental_id_idx ON rental_equipment(rental_id);
CREATE INDEX rental_equipment_equipment_id_idx ON rental_equipment(equipment_id);
-- ============================================================================
-- Feedback Domain Tables
-- Manages feedback and student assessments
-- ============================================================================

CREATE TABLE student_lesson_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student(id),
    lesson_id UUID NOT NULL REFERENCES lesson(id),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX student_lesson_feedback_student_id_idx ON student_lesson_feedback(student_id);
CREATE INDEX student_lesson_feedback_lesson_id_idx ON student_lesson_feedback(lesson_id);
-- ============================================================================
-- Payment Domain Tables
-- Manages teacher and student payments
-- ============================================================================

CREATE TABLE teacher_lesson_payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lesson(id),
    amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX teacher_lesson_payment_lesson_id_idx ON teacher_lesson_payment(lesson_id);

CREATE TABLE student_booking_payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES booking(id),
    student_id UUID NOT NULL REFERENCES student(id),
    amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX student_booking_payment_booking_id_idx ON student_booking_payment(booking_id);
CREATE INDEX student_booking_payment_student_id_idx ON student_booking_payment(student_id);

CREATE TABLE subscription_payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES school_subscription(id),
    amount INTEGER NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX subscription_payment_subscription_id_idx ON subscription_payment(subscription_id);
-- ============================================================================
-- Realtime Listeners (Event Listeners)
-- ============================================================================
-- Enable Realtime publication for booking, event, and lesson tables
-- Required for frontend real-time updates via Supabase Realtime subscriptions

ALTER PUBLICATION supabase_realtime ADD TABLE booking;
ALTER PUBLICATION supabase_realtime ADD TABLE event;
ALTER PUBLICATION supabase_realtime ADD TABLE lesson;
