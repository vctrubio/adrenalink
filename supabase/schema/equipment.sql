-- ============================================================================
-- Equipment Domain Tables
-- Manages equipment inventory, repairs, and event assignments
-- ============================================================================

CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(255) NOT NULL,
    color VARCHAR(100),
    size NUMERIC(4, 1),
    status TEXT,
    school_id UUID NOT NULL REFERENCES school(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX equipment_school_id_idx ON equipment(school_id);
CREATE INDEX equipment_category_idx ON equipment(category);

CREATE TABLE equipment_repair (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX equipment_repair_equipment_id_idx ON equipment_repair(equipment_id);

CREATE TABLE equipment_event (
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    PRIMARY KEY (equipment_id, event_id)
);

CREATE INDEX equipment_event_equipment_id_idx ON equipment_event(equipment_id);
CREATE INDEX equipment_event_event_id_idx ON equipment_event(event_id);
