export class BookingData {
    id: string;
    school_id: string;
    school_package_id: string;
    date_start: string;
    date_end: string;
    leader_student_name: string;
    status: string;
    
    // Nested data (populated via eager loading)
    school_package: {
        price_per_student: number;
        duration_minutes: number;
        capacity_students: number;
    };
    
    booking_student: Array<{ student_id: string }>;
    
    lessons: Array<{
        id: string;
        teacher_id: string;
        commission_id: string;
        teacher_commission: {
            cph: string; // Changed to string as cph is often decimal stored as string in db
            commission_type: "fixed" | "percentage";
        };
        events: Array<{
            id: string;
            date: string;
            duration: number;
            status: string;
        }>;
    }>;

    constructor(data: any) {
        // Assign data properties to this instance
        this.id = data.id;
        this.school_id = data.school_id;
        this.school_package_id = data.school_package_id;
        this.date_start = data.date_start;
        this.date_end = data.date_end;
        this.leader_student_name = data.leader_student_name;
        this.status = data.status;
        this.school_package = data.school_package;
        this.booking_student = data.booking_student || [];
        // Handle both 'lesson' (from Supabase response) and 'lessons' (if mapped)
        this.lessons = (data.lesson || data.lessons || []).map((l: any) => ({
            ...l,
            // Handle both 'event' (from Supabase response) and 'events' (if mapped)
            events: l.event || l.events || []
        }));
    }

    // ===========================
    // 1. BOOKING-LEVEL REVENUE
    // ===========================

    /**
     * Get total revenue for entire booking (all events combined)
     * @returns { grossRevenue, teacherCommissions, netRevenue, eventCount }
     */
    getRevenue() {
        let totalGross = 0;
        let totalCommission = 0;
        let eventCount = 0;

        // Iterate all lessons and events
        this.lessons.forEach((lesson) => {
            lesson.events.forEach((event) => {
                const eventRevenue = this._calculateEventRevenue(lesson, event);
                totalGross += eventRevenue.gross;
                totalCommission += eventRevenue.commission;
                eventCount++;
            });
        });

        return {
            grossRevenue: totalGross,
            teacherCommissions: totalCommission,
            netRevenue: totalGross - totalCommission,
            eventCount,
            studentCount: this.booking_student.length,
            averagePerEvent: eventCount > 0 ? (totalGross - totalCommission) / eventCount : 0
        };
    }

    // ===========================
    // 2. EVENT-LEVEL REVENUE
    // ===========================

    /**
     * Get revenue breakdown for a specific event
     * @param event - The event object
     * @returns { eventId, lessonId, date, duration, grossRevenue, teacherCommission, netRevenue }
     */
    getRevenueOfEvent(event: any) {
        // Find the lesson this event belongs to
        const lesson = this.lessons.find((l) =>
            l.events.some((e) => e.id === event.id)
        );

        if (!lesson) {
            throw new Error(`Event ${event.id} not found in booking lessons`);
        }

        const revenue = this._calculateEventRevenue(lesson, event);

        return {
            eventId: event.id,
            lessonId: lesson.id,
            teacherId: lesson.teacher_id,
            date: event.date,
            duration: event.duration,
            grossRevenue: revenue.gross,
            teacherCommission: revenue.commission,
            netRevenue: revenue.net,
            studentCount: this.booking_student.length,
            pricePerStudent: this.school_package.price_per_student,
            commissionHourly: parseFloat(lesson.teacher_commission.cph)
        };
    }

    // ===========================
    // 3. LESSON-LEVEL REVENUE
    // ===========================

    /**
     * Get revenue breakdown for all events in a lesson
     * @param lessonId - The lesson ID
     * @returns { lessonId, teacherId, eventCount, grossRevenue, teacherCommission, netRevenue, events[] }
     */
    getRevenueOfLesson(lessonId: string) {
        const lesson = this.lessons.find((l) => l.id === lessonId);

        if (!lesson) {
            throw new Error(`Lesson ${lessonId} not found in booking`);
        }

        let totalGross = 0;
        let totalCommission = 0;
        const events: any[] = [];

        lesson.events.forEach((event) => {
            const revenue = this._calculateEventRevenue(lesson, event);
            totalGross += revenue.gross;
            totalCommission += revenue.commission;
            
            events.push({
                eventId: event.id,
                date: event.date,
                duration: event.duration,
                grossRevenue: revenue.gross,
                teacherCommission: revenue.commission,
                netRevenue: revenue.net
            });
        });

        return {
            lessonId: lesson.id,
            teacherId: lesson.teacher_id,
            eventCount: lesson.events.length,
            grossRevenue: totalGross,
            teacherCommissions: totalCommission,
            netRevenue: totalGross - totalCommission,
            studentCount: this.booking_student.length,
            events
        };
    }

    // ===========================
    // 4. PRIVATE CALCULATIONS
    // ===========================

    /**
     * Core revenue calculation for a single event
     * Formula:
     *   Gross = (price_per_student / (package_duration / 60)) * duration_hours * student_count
     *   Commission = cph * duration_hours (for fixed) OR % of gross (for percentage)
     *   Net = Gross - Commission
     */
    private _calculateEventRevenue(lesson: any, event: any) {
        const studentCount = this.booking_student.length;
        const pricePerStudent = this.school_package.price_per_student;
        const packageDurationMinutes = this.school_package.duration_minutes;
        
        // Calculate hourly rate per student based on package price and duration
        const packageDurationHours = packageDurationMinutes / 60;
        const pricePerHourPerStudent = packageDurationHours > 0 ? pricePerStudent / packageDurationHours : 0;
        
        const eventDurationHours = event.duration / 60;
        
        // Gross revenue = price/hour * hours * students
        const gross = pricePerHourPerStudent * eventDurationHours * studentCount;

        // Commission calculation
        const cph = parseFloat(lesson.teacher_commission.cph || "0");
        const type = lesson.teacher_commission.commission_type;
        
        let commission = 0;
        if (type === "fixed") {
            commission = cph * eventDurationHours;
        } else if (type === "percentage") {
            commission = gross * (cph / 100);
        }

        const net = gross - commission;

        return {
            gross,
            commission,
            net,
            studentCount,
            durationHours: eventDurationHours
        };
    }

    // ===========================
    // 5. SUMMARY & REPORTING
    // ===========================

    /**
     * Get summary stats for the booking
     */
    getSummary() {
        const bookingRevenue = this.getRevenue();
        const totalDuration = this.lessons.reduce((sum, lesson) =>
            sum + lesson.events.reduce((lessonSum, event) => lessonSum + event.duration, 0),
            0
        );

        return {
            bookingId: this.id,
            studentCount: this.booking_student.length,
            lessonCount: this.lessons.length,
            eventCount: bookingRevenue.eventCount,
            totalDurationMinutes: totalDuration,
            totalDurationHours: totalDuration / 60,
            grossRevenue: bookingRevenue.grossRevenue,
            totalCommissions: bookingRevenue.teacherCommissions,
            netRevenue: bookingRevenue.netRevenue,
            profitMargin: bookingRevenue.grossRevenue > 0 
                ? ((bookingRevenue.netRevenue / bookingRevenue.grossRevenue) * 100).toFixed(2) + '%'
                : '0%',
            costPerEvent: bookingRevenue.eventCount > 0 
                ? bookingRevenue.teacherCommissions / bookingRevenue.eventCount
                : 0,
            revenuePerEvent: bookingRevenue.eventCount > 0
                ? bookingRevenue.netRevenue / bookingRevenue.eventCount
                : 0
        };
    }
}
