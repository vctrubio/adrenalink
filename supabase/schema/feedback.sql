-- ============================================================================
-- Feedback & Other Domain Tables
-- Manages feedback, referrals, and other cross-cutting concerns
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
CREATE INDEX referral_code_idx ON referral(code);
