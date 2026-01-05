-- ============================================================================
-- Booking Domain Tables
-- Manages bookings, student associations, and lesson/event creation
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
