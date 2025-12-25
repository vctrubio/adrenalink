"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/src/components/ui/AnimatedCounter";
import { ENTITY_DATA } from "@/config/entities";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { TrendingUp } from "lucide-react";
import { getHMDuration } from "@/getters/duration-getter";
import { SingleDatePicker } from "@/src/components/pickers/SingleDatePicker";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { ClassboardStats } from "@/backend/ClassboardStats";

interface ClassboardHeaderProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
    draggableBookings: DraggableBooking[];
    classboardStats: ClassboardStats;
}

// Reusable Stat Card Component
function StatCard({ 
    label, 
    icon: Icon, 
    value, 
    color 
}: { 
    label: string; 
    icon: React.ComponentType<{ className?: string, size?: number }>; 
    value: number | string; 
    color: string 
}) {
    return (
        <div
            className="h-20 w-32 rounded-lg border border-border/50 backdrop-blur-sm p-3 flex flex-col justify-between shadow-md transition-shadow duration-300 cursor-default"
            style={{
                background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                borderColor: `${color}40`,
            }}
        >
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
            <div className="flex items-center gap-1.5" style={{ color }}>
                <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center opacity-80">
                    <Icon className="w-5 h-5" size={18} />
                </span>
                <span className="text-lg font-bold whitespace-nowrap">
                    {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
                </span>
            </div>
        </div>
    );
}

export default function ClassboardHeader({ selectedDate, onDateChange, draggableBookings, classboardStats }: ClassboardHeaderProps) {
    const globalStats = classboardStats.getGlobalStats();
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;

    // Common color for Lessons and Duration
    const secondaryStatColor = "#9ca3af"; // Slate-400

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="max-w-md">
                <SingleDatePicker selectedDate={selectedDate} onDateChange={onDateChange} />
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-3 items-center pb-2 px-4 py-3">
                <StatCard 
                    label="Bookings" 
                    icon={BookingIcon} 
                    value={draggableBookings.length} 
                    color={bookingEntity.color} 
                />
                
                <StatCard 
                    label="Lessons" 
                    icon={FlagIcon} 
                    value={globalStats.totalEvents} 
                    color={secondaryStatColor}
                />

                <StatCard 
                    label="Duration" 
                    icon={DurationIcon} 
                    value={getHMDuration(globalStats.totalHours * 60)} 
                    color={secondaryStatColor}
                />

                <StatCard 
                    label="Commission" 
                    icon={HandshakeIcon} 
                    value={Math.round(globalStats.totalEarnings.teacher)} 
                    color="#10b981" 
                />
                
                <StatCard 
                    label="Revenue" 
                    icon={TrendingUp} 
                    value={Math.round(globalStats.totalEarnings.school)} 
                    color="#f97316" 
                />
            </div>
        </div>
    );
}
