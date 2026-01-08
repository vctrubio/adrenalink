"use client";

import { useRegisterData } from "./RegisterContext";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import BookingForm from "./MasterBookingForm";

interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    passport: string;
    country: string;
    phone: string;
    languages: string[];
    active: boolean;
    commissions: Array<{
        id: string;
        commissionType: string;
        cph: string;
        description: string | null;
    }>;
}

export default function RegisterPage() {
    const data = useRegisterData();
    const { teachers: schoolTeachers } = useSchoolTeachers();

    // Transform TeacherProvider to Teacher interface for BookingForm
    const transformedTeachers: Teacher[] = schoolTeachers.map(t => ({
        id: t.schema.id,
        firstName: t.schema.first_name,
        lastName: t.schema.last_name,
        username: t.schema.username,
        passport: t.schema.passport,
        country: t.schema.country,
        phone: t.schema.phone,
        languages: t.schema.languages,
        active: t.schema.active,
        commissions: t.schema.commissions,
    }));

    // Create teacher stats map from lessonStats
    const teacherStatsMap = schoolTeachers.reduce((acc, t) => {
        acc[t.schema.id] = {
            totalLessons: t.lessonStats.totalLessons,
            plannedLessons: t.lessonStats.completedLessons,
        };
        return acc;
    }, {} as Record<string, { totalLessons: number; plannedLessons: number }>);

    return (
        <BookingForm
            school={data.school}
            schoolPackages={data.packages}
            students={data.students}
            teachers={transformedTeachers}
            referrals={data.referrals}
            teacherStats={teacherStatsMap}
            studentStats={data.studentBookingStats}
        />
    );
}
