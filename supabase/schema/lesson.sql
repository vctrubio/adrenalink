-- ============================================================================
-- Lesson Tables
-- Manages lessons assigned to bookings
-- ============================================================================

CREATE TABLE lesson (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teacher(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
    commission_id UUID NOT NULL REFERENCES teacher_commission(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX lesson_school_id_idx ON lesson(school_id);
CREATE INDEX lesson_teacher_id_idx ON lesson(teacher_id);
CREATE INDEX lesson_booking_id_idx ON lesson(booking_id);
CREATE INDEX lesson_commission_id_idx ON lesson(commission_id);
