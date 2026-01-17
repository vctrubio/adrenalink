-- ============================================================================
-- Event Tables
-- Manages events within lessons
-- ============================================================================

CREATE TABLE event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX event_school_id_idx ON event(school_id);
CREATE INDEX event_lesson_id_idx ON event(lesson_id);
