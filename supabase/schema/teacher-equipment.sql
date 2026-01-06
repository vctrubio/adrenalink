-- ============================================================================
-- Teacher Equipment Association
-- Links teachers to equipment after both are defined
-- ============================================================================

CREATE TABLE teacher_equipment (
    teacher_id UUID NOT NULL REFERENCES teacher(id),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (teacher_id, equipment_id)
);

CREATE INDEX teacher_equipment_teacher_id_idx ON teacher_equipment(teacher_id);
CREATE INDEX teacher_equipment_equipment_id_idx ON teacher_equipment(equipment_id);
