"use client";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import BookingForm from "./MasterBookingForm";

export default function RegisterPage() {
    const { teachers: schoolTeachers } = useSchoolTeachers();

    return <BookingForm teachers={schoolTeachers} />;
}
