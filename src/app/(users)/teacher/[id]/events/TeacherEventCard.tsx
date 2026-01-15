"use client";

import type { EventNode } from "@/types/classboard-teacher-queue";
import { CardList } from "@/src/components/ui/card/card-list";
import { EventUserCard } from "@/src/components/events/EventUserCard";
import { EquipmentStudentCommissionBadge } from "@/src/components/ui/badge/equipment-student-commission";
import { MapPin } from "lucide-react";
import { minutesToHours } from "@/getters/duration-getter";

interface TeacherEventCardProps {
    event: EventNode;
    currency: string;
}

export function TeacherEventCard({ event, currency }: TeacherEventCardProps) {
    const durationHours = minutesToHours(event.eventData.duration);

    // Calculate earnings
    let earnedAmount = 0;
    if (event.commission.type === "fixed") {
        earnedAmount = event.commission.cph * durationHours;
    } else {
        const revenue = event.pricePerStudent * event.bookingStudents.length * durationHours;
        earnedAmount = revenue * (event.commission.cph / 100);
    }

    // Format earnings breakdown string
    const earningsLabel =
        event.commission.type === "fixed"
            ? `Earnings (${event.commission.cph} ${currency} x ${durationHours.toFixed(1)} hrs)`
            : `Earnings (${event.commission.cph}% of Revenue)`;

    // Prepare student names
    const studentNames = event.bookingStudents.map((s) => `${s.firstName} ${s.lastName}`.trim());

    // Prepare fields for CardList
    const studentFields = studentNames.map((name, index) => ({
        label: `Student ${index + 1}`,
        value: name,
    }));

    const fields = [
        ...studentFields,
        { label: "Location", value: event.eventData.location },
        { label: earningsLabel, value: `${earnedAmount.toFixed(0)} ${currency}` },
    ];

    const footerLeftContent = (
        <div className="flex items-center gap-5">
            <div className="[&_span]:text-white">
                <EquipmentStudentCommissionBadge
                    categoryEquipment={event.categoryEquipment}
                    equipmentCapacity={event.capacityEquipment}
                    studentCapacity={event.capacityStudents}
                    commissionType={event.commission.type}
                    commissionValue={event.commission.cph}
                />
            </div>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2 text-zinc-400">
                <MapPin size={20} className="text-zinc-400" />
                <span className="text-sm font-semibold tracking-tight truncate max-w-[120px] text-zinc-300">{event.eventData.location}</span>
            </div>
        </div>
    );

    return (
        <EventUserCard
            date={event.eventData.date}
            duration={event.eventData.duration}
            status={event.eventData.status}
            footerLeftContent={footerLeftContent}
        >
            <CardList fields={fields} />
        </EventUserCard>
    );
}
