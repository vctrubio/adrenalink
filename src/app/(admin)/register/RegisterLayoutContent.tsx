"use client";

import { ReactNode, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { masterBookingAdd } from "@/actions/register-action";
import { RegisterFormLayout } from "@/src/components/layouts/RegisterFormLayout";
import {
    useRegisterData,
    useBookingForm,
    useStudentFormState,
    useTeacherFormState,
    usePackageFormState,
    useRegisterActions,
    useFormSubmission,
} from "./RegisterContext";
import RegisterController from "./RegisterController";

interface RegisterLayoutContentProps {
    children: ReactNode;
}

type ActiveForm = "booking" | "student" | "teacher" | "package";

export function RegisterLayoutContent({ children }: RegisterLayoutContentProps) {
    const pathname = usePathname();
    const { school } = useRegisterData();
    const bookingFormState = useBookingForm();
    const studentFormState = useStudentFormState();
    const teacherFormState = useTeacherFormState();
    const packageFormState = usePackageFormState();
    const { addToQueue } = useRegisterActions();
    const formSubmission = useFormSubmission();
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

    // Get students from booking form state
    const { students: allStudents } = useRegisterData();
    const selectedStudents = allStudents
        .filter(s => bookingFormState.form.selectedStudentIds.includes(s.student?.id))
        .map(s => s.student);

    // Determine canCreateBooking
    const canCreateBooking =
        bookingFormState.form.selectedPackage &&
        bookingFormState.form.selectedStudentIds.length > 0 &&
        bookingFormState.form.selectedStudentIds.length === bookingFormState.form.selectedPackage.capacityStudents &&
        bookingFormState.form.dateRange.startDate &&
        bookingFormState.form.dateRange.endDate &&
        (!bookingFormState.form.selectedTeacher || bookingFormState.form.selectedCommission);

    const getLeaderStudentName = () => {
        const leaderStudent = selectedStudents.find(s => s.id === bookingFormState.form.leaderStudentId);
        return leaderStudent ? `${leaderStudent.firstName} ${leaderStudent.lastName}` : "";
    };

    // Handle booking submission
    const handleSubmit = async () => {
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
                    onSubmit={handleSubmit}
                    onReset={bookingFormState.reset}
                    onScrollToSection={() => {}}
                    loading={loading}
                    canCreateBooking={canCreateBooking}
                    school={school}
                    studentFormData={studentFormState.form}
                    teacherFormData={teacherFormState.form}
                    packageFormData={packageFormState.form}
                    leaderStudentId={bookingFormState.form.leaderStudentId}
                    error={error}
                    isStudentFormValid={formSubmission.isStudentFormValid}
                    isTeacherFormValid={formSubmission.isTeacherFormValid}
                    isPackageFormValid={formSubmission.isPackageFormValid}
                    onStudentSubmit={formSubmission.onStudentSubmit}
                    onTeacherSubmit={formSubmission.onTeacherSubmit}
                    onPackageSubmit={formSubmission.onPackageSubmit}
                />
            }
            form={children}
        />
    );
}
