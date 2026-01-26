"use client";

import type { TransactionEventData } from "@/types/transaction-event";
import { EventUserCard } from "@/src/components/events/EventUserCard";
import { CardList } from "@/src/components/ui/card/card-list";
import { EquipmentStudentCommissionBadge } from "@/src/components/ui/badge/equipment-student-commission";

interface EventUserConfirmationProps {
    event: TransactionEventData;
    viewMode: "teacher" | "student";
    currency: string;
    onConfirm?: () => void;
}

// Sub-component: Event Details Card List
const EventDetailsCardList = ({
    event,
    currency,
}: {
    event: TransactionEventData;
    currency: string;
}) => {
    const hours = event.event.duration / 60;
    const studentCount = event.booking.students.length;

    // Calculate teacher earnings (pre-calculated in TransactionEventData)
    const earnings = event.financials.teacherEarnings;

    const pricePerHour = event.commission.type === "fixed" 
        ? event.commission.cph 
        : (event.packageData.pricePerStudent * studentCount * (event.commission.cph / 100));

    // Get student name
    const studentName = event.booking.students.length > 0
        ? `${event.booking.students[0].firstName} ${event.booking.students[0].lastName}`
        : event.booking.leaderStudentName;

    const fields = [
        {
            label: studentCount > 1 ? "Student 1" : "Student",
            value: studentName,
        },
        { label: "Location", value: event.event.location || "TBD" },
        { label: "Package", value: event.packageData.description || "Private Lesson" },
        {
            label: "Earnings",
            value: `(${pricePerHour.toFixed(0)} ${currency} x ${hours.toFixed(1)} hrs) ${earnings.toFixed(0)} ${currency}`,
        },
    ];

    return <CardList fields={fields} />;
};

// Main Component
export function EventUserConfirmation({ event, viewMode, currency, onConfirm }: EventUserConfirmationProps) {
    const isTBC = event.event.status === "tbc";

    // Footer content
    const footerLeftContent = (
        <EquipmentStudentCommissionBadge
            categoryEquipment={event.packageData.categoryEquipment}
            equipmentCapacity={event.packageData.capacityEquipment}
            studentCapacity={event.packageData.capacityStudents}
            commissionType={event.commission.type}
            commissionValue={event.commission.cph}
        />
    );

    return (
        <div className={`${isTBC && viewMode === "teacher" ? "ring-2 ring-purple-500/50 rounded-3xl" : ""}`}>
            <EventUserCard
                date={event.event.date}
                duration={event.event.duration}
                status={event.event.status}
                footerLeftContent={footerLeftContent}
            >
                <EventDetailsCardList event={event} currency={currency} />
            </EventUserCard>
        </div>
    );
}
