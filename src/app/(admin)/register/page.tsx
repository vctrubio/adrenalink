"use client";

import { useRegisterData } from "./RegisterContext";
import BookingForm from "./MasterBookingForm";

export default function RegisterPage() {
    const data = useRegisterData();

    return (
        <BookingForm
            school={data.school}
            schoolPackages={data.packages}
            students={data.students}
            teachers={data.teachers}
            referrals={data.referrals}
            studentStats={data.studentStats}
        />
    );
}
