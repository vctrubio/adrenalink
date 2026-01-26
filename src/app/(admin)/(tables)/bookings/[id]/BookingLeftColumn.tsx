"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EntityLeftColumn } from "@/src/components/ids/EntityLeftColumn";
import { UpdateEntityColumnCard } from "@/src/components/ids/UpdateEntityColumnCard";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { BookingProgressBadge } from "@/src/components/ui/badge/bookingprogress";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
// import { BookingTableGetters } from "@/getters/table-getters"; // No longer needed
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { formatDate } from "@/getters/date-getter";
import { ENTITY_DATA } from "@/config/entities";
import { STAT_TYPE_CONFIG } from "@/backend/data/StatsData";
import { bookingUpdateSchema, type BookingUpdateForm } from "@/src/validation/booking";
import { updateBooking, deleteBooking } from "@/supabase/server/bookings";
import type { BookingData } from "@/backend/data/BookingData";
import type { LeftColumnCardData } from "@/types/left-column";

interface BookingLeftColumnProps {
    booking: BookingData;
}

export function BookingLeftColumn({ booking }: BookingLeftColumnProps) {
    const router = useRouter();
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
    const receiptEntity = ENTITY_DATA.find((e) => e.id === "payment")!;

    const students = booking.relations?.students || [];
    const schoolPackage = booking.relations?.school_package;

    // Use pre-calculated stats directly from booking data
    const hasEvents = booking.totalEventsCount > 0;
    const usedMinutes = booking.totalUsedMinutes;
    const totalMinutes = schoolPackage?.duration_minutes || 0;
    const due = booking.totalDueAmount;

    const StudentIcon = studentEntity.icon;
    const PackageIcon = packageEntity.icon;
    const BookingIcon = bookingEntity.icon;

    // Form handlers
    const handleUpdateSubmit = async (data: BookingUpdateForm) => {
        const result = await updateBooking(booking.schema.id, {
            date_start: data.date_start,
            date_end: data.date_end,
            leader_student_name: data.leader_student_name,
            status: data.status,
        });

        if (result.success) {
            router.refresh();
        } else {
            console.error("Failed to update booking:", result.error);
            throw new Error(result.error);
        }
    };

    const handleDelete = async () => {
        const result = await deleteBooking(booking.schema.id);

        if (result.success) {
            router.push("/bookings");
        } else {
            console.error("Failed to delete booking:", result.error);
            throw new Error(result.error);
        }
    };

    const canDeleteBooking = !hasEvents;
    const deleteMessage = canDeleteBooking
        ? "Are you sure you want to delete this booking?"
        : "Cannot delete booking with lessons that have events";

    // Form fields
    const formFields = [
        { name: "date_start", label: "Start Date", type: "date" as const, section: "dates", required: true },
        { name: "date_end", label: "End Date", type: "date" as const, section: "dates", required: true },
        {
            name: "leader_student_name",
            label: "Leader Student",
            type: "leader-student" as const,
            section: "students",
            required: true,
            students: students.map((s) => ({ id: s.id, first_name: s.first_name, last_name: s.last_name })),
        },
        { name: "status", label: "Status", type: "status-buttons" as const, section: "settings", required: true },
    ];

    const defaultValues: BookingUpdateForm = {
        id: booking.schema.id,
        date_start: booking.schema.date_start,
        date_end: booking.schema.date_end,
        leader_student_name: booking.schema.leader_student_name,
        status: booking.schema.status as "active" | "completed" | "uncompleted",
    };

    // View mode fields
    const bookingViewFields = [
        {
            label: "Booking ID",
            value: booking.schema.id.toUpperCase().slice(0, 8),
        },
        {
            label: "Start Date",
            value: formatDate(booking.schema.date_start),
        },
        {
            label: "End Date",
            value: formatDate(booking.schema.date_end),
        },
        {
            label: "Leader Student",
            value: booking.schema.leader_student_name,
        },
        {
            label: "Status",
            value: booking.schema.status || "Unknown",
        },
        {
            label: "Created",
            value: formatDate(booking.schema.created_at),
        },
    ];

    // Student Fields
    const sortedStudents = [...students].sort((a, b) => {
        const aName = `${a.first_name} ${a.last_name}`;
        const bName = `${b.first_name} ${b.last_name}`;
        const aIsLeader = aName === booking.schema.leader_student_name;
        const bIsLeader = bName === booking.schema.leader_student_name;
        return aIsLeader ? -1 : bIsLeader ? 1 : 0;
    });

    const studentFields = sortedStudents.map((student, index) => {
        const studentName = `${student.first_name} ${student.last_name}`;
        const isLeader = studentName === booking.schema.leader_student_name;
        return {
            label: isLeader ? "Leader" : String(index + 1),
            value: (
                <HoverToEntity entity={studentEntity} id={student.id}>
                    {studentName}
                </HoverToEntity>
            ),
        };
    });

    // Package Fields
    const packageDurationHours = schoolPackage?.duration_minutes ? Math.round(schoolPackage.duration_minutes / 60) : 0;
    const durationHours = schoolPackage?.duration_minutes ? schoolPackage.duration_minutes / 60 : 0;
    const pricePerHour = durationHours > 0 ? (schoolPackage?.price_per_student || 0) / durationHours : 0;

    const packageFields = schoolPackage
        ? [
              {
                  label: "Type",
                  value: schoolPackage.package_type || "Standard",
              },
              {
                  label: "Capacity",
                  value: `${schoolPackage.capacity_students} Students / ${schoolPackage.capacity_equipment} Eq`,
              },
              {
                  label: "Active",
                  value: schoolPackage.active ? "Yes" : "No",
              },
              {
                  label: "Public",
                  value: schoolPackage.is_public ? "Yes" : "No",
              },
          ]
        : [];

    // Payment Fields
    const payments = booking.relations?.student_booking_payment || [];
    const paymentFields =
        payments.length > 0
            ? payments.map((payment) => ({
                  label: formatDate(payment.created_at),
                  value: `${payment.amount} ${currency} (${payment.student_name})`,
              }))
            : [{ label: "Payments", value: "No Payments done" }];

    // Stats
    const progressPercentage = totalMinutes > 0 ? (usedMinutes / totalMinutes) * 100 : 0;
    const progressBarBackground = `linear-gradient(to right, ${bookingEntity.color} ${progressPercentage}%, #e5e7eb ${progressPercentage}%)`;

    // Card Data
    const bookingCardData: LeftColumnCardData = {
        name: <DateRangeBadge startDate={booking.schema.date_start} endDate={booking.schema.date_end} />,
        status: <BookingProgressBadge usedMinutes={usedMinutes} totalMinutes={totalMinutes} background={progressBarBackground} />,
        avatar: (
            <div className="flex-shrink-0" style={{ color: bookingEntity.color }}>
                <BookingIcon className="w-10 h-10" />
            </div>
        ),
        fields: [
            {
                label: "Booking ID",
                value: booking.schema.id.toUpperCase().slice(0, 8),
            },
            {
                label: "Status",
                value: booking.schema.status || "Unknown",
            },
            {
                label: "Created",
                value: formatDate(booking.schema.created_at),
            },
        ],
        accentColor: bookingEntity.color,
    };

    const leaderCardData: LeftColumnCardData = {
        name: booking.schema.leader_student_name,
        status: "Leader",
        avatar: (
            <div className="flex-shrink-0" style={{ color: studentEntity.color }}>
                <StudentIcon className="w-10 h-10" />
            </div>
        ),
        fields: studentFields.length > 0 ? studentFields : [{ label: "Students", value: "No students assigned" }],
        accentColor: studentEntity.color,
        isEditable: true,
    };

    const packageCardData: LeftColumnCardData | null = schoolPackage
        ? {
              name: schoolPackage.description || "No Package",
              status: (
                  <EquipmentStudentPackagePriceBadge
                      categoryEquipment={schoolPackage.category_equipment}
                      equipmentCapacity={schoolPackage.capacity_equipment || 0}
                      studentCapacity={schoolPackage.capacity_students || 0}
                      packageDurationHours={packageDurationHours}
                      pricePerHour={pricePerHour}
                  />
              ),
              avatar: (
                  <div className="flex-shrink-0" style={{ color: packageEntity.color }}>
                      <PackageIcon className="w-10 h-10" />
                  </div>
              ),
              fields: packageFields,
              accentColor: packageEntity.color,
              isEditable: false,
          }
        : null;

    const paymentCardData: LeftColumnCardData = {
        name: "Payments",
        status: `${due} ${currency} Due`,
        avatar: (
            <div className="flex-shrink-0" style={{ color: receiptEntity.color }}>
                <STAT_TYPE_CONFIG.payments.icon size={40} />
            </div>
        ),
        fields: paymentFields,
        accentColor: receiptEntity.color,
        isAddable: true,
    };

    return (
        <div className="space-y-6">
            <UpdateEntityColumnCard
                name={<DateRangeBadge startDate={booking.schema.date_start} endDate={booking.schema.date_end} />}
                status={<BookingProgressBadge usedMinutes={usedMinutes} totalMinutes={totalMinutes} background={progressBarBackground} />}
                avatar={
                    <div className="flex-shrink-0" style={{ color: bookingEntity.color }}>
                        <BookingIcon className="w-10 h-10" />
                    </div>
                }
                fields={bookingViewFields}
                accentColor={bookingEntity.color}
                entityId="booking"
                formFields={formFields}
                schema={bookingUpdateSchema}
                defaultValues={defaultValues}
                onSubmit={handleUpdateSubmit}
                onDelete={handleDelete}
                canDelete={canDeleteBooking}
                deleteMessage={deleteMessage}
            />
            <EntityLeftColumn cards={[packageCardData, leaderCardData, paymentCardData]} />
        </div>
    );
}