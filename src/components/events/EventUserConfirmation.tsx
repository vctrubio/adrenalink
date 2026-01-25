"use client";

import type { EventNode } from "@/types/classboard-teacher-queue";
import { EventUserCard } from "@/src/components/events/EventUserCard";
import { CardList } from "@/src/components/ui/card/card-list";
import { EquipmentStudentCommissionBadge } from "@/src/components/ui/badge/equipment-student-commission";

interface EventUserConfirmationProps {
    event: EventNode;
    viewMode: "teacher" | "student";
    currency: string;
    onConfirm?: () => void;
}

// Sub-component: Event Details Card List
const EventDetailsCardList = ({
    event,
    currency,
}: {
    event: EventNode;
    currency: string;
}) => {
    const hours = event.eventData.duration / 60;
    const studentCount = event.bookingStudents.length;

    // Calculate teacher earnings based on commission
    let earnings = 0;
    if (event.commission.type === "fixed") {
        earnings = event.commission.cph * hours;
    } else {
        const revenue = event.pricePerStudent * studentCount * hours;
        earnings = revenue * (event.commission.cph / 100);
    }

    const pricePerHour = event.commission.type === "fixed" 
        ? event.commission.cph 
        : (event.pricePerStudent * studentCount * (event.commission.cph / 100));

    // Get student name
    const studentName = event.bookingStudents.length > 0
        ? `${event.bookingStudents[0].firstName} ${event.bookingStudents[0].lastName}`
        : event.bookingLeaderName;

    const fields = [
        {
            label: studentCount > 1 ? "Student 1" : "Student",
            value: studentName,
        },
        { label: "Location", value: event.eventData.location || "TBD" },
        { label: "Package", value: "Private Lesson" },
        {
            label: "Earnings",
            value: `(${pricePerHour.toFixed(0)} ${currency} x ${hours.toFixed(1)} hrs) ${earnings.toFixed(0)} ${currency}`,
        },
    ];

    return <CardList fields={fields} />;
};

// Main Component
export function EventUserConfirmation({ event, viewMode, currency, onConfirm }: EventUserConfirmationProps) {
    const isTBC = event.eventData.status === "tbc";

    // Footer content
    const footerLeftContent = (
        <EquipmentStudentCommissionBadge
            categoryEquipment={event.categoryEquipment}
            equipmentCapacity={event.capacityEquipment}
            studentCapacity={event.capacityStudents}
            commissionType={event.commission.type}
            commissionValue={event.commission.cph}
        />
    );

    return (
        <div className={`${isTBC && viewMode === "teacher" ? "ring-2 ring-purple-500/50 rounded-3xl" : ""}`}>
            <EventUserCard
                date={event.eventData.date}
                duration={event.eventData.duration}
                status={event.eventData.status}
                footerLeftContent={footerLeftContent}
            >
                <EventDetailsCardList event={event} currency={currency} />
            </EventUserCard>
        </div>
    );
}
