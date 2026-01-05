-- ============================================================================
-- Student Domain Tables
-- Manages students, their packages, and associations with schools
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

CREATE TABLE school_students (
    school_id UUID NOT NULL REFERENCES school(id),
    student_id UUID NOT NULL REFERENCES student(id),
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    rental BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (school_id, student_id)
);

CREATE INDEX school_students_school_id_idx ON school_students(school_id);
CREATE INDEX school_students_student_id_idx ON school_students(student_id);

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
