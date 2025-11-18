"use client";

import { MapPin, Clock, Users, Wind, Euro } from "lucide-react";
import { getPrettyDuration } from "@/getters/duration-getter";

interface EventStudentCardProps {
    teacherName: string;
    location: string;
    date: string;
    duration: number;
    capacity: number;
    packageDescription: string;
    pricePerHour: number;
    status: string;
    categoryEquipment?: string;
    capacityEquipment?: number;
}

export function EventStudentCard({
    teacherName,
    location,
    date,
    duration,
    capacity,
    packageDescription,
    pricePerHour,
    status,
    categoryEquipment,
    capacityEquipment,
}: EventStudentCardProps) {
    const eventDate = new Date(date);
    const dayName = eventDate.toLocaleDateString("en-US", { weekday: "long" });
    const monthDay = eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const time = eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const totalPrice = (pricePerHour * duration) / 60;

    const statusColors = {
        planned: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
        tbc: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
        completed: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
        uncompleted: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
    };

    const statusColor = statusColors[status as keyof typeof statusColors] || statusColors.planned;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">

            {/* Header: Day and Date */}
            <div className="flex items-baseline gap-3 mb-6">
                <h3 className="text-4xl font-black tracking-tight text-foreground">{dayName}</h3>
                <span className="text-xl font-medium text-muted-foreground">{monthDay}</span>
            </div>

            {/* Time & Location - Hero Section */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-border/50">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Time</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{time}</p>
                    <p className="text-sm text-muted-foreground">{getPrettyDuration(duration)}</p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Location</span>
                    </div>
                    <p className="text-lg font-bold text-foreground leading-tight">{location}</p>
                </div>
            </div>

            {/* Teacher Section */}
            <div className="mb-6 pb-6 border-b border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Wind className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Your Instructor</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{teacherName}</h2>
            </div>

            {/* Package Info */}
            <div className="space-y-3 mb-6">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Package</p>
                    <p className="text-base text-foreground leading-relaxed">{packageDescription}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{capacity} {capacity === 1 ? "student" : "students"}</span>
                    </div>
                    {categoryEquipment && capacityEquipment && (
                        <div className="flex items-center gap-2">
                            <span>•</span>
                            <span>{categoryEquipment} x{capacityEquipment}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Badge */}
            <div className="absolute top-6 right-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${statusColor}`}>
                    {status}
                </span>
            </div>

            {/* Price - Bottom */}
            <div className="mt-6 pt-4 border-t border-border/50">
                <div className="flex items-center justify-center gap-2">
                    <Euro className="w-5 h-5 text-foreground" />
                    <span className="text-2xl font-bold text-foreground">{totalPrice.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
