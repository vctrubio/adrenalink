import React from "react";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import RequestIcon from "@/public/appSvgs/RequestIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";
import RepairIcon from "@/public/appSvgs/RepairIcon";
import { TrendingUp, TrendingDown, TrendingUpDown, Bookmark } from "lucide-react";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";

export type StatType =
    | "student"
    | "students"
    | "studentPackage"
    | "studentPayments"
    | "package"
    | "packages"
    | "request"
    | "requests"
    | "teacher"
    | "teachers"
    | "teacherPayments"
    | "lesson"
    | "lessons"
    | "events"
    | "completed"
    | "duration"
    | "booking"
    | "bookings"
    | "commission"
    | "revenue"
    | "profit"
    | "loss"
    | "payments"
    | "rentals"
    | "equipment"
    | "equipments"
    | "repairs";

interface StatTypeConfig {
    icon: any;
    color: string;
    label: string;
}

export const STAT_TYPE_CONFIG: Record<StatType, StatTypeConfig> = {
    student: { icon: HelmetIcon, color: "#eab308", label: "Student" },
    students: { icon: HelmetIcon, color: "#eab308", label: "Students" },
    studentPackage: { icon: RequestIcon, color: "#f59e0b", label: "Package" },
    studentPayments: { icon: CreditIcon, color: "#eab308", label: "Student Payments" },
    //
    package: { icon: Bookmark, color: "#fb923c", label: "Package" },
    packages: { icon: Bookmark, color: "#fb923c", label: "Packages" },
    request: { icon: RequestIcon, color: "#f59e0b", label: "Request" },
    requests: { icon: RequestIcon, color: "#f59e0b", label: "Requests" },
    //
    teacher: { icon: HeadsetIcon, color: "#22c55e", label: "Teacher" },
    teachers: { icon: HeadsetIcon, color: "#22c55e", label: "Teachers" },
    teacherPayments: { icon: CreditIcon, color: "#6b7280", label: "Teacher Payments" },
    commission: { icon: HandshakeIcon, color: "#10b981", label: "Commission" },
    //
    booking: { icon: BookingIcon, color: "#3b82f6", label: "Booking" },
    bookings: { icon: BookingIcon, color: "#3b82f6", label: "Bookings" },
    lesson: { icon: LessonIcon, color: "#7dd3fc", label: "Lesson" },
    lessons: { icon: LessonIcon, color: "#7dd3fc", label: "Lessons" },
    duration: { icon: DurationIcon, color: "#4b5563", label: "Duration" },
    events: { icon: FlagIcon, color: "#06b6d4", label: "Events" },
    completed: { icon: FlagIcon, color: "#06b6d4", label: "Completed" },
    //
    revenue: { icon: TrendingUpDown, color: "#eab308", label: "Revenue" },
    profit: { icon: TrendingUp, color: "rgb(251, 146, 60)", label: "Profit" },
    loss: { icon: TrendingDown, color: "rgb(251, 146, 60)", label: "Deficit" },
    payments: { icon: CreditIcon, color: "#6b7280", label: "Payments" },
    //
    rentals: { icon: HelmetIcon, color: "#ef4444", label: "Rentals" },
    equipment: { icon: EquipmentIcon, color: "#a855f7", label: "Equipment" },
    equipments: { icon: EquipmentIcon, color: "#a855f7", label: "Equipments" },
    repairs: { icon: RepairIcon, color: "#a855f7", label: "Repairs" },
};

export function StatItemUI({
    type,
    value,
    hideLabel = false,
    labelOverride,
    variant = "default",
    iconColor = false,
    desc,
    className = "",
}: {
    type: StatType;
        value: number | string | React.ReactNode; 
        hideLabel?: boolean; 
        labelOverride?: string; 
        variant?: "profit" | "loss" | "default" | "primary";
        iconColor?: boolean;
        desc?: string;
        className?: string;
    }) {
            const config = STAT_TYPE_CONFIG[type];
            if (!config) return null;
        
            let displayValue: string | number | React.ReactNode = value;
            
            if (type === "duration" && typeof value === "number") {
                displayValue = getHMDuration(value);
            } else if (["revenue", "profit", "loss", "payments", "studentPayments", "teacherPayments", "commission", "balance"].includes(type)) {
                // Try to parse string numbers if needed, but prefer raw numbers
                const num = typeof value === "string" ? parseFloat(value) : typeof value === "number" ? value : NaN;
                if (!isNaN(num)) {
                    displayValue = getCompactNumber(num);
                }
            }
        
            const numValue = typeof value === "string" ? parseFloat(value) : typeof value === "number" ? value : NaN;
        
            // Dynamic icon logic for financials - only for specific trending types
            let Icon = config.icon;
            const isTrendingType = ["profit", "loss", "balance"].includes(type);
    
        if (isTrendingType && !isNaN(numValue)) {
            if (numValue > 0) Icon = TrendingUp;
            else if (numValue < 0) Icon = TrendingDown;
            else Icon = TrendingUpDown;
        }
    
        const title = labelOverride || config.label;
    
        // Variant-based color overrides
        let displayColor = config.color;
        let containerClass = "";
    
        if (variant === "profit") displayColor = "#10b981"; // Emerald
        if (variant === "loss") displayColor = "#f43f5e"; // Rose
    
        if (variant === "primary") {
            containerClass = "bg-primary/20 rounded-full px-2.5 py-0.5 border border-primary/30";
        }
    
        return (
            <div className={`flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity cursor-help ${containerClass} ${className}`} title={title}>
                <span 
                    className={`inline-flex ${!iconColor && variant !== "primary" ? "text-muted-foreground" : ""} ${variant === "primary" ? "text-primary" : ""}`} 
                    style={iconColor && variant !== "primary" ? { color: displayColor } : undefined}
                >
                    <Icon size={12} />
                </span>
                {!hideLabel && (
                    <span 
                        className={`text-[10px] font-bold uppercase tracking-wider ${variant === "primary" ? "text-primary" : "text-muted-foreground"}`} 
                        style={variant !== "default" && variant !== "primary" ? { color: displayColor } : undefined}
                    >
                        {labelOverride || config.label}:
                    </span>
                )}
                <span 
                    className={`tabular-nums ${!className.includes("text-") ? "text-xs font-bold" : ""} ${variant === "primary" ? "text-primary" : "text-foreground"}`} 
                    style={variant !== "default" && variant !== "primary" ? { color: displayColor } : undefined}
                >
                    {displayValue}
                </span>
            </div>
        );
    }
