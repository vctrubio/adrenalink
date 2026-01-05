-- ============================================================================
-- Pure SQL Schema for Adrenalink (replacing Drizzle ORM)
-- ============================================================================
-- Converted from drizzle/schema.ts - matches original exactly
-- Status/type fields use TEXT instead of PostgreSQL enums for flexibility
-- Enum validation moved to: supabase/db/enums.ts
-- ============================================================================

-- ============================================================================
-- 1. school
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

-- ============================================================================
-- 2. school_package
-- ============================================================================
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

-- ============================================================================
-- 3. equipment
-- ============================================================================
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) NOT NULL,
    model VARCHAR(255) NOT NULL,
    color VARCHAR(100),
    size INTEGER,
    status TEXT,
    school_id UUID NOT NULL REFERENCES school(id),
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX equipment_school_id_idx ON equipment(school_id);
CREATE INDEX equipment_category_idx ON equipment(category);

-- ============================================================================
-- 4. student
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

-- ============================================================================
-- 5. student_package
-- ============================================================================
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
CREATE INDEX student_package_wallet_id_idx ON student_package(wallet_id);

-- ============================================================================
-- 6. school_students
-- ============================================================================
CREATE TABLE school_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school(id),
    student_id UUID NOT NULL REFERENCES student(id),
    description TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    rental BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(student_id, school_id)
);

-- ============================================================================
-- 7. referral
-- ============================================================================
CREATE TABLE referral (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    school_id UUID NOT NULL REFERENCES school(id),
    description TEXT,
    commission_type TEXT NOT NULL DEFAULT 'fixed',
    commission_value NUMERIC(10, 2) NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- 8. teacher
-- ============================================================================
CREATE TABLE teacher (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL,
    passport VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    languages TEXT[] NOT NULL,
    school_id UUID NOT NULL REFERENCES school(id),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(school_id, username)
);

-- ============================================================================
-- 9. teacher_commission
-- ============================================================================
CREATE TABLE teacher_commission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teacher(id),
    commission_type TEXT NOT NULL,
    description TEXT,
    cph NUMERIC(10, 2) NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- 10. booking
-- ============================================================================
CREATE TABLE booking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    school_id UUID NOT NULL REFERENCES school(id),
    school_package_id UUID NOT NULL REFERENCES school_package(id),
    leader_student_name VARCHAR(255) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX booking_school_id_idx ON booking(school_id);
CREATE INDEX booking_school_package_id_idx ON booking(school_package_id);

-- ============================================================================
-- 11. booking_student
-- ============================================================================
CREATE TABLE booking_student (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES booking(id),
    student_id UUID NOT NULL REFERENCES student(id),
    UNIQUE(booking_id, student_id)
);

CREATE INDEX booking_student_booking_id_idx ON booking_student(booking_id);
CREATE INDEX booking_student_student_id_idx ON booking_student(student_id);

-- ============================================================================
-- 12. lesson
-- ============================================================================
CREATE TABLE lesson (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES school(id),
    teacher_id UUID NOT NULL REFERENCES teacher(id),
    booking_id UUID NOT NULL REFERENCES booking(id),
    commission_id UUID NOT NULL REFERENCES teacher_commission(id),
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX lesson_school_id_idx ON lesson(school_id);
CREATE INDEX lesson_teacher_booking_id_idx ON lesson(teacher_id, booking_id);

-- ============================================================================
-- 13. event
-- ============================================================================
CREATE TABLE event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES school(id),
    lesson_id UUID NOT NULL REFERENCES lesson(id),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL,
    location VARCHAR(100),
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX event_school_id_idx ON event(school_id);
CREATE INDEX event_lesson_id_idx ON event(lesson_id);

-- ============================================================================
-- 14. equipment_event
-- ============================================================================
CREATE TABLE equipment_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    event_id UUID NOT NULL REFERENCES event(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(equipment_id, event_id)
);

CREATE INDEX equipment_event_equipment_id_idx ON equipment_event(equipment_id);
CREATE INDEX equipment_event_event_id_idx ON equipment_event(event_id);

-- ============================================================================
-- 15. equipment_repair
-- ============================================================================
CREATE TABLE equipment_repair (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    check_in DATE NOT NULL,
    check_out DATE,
    price INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX equipment_repair_equipment_id_idx ON equipment_repair(equipment_id);

-- ============================================================================
-- 16. student_lesson_feedback
-- ============================================================================
CREATE TABLE student_lesson_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student(id),
    lesson_id UUID NOT NULL REFERENCES lesson(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(student_id, lesson_id)
);

-- ============================================================================
-- 17. rental
-- ============================================================================
CREATE TABLE rental (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_package_id UUID NOT NULL REFERENCES school_package(id),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX rental_school_package_id_idx ON rental(school_package_id);

-- ============================================================================
-- 17b. rental_student (many-to-many)
-- ============================================================================
CREATE TABLE rental_student (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_id UUID NOT NULL REFERENCES rental(id),
    student_id UUID NOT NULL REFERENCES student(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(rental_id, student_id)
);

CREATE INDEX rental_student_rental_id_idx ON rental_student(rental_id);
CREATE INDEX rental_student_student_id_idx ON rental_student(student_id);

-- ============================================================================
-- 17c. rental_equipment (many-to-many)
-- ============================================================================
CREATE TABLE rental_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_id UUID NOT NULL REFERENCES rental(id),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(rental_id, equipment_id)
);

CREATE INDEX rental_equipment_rental_id_idx ON rental_equipment(rental_id);
CREATE INDEX rental_equipment_equipment_id_idx ON rental_equipment(equipment_id);

-- ============================================================================
-- 18. teacher_equipment
-- ============================================================================
CREATE TABLE teacher_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teacher(id),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(teacher_id, equipment_id)
);

-- ============================================================================
-- 19. teacher_lesson_payment
-- ============================================================================
CREATE TABLE teacher_lesson_payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount INTEGER NOT NULL,
    lesson_id UUID NOT NULL REFERENCES lesson(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX payment_lesson_id_idx ON teacher_lesson_payment(lesson_id);

-- ============================================================================
-- 20. student_booking_payment
-- ============================================================================
CREATE TABLE student_booking_payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount INTEGER NOT NULL,
    booking_id UUID NOT NULL REFERENCES booking(id),
    student_id UUID NOT NULL REFERENCES student(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX student_payment_booking_id_idx ON student_booking_payment(booking_id);
CREATE INDEX student_payment_student_id_idx ON student_booking_payment(student_id);

-- ============================================================================
-- 21. school_subscription
-- ============================================================================
CREATE TABLE school_subscription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school(id),
    tier TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX school_subscription_school_id_idx ON school_subscription(school_id);

-- ============================================================================
-- 22. subscription_payment
-- ============================================================================
CREATE TABLE subscription_payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES school_subscription(id),
    amount INTEGER NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX subscription_payment_subscription_id_idx ON subscription_payment(subscription_id);

-- ============================================================================
-- Realtime Listeners (Event Listeners)
-- ============================================================================
-- Enable Realtime publication for booking, event, and lesson tables
-- Required for frontend real-time updates via Supabase Realtime subscriptions

ALTER PUBLICATION supabase_realtime ADD TABLE booking;
ALTER PUBLICATION supabase_realtime SET (publish = 'insert,update,delete') FOR TABLE booking;

ALTER PUBLICATION supabase_realtime ADD TABLE event;
ALTER PUBLICATION supabase_realtime SET (publish = 'insert,update,delete') FOR TABLE event;

ALTER PUBLICATION supabase_realtime ADD TABLE lesson;
ALTER PUBLICATION supabase_realtime SET (publish = 'insert,update,delete') FOR TABLE lesson;

-- ============================================================================
-- RLS (Row Level Security) Policies
-- ============================================================================
-- Enable RLS on all tables (optional - adjust based on auth strategy)
-- ALTER TABLE school ENABLE ROW LEVEL SECURITY;
-- ... (add RLS policies as needed)
