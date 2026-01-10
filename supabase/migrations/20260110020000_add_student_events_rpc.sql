-- migration to add get_student_events RPC
CREATE OR REPLACE FUNCTION get_student_events(p_student_id UUID, p_school_id UUID DEFAULT NULL)
RETURNS TABLE (
    event_id UUID,
    event_date TIMESTAMP,
    event_duration INTEGER,
    event_location VARCHAR,
    event_status TEXT,
    teacher_id UUID,
    teacher_first_name VARCHAR,
    teacher_last_name VARCHAR,
    teacher_username VARCHAR,
    package_id UUID,
    package_description TEXT,
    package_duration_minutes INTEGER,
    package_price_per_student INTEGER,
    package_category_equipment TEXT,
    package_capacity_equipment INTEGER,
    package_capacity_students INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        (e.date AT TIME ZONE s.timezone)::TIMESTAMP,
        e.duration,
        e.location,
        e.status,
        t.id,
        t.first_name,
        t.last_name,
        t.username,
        sp.id,
        sp.description,
        sp.duration_minutes,
        sp.price_per_student,
        sp.category_equipment,
        sp.capacity_equipment,
        sp.capacity_students
    FROM event e
    JOIN lesson l ON e.lesson_id = l.id
    JOIN booking b ON l.booking_id = b.id
    JOIN booking_student bs ON b.id = bs.booking_id
    JOIN school_package sp ON b.school_package_id = sp.id
    JOIN teacher t ON l.teacher_id = t.id
    JOIN school s ON e.school_id = s.id
    WHERE bs.student_id = p_student_id
    AND (p_school_id IS NULL OR e.school_id = p_school_id)
    ORDER BY e.date DESC;
END;
$$ LANGUAGE plpgsql STABLE;
