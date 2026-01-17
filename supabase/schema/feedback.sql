-- ============================================================================
-- Feedback Domain Tables
-- Manages feedback and student assessments
-- ============================================================================

CREATE TABLE student_lesson_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX student_lesson_feedback_student_id_idx ON student_lesson_feedback(student_id);
CREATE INDEX student_lesson_feedback_lesson_id_idx ON student_lesson_feedback(lesson_id);
