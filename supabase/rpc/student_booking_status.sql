-- RPC for student booking stats with completion status and event metrics
DROP FUNCTION IF EXISTS get_student_booking_status(UUID);

CREATE OR REPLACE FUNCTION get_student_booking_status(p_school_id UUID)
RETURNS TABLE (
    student_id UUID,
    booking_count INTEGER,
    duration_hours NUMERIC,
    total_event_count INTEGER,
    total_event_duration INTEGER,
    all_bookings_completed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        COALESCE(COUNT(DISTINCT b.id), 0)::INTEGER as booking_count,
        COALESCE(SUM(sp.duration_minutes)::NUMERIC / 60, 0) as duration_hours,
        COALESCE(COUNT(DISTINCT e.id), 0)::INTEGER as total_event_count,
        COALESCE(SUM(e.duration), 0)::INTEGER as total_event_duration,
        NOT EXISTS (
            SELECT 1
            FROM booking_student bs
            JOIN booking b2 ON bs.booking_id = b2.id
            JOIN lesson l ON b2.id = l.booking_id
            JOIN event e2 ON l.id = e2.lesson_id
            WHERE bs.student_id = s.id
            AND e2.status = 'planned'
        ) as all_bookings_completed
    FROM student s
    LEFT JOIN school_students ss ON s.id = ss.student_id
    LEFT JOIN booking_student bs ON s.id = bs.student_id
    LEFT JOIN booking b ON bs.booking_id = b.id
    LEFT JOIN school_package sp ON b.school_package_id = sp.id
    LEFT JOIN lesson l ON b.id = l.booking_id
    LEFT JOIN event e ON l.id = e.lesson_id
    WHERE ss.school_id = p_school_id
    GROUP BY s.id
    ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;
