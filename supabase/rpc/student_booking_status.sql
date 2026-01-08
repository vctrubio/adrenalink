-- RPC for student booking stats with completion status and event metrics + student info
DROP FUNCTION IF EXISTS get_student_booking_status(UUID);

CREATE OR REPLACE FUNCTION get_student_booking_status(p_school_id UUID)
RETURNS TABLE (
    student_id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    passport VARCHAR,
    country VARCHAR,
    phone VARCHAR,
    languages TEXT[],
    school_student_id UUID,
    description TEXT,
    active BOOLEAN,
    rental BOOLEAN,
    booking_count INTEGER,
    total_event_count INTEGER,
    total_event_duration INTEGER,
    all_bookings_completed BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.first_name,
        s.last_name,
        s.passport,
        s.country,
        s.phone,
        s.languages,
        ss.school_id,
        ss.description,
        ss.active,
        ss.rental,
        COALESCE(COUNT(DISTINCT b.id), 0)::INTEGER as booking_count,
        COALESCE(COUNT(DISTINCT e.id), 0)::INTEGER as total_event_count,
        COALESCE(SUM(e.duration), 0)::INTEGER as total_event_duration,
        NOT EXISTS (
            SELECT 1
            FROM booking_student bs
            JOIN booking b2 ON bs.booking_id = b2.id
            WHERE bs.student_id = s.id
            AND b2.status = 'active'
        ) as all_bookings_completed,
        s.created_at
    FROM student s
    LEFT JOIN school_students ss ON s.id = ss.student_id
    LEFT JOIN booking_student bs ON s.id = bs.student_id
    LEFT JOIN booking b ON bs.booking_id = b.id
    LEFT JOIN school_package sp ON b.school_package_id = sp.id
    LEFT JOIN lesson l ON b.id = l.booking_id
    LEFT JOIN event e ON l.id = e.lesson_id
    WHERE ss.school_id = p_school_id
    GROUP BY s.id, s.first_name, s.last_name, s.passport, s.country, s.phone, s.languages, s.created_at, ss.school_id, ss.description, ss.active, ss.rental
    ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;
