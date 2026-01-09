"use client";

import { useRegisterData } from "./RegisterContext";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import BookingForm from "./MasterBookingForm";

export default function RegisterPage() {
    const data = useRegisterData();
    const { teachers: schoolTeachers } = useSchoolTeachers();
    console.log("[RegisterPage] data.studentBookingStats:", data.studentBookingStats);

    return (
        <BookingForm
            school={data.school}
            schoolPackages={data.packages}
            students={data.students}
            teachers={schoolTeachers}
            referrals={data.referrals}
            studentStats={data.studentBookingStats || {}}
        />
    );
}
