-- migration to add get_teacher_events RPC
CREATE OR REPLACE FUNCTION get_teacher_events(p_teacher_id UUID, p_school_id UUID DEFAULT NULL)
RETURNS TABLE (
    event_id UUID,
    event_date TIMESTAMP,
    event_duration INTEGER,
    event_location VARCHAR,
    event_status TEXT,
    booking_id UUID,
    leader_student_name VARCHAR,
    student_count INTEGER,
    students_json JSONB,
    package_id UUID,
    package_description TEXT,
    package_duration_minutes INTEGER,
    package_price_per_student INTEGER,
    package_category_equipment TEXT,
    package_capacity_equipment INTEGER,
    package_capacity_students INTEGER,
    commission_id UUID,
    commission_type TEXT,
    commission_cph VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.date,
        e.duration,
        e.location,
        e.status,
        b.id,
        b.leader_student_name,
        (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id)::INTEGER,
        COALESCE(
            (SELECT jsonb_agg(jsonb_build_object('id', s_inner.id, 'firstName', s_inner.first_name, 'lastName', s_inner.last_name))
             FROM booking_student bs
             JOIN student s_inner ON bs.student_id = s_inner.id
             WHERE bs.booking_id = b.id),
            '[]'::jsonb
        ),
        sp.id,
        sp.description,
        sp.duration_minutes,
        sp.price_per_student,
        sp.category_equipment,
        sp.capacity_equipment,
        sp.capacity_students,
        tc.id,
        tc.commission_type,
        tc.cph
    FROM event e
    JOIN lesson l ON e.lesson_id = l.id
    JOIN booking b ON l.booking_id = b.id
    JOIN school_package sp ON b.school_package_id = sp.id
    JOIN teacher t ON l.teacher_id = t.id
    JOIN school s ON e.school_id = s.id
    JOIN teacher_commission tc ON l.commission_id = tc.id
    WHERE l.teacher_id = p_teacher_id
    AND (p_school_id IS NULL OR e.school_id = p_school_id)
    ORDER BY e.date DESC;
END;
$$ LANGUAGE plpgsql STABLE;
