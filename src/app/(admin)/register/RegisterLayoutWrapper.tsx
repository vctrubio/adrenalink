"use client";

import { useState, useMemo, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { masterBookingAdd } from "@/actions/register-action";
import { RegisterFormLayout } from "@/src/components/layouts/RegisterFormLayout";
import { useRegisterData, useBookingForm, useRegisterActions, useFormRegistration } from "./RegisterContext";
import RegisterController from "./RegisterController";

type ActiveForm = "booking" | "student" | "teacher" | "package";

interface RegisterLayoutWrapperProps {
    children: ReactNode;
}

export default function RegisterLayoutWrapper({ children }: RegisterLayoutWrapperProps) {
    const pathname = usePathname();
    const data = useRegisterData();
    const bookingFormState = useBookingForm();
    const { addToQueue } = useRegisterActions();
    const { registerSubmitHandler, setFormValidity, submitHandler: registeredSubmitHandler, isFormValid: formIsValid } = useFormRegistration();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Determine active form based on pathname
    const activeForm: ActiveForm = useMemo(() => {
        if (pathname === "/register") return "booking";
        if (pathname === "/register/student") return "student";
        if (pathname === "/register/teacher") return "teacher";
        if (pathname === "/register/package") return "package";
        return "booking";
    }, [pathname]);

    // Get selected students
    const selectedStudents = data.students
        .filter(s => bookingFormState.form.selectedStudentIds.includes(s.student?.id))
        .map(s => s.student);

    // Determine if we can create booking
    const canCreateBooking = useMemo(() => {
        const f = bookingFormState.form;
        return !!(
            f.selectedPackage &&
            f.selectedStudentIds.length > 0 &&
            f.selectedStudentIds.length === f.selectedPackage.capacityStudents &&
            f.dateRange.startDate &&
            f.dateRange.endDate &&
            (!f.selectedTeacher || f.selectedCommission)
        );
    }, [bookingFormState.form]);

    const getLeaderStudentName = () => {
        const leaderStudent = selectedStudents.find(s => s.id === bookingFormState.form.leaderStudentId);
        return leaderStudent ? `${leaderStudent.firstName} ${leaderStudent.lastName}` : "";
    };

    // Handle booking submission
    const handleBookingSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const leaderStudentName = getLeaderStudentName();
            const result = await masterBookingAdd(
                bookingFormState.form.selectedPackage.id,
                bookingFormState.form.selectedStudentIds,
                bookingFormState.form.dateRange.startDate,
                bookingFormState.form.dateRange.endDate,
                bookingFormState.form.selectedTeacher?.id,
                bookingFormState.form.selectedCommission?.id,
                bookingFormState.form.selectedReferral?.id,
                leaderStudentName
            );

            if (!result.success) {
                const errorMessage = result.error || "Failed to create booking";
                setError(errorMessage);
                toast.error(errorMessage);
                setLoading(false);
                return;
            }

            // Add to queue
            addToQueue("bookings", {
                id: result.data.booking.id,
                name: leaderStudentName,
                timestamp: Date.now(),
            });

            // Success toast
            toast.success(`Booking created: ${leaderStudentName}`);

            // Reset form
            bookingFormState.reset();
            setLoading(false);
        } catch (err) {
            const errorMessage = "An unexpected error occurred";
            setError(errorMessage);
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    // Register booking submission handler when on booking page
    useEffect(() => {
        if (activeForm === "booking") {
            registerSubmitHandler(handleBookingSubmit);
            setFormValidity(canCreateBooking);
        }
    }, [activeForm, canCreateBooking, registerSubmitHandler, setFormValidity]);

    // Also update validity when it changes
    useEffect(() => {
        if (activeForm === "booking") {
            setFormValidity(canCreateBooking);
        }
    }, [activeForm, canCreateBooking, setFormValidity]);

    return (
        <RegisterFormLayout
            controller={
                <RegisterController
                    activeForm={activeForm}
                    selectedPackage={bookingFormState.form.selectedPackage}
                    selectedStudents={selectedStudents}
                    selectedReferral={bookingFormState.form.selectedReferral}
                    selectedTeacher={bookingFormState.form.selectedTeacher}
                    selectedCommission={bookingFormState.form.selectedCommission}
                    dateRange={bookingFormState.form.dateRange}
                    onReset={bookingFormState.reset}
                    loading={loading}
                    school={data.school}
                    leaderStudentId={bookingFormState.form.leaderStudentId}
                    error={error}
                    submitHandler={registeredSubmitHandler}
                    isFormValid={activeForm === "booking" ? canCreateBooking : formIsValid}
                />
            }
            form={children}
        />
    );
}
