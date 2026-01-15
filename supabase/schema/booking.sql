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


/*
- we will add referal id to booking
- add student_package optional)) to booking_student so we know if booking comes from student package or direclty school package, this will determine to see who booked the student

*/
