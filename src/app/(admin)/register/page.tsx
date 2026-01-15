"use client";

import { useRegisterData } from "./RegisterContext";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import BookingForm from "./MasterBookingForm";

export default function RegisterPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const data = useRegisterData();
    const { teachers: schoolTeachers } = useSchoolTeachers();

    return (
        <BookingForm
            teachers={schoolTeachers}
        />
    );
}
