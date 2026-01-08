-- DROP existing functions if they exist to avoid parameter name conflicts
DROP FUNCTION IF EXISTS get_event_transaction(UUID);
DROP FUNCTION IF EXISTS get_event_transactions_batch(UUID[]);
DROP FUNCTION IF EXISTS get_booking_event_transactions(UUID);
DROP FUNCTION IF EXISTS get_school_event_transactions(UUID, DATE, DATE);

-- Single event transaction
CREATE OR REPLACE FUNCTION get_event_transaction(p_event_id UUID)
RETURNS TABLE (
    event_id UUID,
    lesson_id UUID,
    booking_id UUID,
    teacher_id UUID,
    school_id UUID,
    event_date TIMESTAMP WITH TIME ZONE,
    event_duration INTEGER,
    student_count INTEGER,
    price_per_student INTEGER,
    commission_hourly NUMERIC,
    gross_revenue NUMERIC,
    teacher_commission NUMERIC,
    net_revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.lesson_id,
        b.id,
        l.teacher_id,
        e.school_id,
        e.date,
        e.duration,
        (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id)::INTEGER,
        sp.price_per_student,
        tc.cph::NUMERIC,
        (sp.price_per_student * (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id))::NUMERIC,
        (tc.cph::NUMERIC * (e.duration::NUMERIC / 60))::NUMERIC,
        ((sp.price_per_student * (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id))::NUMERIC 
         - (tc.cph::NUMERIC * (e.duration::NUMERIC / 60)))::NUMERIC
    FROM event e
    JOIN lesson l ON e.lesson_id = l.id
    JOIN booking b ON l.booking_id = b.id
    JOIN school_package sp ON b.school_package_id = sp.id
    JOIN teacher_commission tc ON l.commission_id = tc.id
    WHERE e.id = p_event_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Batch event transactions
CREATE OR REPLACE FUNCTION get_event_transactions_batch(p_event_ids UUID[])
RETURNS TABLE (
    event_id UUID,
    lesson_id UUID,
    booking_id UUID,
    teacher_id UUID,
    school_id UUID,
    event_date TIMESTAMP WITH TIME ZONE,
    event_duration INTEGER,
    student_count INTEGER,
    price_per_student INTEGER,
    commission_hourly NUMERIC,
    gross_revenue NUMERIC,
    teacher_commission NUMERIC,
    net_revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.lesson_id,
        b.id,
        l.teacher_id,
        e.school_id,
        e.date,
        e.duration,
        (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id)::INTEGER,
        sp.price_per_student,
        tc.cph::NUMERIC,
        (sp.price_per_student * (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id))::NUMERIC,
        (tc.cph::NUMERIC * (e.duration::NUMERIC / 60))::NUMERIC,
        ((sp.price_per_student * (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id))::NUMERIC 
         - (tc.cph::NUMERIC * (e.duration::NUMERIC / 60)))::NUMERIC
    FROM event e
    JOIN lesson l ON e.lesson_id = l.id
    JOIN booking b ON l.booking_id = b.id
    JOIN school_package sp ON b.school_package_id = sp.id
    JOIN teacher_commission tc ON l.commission_id = tc.id
    WHERE e.id = ANY(p_event_ids)
    ORDER BY e.date DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Booking event transactions
CREATE OR REPLACE FUNCTION get_booking_event_transactions(p_booking_id UUID)
RETURNS TABLE (
    event_id UUID,
    lesson_id UUID,
    booking_id UUID,
    teacher_id UUID,
    school_id UUID,
    event_date TIMESTAMP WITH TIME ZONE,
    event_duration INTEGER,
    student_count INTEGER,
    price_per_student INTEGER,
    commission_hourly NUMERIC,
    gross_revenue NUMERIC,
    teacher_commission NUMERIC,
    net_revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.lesson_id,
        b.id,
        l.teacher_id,
        e.school_id,
        e.date,
        e.duration,
        (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id)::INTEGER,
        sp.price_per_student,
        tc.cph::NUMERIC,
        (sp.price_per_student * (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id))::NUMERIC,
        (tc.cph::NUMERIC * (e.duration::NUMERIC / 60))::NUMERIC,
        ((sp.price_per_student * (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id))::NUMERIC 
         - (tc.cph::NUMERIC * (e.duration::NUMERIC / 60)))::NUMERIC
    FROM event e
    JOIN lesson l ON e.lesson_id = l.id
    JOIN booking b ON l.booking_id = b.id
    JOIN school_package sp ON b.school_package_id = sp.id
    JOIN teacher_commission tc ON l.commission_id = tc.id
    WHERE b.id = p_booking_id
    ORDER BY e.date ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- School date range transactions
CREATE OR REPLACE FUNCTION get_school_event_transactions(
    p_school_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    event_id UUID,
    lesson_id UUID,
    booking_id UUID,
    teacher_id UUID,
    school_id UUID,
    event_date TIMESTAMP WITH TIME ZONE,
    event_duration INTEGER,
    student_count INTEGER,
    price_per_student INTEGER,
    commission_hourly NUMERIC,
    gross_revenue NUMERIC,
    teacher_commission NUMERIC,
    net_revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.lesson_id,
        b.id,
        l.teacher_id,
        e.school_id,
        e.date,
        e.duration,
        (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id)::INTEGER,
        sp.price_per_student,
        tc.cph::NUMERIC,
        (sp.price_per_student * (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id))::NUMERIC,
        (tc.cph::NUMERIC * (e.duration::NUMERIC / 60))::NUMERIC,
        ((sp.price_per_student * (SELECT COUNT(*) FROM booking_student bs WHERE bs.booking_id = b.id))::NUMERIC 
         - (tc.cph::NUMERIC * (e.duration::NUMERIC / 60)))::NUMERIC
    FROM event e
    JOIN lesson l ON e.lesson_id = l.id
    JOIN booking b ON l.booking_id = b.id
    JOIN school_package sp ON b.school_package_id = sp.id
    JOIN teacher_commission tc ON l.commission_id = tc.id
    WHERE e.school_id = p_school_id
        AND (p_start_date IS NULL OR DATE(e.date) >= p_start_date)
        AND (p_end_date IS NULL OR DATE(e.date) <= p_end_date)
    ORDER BY e.date DESC;
END;
$$ LANGUAGE plpgsql STABLE;
