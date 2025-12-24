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

function StatCard({ label, icon: Icon, value, color }: { label: string; icon: typeof BookingIcon; value: number; color: string }) {
    return (
        <motion.div
            className="h-20 w-28 rounded-lg border border-border/50 backdrop-blur-sm p-3 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 group cursor-default hover:scale-105"
            style={{
                background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                borderColor: `${color}40`,
            }}
            whileHover={{ scale: 1.05 }}
        >
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
            <div className="flex items-center gap-1" style={{ color }}>
                <span className="w-5 h-5 flex-shrink-0 [&>svg]:w-full [&>svg]:h-full opacity-80 group-hover:opacity-100 transition-opacity">
                    <Icon className="w-5 h-5" />
                </span>
                <span className="text-lg font-bold">
                    <AnimatedCounter value={value} />
                </span>
            </div>
        </motion.div>
    );
}

function LessonsStatCard({ eventCount, totalMinutes }: { eventCount: number; totalMinutes: number }) {
    return (
        <motion.div
            className="h-20 w-28 rounded-lg border border-border/50 backdrop-blur-sm p-3 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 group cursor-default hover:scale-105"
            style={{
                background: "linear-gradient(135deg, #9ca3af15, #9ca3af05)",
                borderColor: "#9ca3af40",
            }}
            whileHover={{ scale: 1.05 }}
        >
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Lessons</span>
            <div className="flex items-center" style={{ color: "#9ca3af" }}>
                <div className="flex items-center gap-0.5">
                    <FlagIcon className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span className="text-lg font-bold">
                        <AnimatedCounter value={eventCount} />
                    </span>
                </div>
                <div className="flex items-center gap-0.5">
                    <DurationIcon size={20} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span className="text-lg font-bold">{getHMDuration(totalMinutes)}</span>
                </div>
            </div>
        </motion.div>
    );
}

export default function ClassboardHeader({ selectedDate, onDateChange, draggableBookings, classboardStats }: ClassboardHeaderProps) {
    const globalStats = classboardStats.getGlobalStats();
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="max-w-md">
                <SingleDatePicker selectedDate={selectedDate} onDateChange={onDateChange} />
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-3 items-center pb-2 px-4 py-3">
                <StatCard label="Bookings" icon={BookingIcon} value={draggableBookings.length} color={bookingEntity.color} />
                <LessonsStatCard eventCount={globalStats.totalEvents} totalMinutes={globalStats.totalHours * 60} />
                <StatCard label="Commission" icon={HandshakeIcon} value={Math.round(globalStats.totalEarnings.teacher)} color="#10b981" />
                <StatCard label="Revenue" icon={TrendingUp} value={Math.round(globalStats.totalEarnings.school)} color="#f97316" />
            </div>
        </div>
    );
}
