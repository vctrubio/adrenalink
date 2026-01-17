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
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE school_students (
    school_id UUID NOT NULL REFERENCES school(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,
    description TEXT,
    email VARCHAR(255),
    clerk_id VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT true,
    rental BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    PRIMARY KEY (school_id, student_id)
);

CREATE INDEX school_students_school_id_idx ON school_students(school_id);
CREATE INDEX school_students_student_id_idx ON school_students(student_id);
CREATE INDEX school_students_clerk_id_idx ON school_students(clerk_id);

CREATE TABLE student_package (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_package_id UUID NOT NULL REFERENCES school_package(id) ON DELETE CASCADE,
    referral_id UUID REFERENCES referral(id) ON DELETE SET NULL,
    wallet_id UUID NOT NULL,
    requested_date_start DATE NOT NULL,
    requested_date_end DATE NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX student_package_school_package_id_idx ON student_package(school_package_id);
CREATE INDEX student_package_referral_id_idx ON student_package(referral_id);

CREATE TABLE student_package_student (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_package_id UUID NOT NULL REFERENCES student_package(id),
    student_id UUID NOT NULL REFERENCES student(id),
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    UNIQUE(student_package_id, student_id)
);

CREATE INDEX student_package_student_package_id_idx ON student_package_student(student_package_id);
CREATE INDEX student_package_student_student_id_idx ON student_package_student(student_id);
