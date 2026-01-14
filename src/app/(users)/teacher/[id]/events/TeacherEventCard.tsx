"use client";

import type { EventModel } from "@/backend/data/EventModel";
import type { EventStatus } from "@/types/status";
import { CardList } from "@/src/components/ui/card/card-list";
import { EventUserCard } from "@/src/components/events/EventUserCard";
import { EquipmentStudentCommissionBadge } from "@/src/components/ui/badge/equipment-student-commission";
import { BrandSizeCategoryList } from "@/src/components/ui/badge/brand-size-category";
import { MapPin } from "lucide-react";
import { minutesToHours } from "@/getters/duration-getter";

interface TeacherEventCardProps {
    event: EventModel;
    teacherId: string;
    teacherUsername: string;
    currency: string;
    onStatusChange?: () => void;
    onEquipmentAssign?: () => void;
}

export function TeacherEventCard({
    event,
    teacherId,
    teacherUsername,
    currency,
    onStatusChange,
    onEquipmentAssign,
}: TeacherEventCardProps) {
    const durationHours = minutesToHours(event.duration);
    const earnedAmount = event.teacherEarning;

    // Format earnings breakdown string
    const earningsLabel =
        event.commissionType === "fixed"
            ? `Earnings (${event.commissionCph} ${currency} x ${durationHours.toFixed(1)} hrs)`
            : `Earnings (${event.commissionCph}% of Revenue)`;

    // Prepare student names
    const studentNames = event.bookingStudents.map((s) => `${s.firstName} ${s.lastName}`.trim());

    // Prepare fields for CardList
    const studentFields = studentNames.map((name, index) => ({
        label: `Student ${index + 1}`,
        value: name,
    }));

    const fields = [
        ...studentFields,
        { label: "Location", value: event.location },
        { label: earningsLabel, value: `${earnedAmount.toFixed(0)} ${currency}` },
    ];

    const hasEquipmentAssigned = event.equipments && event.equipments.length > 0;

    const footerLeftContent = (
        <div className="flex items-center gap-5">
            <div className="[&_span]:text-white">
                <EquipmentStudentCommissionBadge
                    categoryEquipment={event.equipmentCategory}
                    equipmentCapacity={event.capacityEquipment || 0}
                    studentCapacity={event.capacityStudents || 0}
                    commissionType={event.commissionType}
                    commissionValue={event.commissionCph}
                />
            </div>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2 text-zinc-400">
                <MapPin size={20} className="text-zinc-400" />
                <span className="text-sm font-semibold tracking-tight truncate max-w-[120px] text-zinc-300">{event.location}</span>
            </div>

            {/* Equipment display */}
            {/* {hasEquipmentAssigned && ( */}
            {/*     <> */}
            {/*         <div className="h-4 w-px bg-white/10" /> */}
            {/*         <BrandSizeCategoryList */}
            {/*             equipments={event.equipments!.map((eq) => ({ */}
            {/*                 id: eq.id, */}
            {/*                 model: eq.brand ? `${eq.brand} ${eq.model}` : eq.model, */}
            {/*                 size: eq.size, */}
            {/*             }))} */}
            {/*             showIcon={true} */}
            {/*         /> */}
            {/*     </> */}
            {/* )} */}
        </div>
    );

    return (
        <EventUserCard
            date={event.date.toISOString()}
            duration={event.duration}
            status={event.eventStatus}
            footerLeftContent={footerLeftContent}
        >
            <CardList fields={fields} />
        </EventUserCard>
    );
}
