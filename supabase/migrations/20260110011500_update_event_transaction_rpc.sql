-- enriched RPC for Transaction table with Timezone conversion and equipment enrichment
DROP FUNCTION IF EXISTS get_event_transaction(UUID);
DROP FUNCTION IF EXISTS get_event_transactions_batch(UUID[]);

CREATE OR REPLACE FUNCTION get_event_transaction(p_event_id UUID)
RETURNS TABLE (
    event_id UUID,
    lesson_id UUID,
    booking_id UUID,
    teacher_id UUID,
    school_id UUID,
    event_date TIMESTAMP, -- Using TIMESTAMP without zone to return the "wall clock" local time
    event_duration INTEGER,
    event_location VARCHAR,
    event_status TEXT,
    student_count INTEGER,
    leader_student_name VARCHAR,
    teacher_username VARCHAR,
    package_description TEXT,
    package_category_equipment TEXT,
    package_capacity_equipment INTEGER,
    package_capacity_students INTEGER,
    price_per_student INTEGER,
    commission_hourly NUMERIC,
    commission_type TEXT,
    gross_revenue NUMERIC,
    teacher_commission NUMERIC,
    net_revenue NUMERIC,
    students_json JSONB,
    equipments JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.lesson_id,
        b.id,
        l.teacher_id,
        e.school_id,
        (e.date AT TIME ZONE s.timezone)::TIMESTAMP, -- Convert UTC to school timezone
        e.duration,
        e.location,
        e.status,
        (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id)::INTEGER,
        b.leader_student_name,
        t.username,
        sp.description,
        sp.category_equipment,
        sp.capacity_equipment,
        sp.capacity_students,
        sp.price_per_student,
        tc.cph::NUMERIC,
        tc.commission_type,
        (sp.price_per_student * (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id))::NUMERIC,
        (tc.cph::NUMERIC * (e.duration::NUMERIC / 60))::NUMERIC,
        ((sp.price_per_student * (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id))::NUMERIC 
         - (tc.cph::NUMERIC * (e.duration::NUMERIC / 60)))::NUMERIC,
        COALESCE(
            (SELECT jsonb_agg(jsonb_build_object('id', s_inner.id, 'name', s_inner.first_name || ' ' || s_inner.last_name))
             FROM booking_student bs
             JOIN student s_inner ON bs.student_id = s_inner.id
             WHERE bs.booking_id = b.id),
            '[]'::jsonb
        ),
        COALESCE(
            (SELECT jsonb_agg(jsonb_build_object('id', eq.id, 'brand', eq.brand, 'model', eq.model, 'size', eq.size, 'category', eq.category, 'sku', eq.sku, 'color', eq.color))
             FROM equipment_event ee
             JOIN equipment eq ON ee.equipment_id = eq.id
             WHERE ee.event_id = e.id),
            '[]'::jsonb
        )
    FROM event e
    JOIN school s ON e.school_id = s.id -- Joined school to get the timezone
    JOIN lesson l ON e.lesson_id = l.id
    JOIN booking b ON l.booking_id = b.id
    JOIN school_package sp ON b.school_package_id = sp.id
    JOIN teacher_commission tc ON l.commission_id = tc.id
    JOIN teacher t ON l.teacher_id = t.id
    WHERE e.id = p_event_id;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_event_transactions_batch(p_event_ids UUID[])
RETURNS TABLE (
    event_id UUID,
    lesson_id UUID,
    booking_id UUID,
    teacher_id UUID,
    school_id UUID,
    event_date TIMESTAMP,
    event_duration INTEGER,
    event_location VARCHAR,
    event_status TEXT,
    student_count INTEGER,
    leader_student_name VARCHAR,
    teacher_username VARCHAR,
    package_description TEXT,
    package_category_equipment TEXT,
    package_capacity_equipment INTEGER,
    package_capacity_students INTEGER,
    price_per_student INTEGER,
    commission_hourly NUMERIC,
    commission_type TEXT,
    gross_revenue NUMERIC,
    teacher_commission NUMERIC,
    net_revenue NUMERIC,
    students_json JSONB,
    equipments JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.lesson_id,
        b.id,
        l.teacher_id,
        e.school_id,
        (e.date AT TIME ZONE s.timezone)::TIMESTAMP,
        e.duration,
        e.location,
        e.status,
        (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id)::INTEGER,
        b.leader_student_name,
        t.username,
        sp.description,
        sp.category_equipment,
        sp.capacity_equipment,
        sp.capacity_students,
        sp.price_per_student,
        tc.cph::NUMERIC,
        tc.commission_type,
        (sp.price_per_student * (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id))::NUMERIC,
        (tc.cph::NUMERIC * (e.duration::NUMERIC / 60))::NUMERIC,
        ((sp.price_per_student * (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id))::NUMERIC 
         - (tc.cph::NUMERIC * (e.duration::NUMERIC / 60)))::NUMERIC,
        COALESCE(
            (SELECT jsonb_agg(jsonb_build_object('id', s_inner.id, 'name', s_inner.first_name || ' ' || s_inner.last_name))
             FROM booking_student bs
             JOIN student s_inner ON bs.student_id = s_inner.id
             WHERE bs.booking_id = b.id),
            '[]'::jsonb
        ),
        COALESCE(
            (SELECT jsonb_agg(jsonb_build_object('id', eq.id, 'brand', eq.brand, 'model', eq.model, 'size', eq.size, 'category', eq.category, 'sku', eq.sku, 'color', eq.color))
             FROM equipment_event ee
             JOIN equipment eq ON ee.equipment_id = eq.id
             WHERE ee.event_id = e.id),
            '[]'::jsonb
        )
    FROM event e
    JOIN school s ON e.school_id = s.id
    JOIN lesson l ON e.lesson_id = l.id
    JOIN booking b ON l.booking_id = b.id
    JOIN school_package sp ON b.school_package_id = sp.id
    JOIN teacher_commission tc ON l.commission_id = tc.id
    JOIN teacher t ON l.teacher_id = t.id
    WHERE e.id = ANY(p_event_ids)
    ORDER BY e.date DESC;
END;
$$ LANGUAGE plpgsql STABLE;
