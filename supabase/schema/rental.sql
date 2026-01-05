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
