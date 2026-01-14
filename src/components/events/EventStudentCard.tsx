"use client";

import { CardList } from "@/src/components/ui/card/card-list";
import { minutesToHours } from "@/getters/duration-getter";
import { MapPin } from "lucide-react";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import { EventUserCard } from "./EventUserCard";

interface EventStudentCardProps {
    teacherName: string;
    location: string;
    date: string;
    duration: number;
    capacity?: number;
    packageDescription?: string;
    pricePerHour?: number;
    status?: string;
    categoryEquipment?: string;
    capacityEquipment?: number;
    schoolLogo?: string | null;
}

export function EventStudentCard({
    teacherName,
    location,
    date,
    duration,
    categoryEquipment,
    capacityEquipment = 0,
    packageDescription = "No description available",
    pricePerHour = 0,
    status,
    schoolLogo,
}: EventStudentCardProps) {
    const teacherFirstName = teacherName.split(" ")[0];

    const equipmentLabel = categoryEquipment
        ? `${categoryEquipment.charAt(0).toUpperCase() + categoryEquipment.slice(1)}${capacityEquipment ? ` (x${capacityEquipment})` : ""}`
        : "None";

    const durationHours = minutesToHours(duration);
    const totalPrice = (pricePerHour * durationHours).toFixed(0);

    const fields = [
        { label: "Instructor", value: teacherFirstName },
        { label: "Location", value: location },
        { label: "Equipment", value: equipmentLabel },
        { label: "Description", value: packageDescription },
        { label: "Price", value: `${totalPrice} €` },
    ];

    const footerLeftContent = (
        <div className="flex items-center gap-5 text-zinc-400">
            <div className="flex items-center gap-2">
                <HeadsetIcon size={20} className="text-green-500" />
                <span className="text-sm font-bold tracking-tight text-white">{teacherFirstName}</span>
            </div>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2">
                <MapPin size={18} className="text-zinc-400" />
                <span className="text-sm font-semibold tracking-tight truncate max-w-[120px] text-zinc-300">{location}</span>
            </div>
        </div>
    );

    return (
        <EventUserCard date={date} duration={duration} status={status} footerLeftContent={footerLeftContent} schoolLogo={schoolLogo}>
            <CardList fields={fields} />
        </EventUserCard>
    );
}
