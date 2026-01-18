"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EntityLeftColumn } from "@/src/components/ids/EntityLeftColumn";
import { UpdateEntityColumnCard } from "@/src/components/ids/UpdateEntityColumnCard";
import { LessonEventRevenueBadge } from "@/src/components/ui/badge/lesson-event-revenue";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { formatDate } from "@/getters/date-getter";
import { getFullDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import { COUNTRIES } from "@/config/countries";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import type { StudentData } from "@/backend/data/StudentData";
import type { LeftColumnCardData } from "@/types/left-column";
import { studentUpdateSchema, type StudentUpdateForm } from "@/src/validation/student";
import { updateStudent, deleteStudent } from "@/supabase/server/students";

interface StudentLeftColumnProps {
    student: StudentData;
}

export function StudentLeftColumn({ student }: StudentLeftColumnProps) {
    const router = useRouter();
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";
    const [rental, setRental] = useState(student.updateForm.rental || false);

    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const rentalEntity = ENTITY_DATA.find((e) => e.id === "rental")!;
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const paymentEntity = ENTITY_DATA.find((e) => e.id === "payment")!;

    const StudentIcon = studentEntity.icon;
    const BookingIcon = bookingEntity.icon;

    // Determine icon color based on active status and rental
    const isActive = student.updateForm.active;
    let iconColor = "#9ca3af"; // muted (inactive)
    if (isActive && rental) {
        iconColor = rentalEntity?.color || "#ef4444"; // red for rental
    } else if (isActive) {
        iconColor = studentEntity.color; // yellow for active
    }

    // Student Card fields for view mode
    const studentViewFields = [
        {
            label: "Passport",
            value: student.updateForm.passport,
        },
        {
            label: "Country",
            value: student.updateForm.country,
        },
        {
            label: "Phone",
            value: student.updateForm.phone,
        },
        {
            label: "Languages",
            value: student.updateForm.languages?.join(", ") || "",
        },
        {
            label: "Active",
            value: student.updateForm.active ? "Yes" : "No",
        },
        {
            label: "Rental",
            value: student.updateForm.rental ? "Yes" : "No",
        },
        {
            label: "Created",
            value: formatDate(student.schema.created_at),
        },
    ];

    // Bookings Card
    const bookings = student.relations?.bookings || [];

    let totalLessonCount = 0;
    let totalEventDuration = 0;
    let totalMoneySpent = 0;

    bookings.forEach((booking: any) => {
        const lessons = booking.lessons || [];
        totalLessonCount += lessons.length;

        const pkg = booking.school_package;
        const packageDuration = pkg?.duration_minutes || 0;
        const pricePerStudent = pkg?.price_per_student || 0;

        lessons.forEach((lesson: any) => {
            const events = lesson.event || lesson.events || [];
            const lessonDuration = events.reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
            totalEventDuration += lessonDuration;

            if (packageDuration > 0) {
                const lessonCost = (pricePerStudent * lessonDuration) / packageDuration;
                totalMoneySpent += lessonCost;
            }
        });
    });

    const bookingFields = bookings.map((booking: any) => ({
        label: booking.school_package?.description || "Unknown Package",
        value: booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
    }));

    const bookingsCardData: LeftColumnCardData = {
        name: "Bookings",
        status: (
            <LessonEventRevenueBadge
                lessonCount={totalLessonCount}
                duration={getFullDuration(totalEventDuration)}
                revenue={Math.round(totalMoneySpent)}
            />
        ),
        avatar: (
            <div className="flex-shrink-0" style={{ color: bookingEntity.color }}>
                <BookingIcon className="w-10 h-10" />
            </div>
        ),
        fields: bookingFields.length > 0 ? bookingFields : [{ label: "Bookings", value: "No bookings" }],
        accentColor: bookingEntity.color,
        isAddable: true,
        onAdd: () => router.push(`/register?add=student:${student.schema.id}`),
    };

    // Payments Card
    const payments = student.relations?.student_booking_payment || [];
    const totalPaymentsMade = payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
    const due = Math.round(totalMoneySpent - totalPaymentsMade);

    const paymentFields = payments.map((payment: any) => ({
        label: formatDate(payment.created_at),
        value: payment.amount.toString(),
    }));

    const paymentsCardData: LeftColumnCardData = {
        name: "Payments",
        status: `${due} ${currency} Due`,
        avatar: (
            <div className="flex-shrink-0" style={{ color: paymentEntity.color }}>
                <CreditIcon size={40} />
            </div>
        ),
        fields: paymentFields,
        accentColor: paymentEntity.color,
        isAddable: true,
    };

    const handleUpdateSubmit = async (data: StudentUpdateForm) => {
        // Transform languages from comma-separated string to array if needed
        const languages = typeof data.languages === "string"
            ? data.languages.split(",").map((lang) => lang.trim()).filter(Boolean)
            : data.languages;

        const result = await updateStudent(student.schema.id, {
            first_name: data.first_name,
            last_name: data.last_name,
            passport: data.passport,
            country: data.country,
            phone: data.phone,
            languages,
            description: data.description,
            email: data.email,
            active: data.active,
            rental: data.rental,
        });

        if (result.success) {
            setRental(data.rental);
            router.refresh();
        } else {
            console.error("Failed to update student:", result.error);
            throw new Error(result.error);
        }
    };

    const handleDelete = async () => {
        const result = await deleteStudent(student.schema.id);

        if (result.success) {
            router.push("/students");
        } else {
            console.error("Failed to delete student:", result.error);
            throw new Error(result.error);
        }
    };

    const canDelete = bookings.length === 0;

    const formFields = [
        { name: "active", label: "Active", type: "switch" as const, section: "settings" },
        { name: "rental", label: "Independent", type: "switch" as const, section: "settings" },
        { name: "first_name", label: "First Name", type: "text" as const, placeholder: "Enter first name", section: "personal", required: true },
        { name: "last_name", label: "Last Name", type: "text" as const, placeholder: "Enter last name", section: "personal", required: true },
        { name: "email", label: "Email", type: "text" as const, placeholder: "Optional email", section: "personal" },
        { name: "description", label: "Description", type: "textarea" as const, placeholder: "Optional description", section: "personal" },
        {
            name: "country",
            label: "Country & Phone",
            type: "country-phone" as const,
            pairedField: "phone",
            section: "contact",
            required: true,
        },
        { name: "passport", label: "Passport", type: "text" as const, placeholder: "Enter passport number", section: "contact", required: true },
        {
            name: "languages",
            label: "Languages",
            type: "languages" as const,
            section: "contact",
            required: true,
        },
    ];

    const defaultValues: StudentUpdateForm = {
        id: student.schema.id,
        first_name: student.updateForm.first_name,
        last_name: student.updateForm.last_name,
        passport: student.updateForm.passport,
        country: student.updateForm.country,
        phone: student.updateForm.phone,
        languages: student.updateForm.languages || [],
        description: student.updateForm.description || "",
        email: student.updateForm.email || "",
        active: student.updateForm.active,
        rental: rental,
    };

    return (
        <div className="space-y-6">
            <UpdateEntityColumnCard
                name={(formValues) => {
                    const firstName = formValues.first_name || "";
                    const lastName = formValues.last_name || "";
                    const name = [firstName, lastName].filter(Boolean).join(" ");
                    return name || "Student";
                }}
                status={student.updateForm.active ? "Active" : "Inactive"}
                avatar={(formValues) => {
                    const isActive = formValues.active;
                    const hasRental = formValues.rental;
                    let color = "#9ca3af"; // muted (inactive)
                    if (isActive && hasRental) {
                        color = rentalEntity?.color || "#ef4444"; // red for rental
                    } else if (isActive) {
                        color = studentEntity.color; // yellow for active
                    }
                    return (
                        <div className="flex-shrink-0" style={{ color }}>
                            <StudentIcon className="w-10 h-10" />
                        </div>
                    );
                }}
                fields={studentViewFields}
                accentColor={(formValues) => {
                    const isActive = formValues.active;
                    const hasRental = formValues.rental;
                    let color = "#9ca3af"; // muted (inactive)
                    if (isActive && hasRental) {
                        return rentalEntity?.color || "#ef4444"; // red for rental
                    } else if (isActive) {
                        return studentEntity.color; // yellow for active
                    }
                    return color;
                }}
                entityId="student"
                formFields={formFields}
                schema={studentUpdateSchema}
                defaultValues={defaultValues}
                onSubmit={handleUpdateSubmit}
                onDelete={handleDelete}
                canDelete={canDelete}
                deleteMessage={
                    canDelete ? "Are you sure you want to delete this student?" : "Cannot delete student with active bookings. Deactivating instead."
                }
            />
            <EntityLeftColumn cards={[bookingsCardData, paymentsCardData]} />
        </div>
    );
}
