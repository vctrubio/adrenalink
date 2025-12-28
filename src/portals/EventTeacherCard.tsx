"use client";

import { CardList } from "@/src/components/ui/card/card-list";
import { minutesToHours } from "@/getters/duration-getter";
import { MapPin } from "lucide-react";
import { EquipmentStudentCommissionBadge } from "@/src/components/ui/badge/equipment-student-commission";
import { EventUserCard } from "./EventUserCard";

interface EventTeacherCardProps {
    students: string[];
    location: string;
    date: string;
    duration: number;
    capacity: number;
    packageDescription: string;
    pricePerHour: number;
    status: string;
    categoryEquipment?: string;
    capacityEquipment?: number;
    commissionType?: "fixed" | "percentage";
    commissionValue?: number;
}

export function EventTeacherCard({
    students,
    location,
    date,
    duration,
    capacity,
    packageDescription,
    pricePerHour,
    categoryEquipment,
    capacityEquipment = 0,
    commissionType = "fixed",
    commissionValue = 0,
}: EventTeacherCardProps) {
    const durationHours = minutesToHours(duration);
    const earnedAmount = pricePerHour * durationHours;

    // Prepare fields for CardList - displaying students
    const studentFields = students.map((studentName, index) => ({
        label: `Student ${index + 1}`,
        value: studentName,
    }));

    // Add extra info to the list
    const fields = [
        ...studentFields,
        { label: "Location", value: location },
        { label: "Package", value: packageDescription },
        { label: "Earnings", value: `${earnedAmount.toFixed(0)} €` },
    ];

    const footerLeftContent = (
        <div className="flex items-center gap-5">
            <EquipmentStudentCommissionBadge 
                categoryEquipment={categoryEquipment}
                equipmentCapacity={capacityEquipment}
                studentCapacity={capacity}
                earnedAmount={earnedAmount}
            />

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2 text-zinc-400">
                <MapPin size={20} className="text-zinc-400" />
                <span className="text-sm font-semibold tracking-tight truncate max-w-[120px] text-zinc-300">{location}</span>
            </div>
        </div>
    );

    return (
        <EventUserCard 
            date={date} 
            duration={duration} 
            footerLeftContent={footerLeftContent}
        >
            <CardList fields={fields} />
        </EventUserCard>
    );
}