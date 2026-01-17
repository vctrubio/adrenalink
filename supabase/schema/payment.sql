-- ============================================================================
-- Payment Domain Tables
-- Manages teacher and student payments
-- ============================================================================

CREATE TABLE teacher_lesson_payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX teacher_lesson_payment_lesson_id_idx ON teacher_lesson_payment(lesson_id);

CREATE TABLE student_booking_payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX student_booking_payment_booking_id_idx ON student_booking_payment(booking_id);
CREATE INDEX student_booking_payment_student_id_idx ON student_booking_payment(student_id);

CREATE TABLE subscription_payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES school_subscription(id),
    amount INTEGER NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX subscription_payment_subscription_id_idx ON subscription_payment(subscription_id);
