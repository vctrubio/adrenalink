-- ============================================================================
-- Teacher Domain Tables
-- Manages teachers, commissions, and their equipment assignments
-- ============================================================================

CREATE TABLE teacher (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES school(id),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    passport VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    languages TEXT[] NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX teacher_school_id_idx ON teacher(school_id);

CREATE TABLE teacher_commission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teacher(id),
    commission_type TEXT NOT NULL,
    cph VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX teacher_commission_teacher_id_idx ON teacher_commission(teacher_id);

CREATE TABLE teacher_equipment (
    teacher_id UUID NOT NULL REFERENCES teacher(id),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (teacher_id, equipment_id)
);

CREATE INDEX teacher_equipment_teacher_id_idx ON teacher_equipment(teacher_id);
CREATE INDEX teacher_equipment_equipment_id_idx ON teacher_equipment(equipment_id);
