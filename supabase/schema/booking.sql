-- ============================================================================
-- Booking Core Tables
-- Manages bookings and student associations
-- ============================================================================

CREATE TABLE booking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school(id) ON DELETE CASCADE,
    school_package_id UUID NOT NULL REFERENCES school_package(id) ON DELETE CASCADE,
    referral_id UUID REFERENCES referral(id) ON DELETE SET NULL,
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    leader_student_name VARCHAR(255) NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX booking_school_id_idx ON booking(school_id);
CREATE INDEX booking_school_package_id_idx ON booking(school_package_id);
CREATE INDEX booking_referral_id_idx ON booking(referral_id);

CREATE TABLE booking_student (
    booking_id UUID NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,
    student_package_id UUID REFERENCES student_package(id) ON DELETE SET NULL,
    PRIMARY KEY (booking_id, student_id)
);

CREATE INDEX booking_student_booking_id_idx ON booking_student(booking_id);
CREATE INDEX booking_student_student_id_idx ON booking_student(student_id);
