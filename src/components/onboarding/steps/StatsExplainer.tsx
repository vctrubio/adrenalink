"use client";

import { useState } from "react";
import { STAT_TYPE_CONFIG } from "@/backend/data/StatsData";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { motion, AnimatePresence } from "framer-motion";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import RequestIcon from "@/public/appSvgs/RequestIcon";
import TableIcon from "@/public/appSvgs/TableIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import PPHIcon from "@/public/appSvgs/PPHIcon";
import RepairIcon from "@/public/appSvgs/RepairIcon";
import KiteIcon from "@/public/appSvgs/Equipments/KiteIcon";
import WingIcon from "@/public/appSvgs/Equipments/WingIcon";
import WindsurfIcon from "@/public/appSvgs/Equipments/WindsurfIcon";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge/equipment-student-capacity";
import { TeacherLessonStatsBadge } from "@/src/components/ui/badge/teacher-lesson-stats";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { BookingStatusDropdown } from "@/src/components/labels/BookingStatusDropdown";
import { getHMDuration } from "@/getters/duration-getter";
import { DDD } from "@/src/components/ui/DDD";
import { PPP } from "@/src/components/ui/PPP";
import { ChevronDown, ChevronRight, ArrowRight, Activity, TrendingUpDown, TrendingUp, Clock, Globe, Lock, LayoutGrid } from "lucide-react";

const CORE_STATS = [
    { id: "student", number: "01", title: "Students", description: "Registration & tracking" },
    { id: "teacher", number: "02", title: "Teachers", description: "Hours & commissions" },
    { id: "package", number: "03", title: "Packages", description: "Set your prices" },
    { id: "equipment", number: "04", title: "Equipment", description: "Lifecycle management" },
    { id: "booking", number: "05", title: "Bookings", description: "Smart scheduling" },
];

export default function StatsExplainer() {
    const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
    const [isIndependent, setIsIndependent] = useState(false);
    const [isTeacherActive, setIsTeacherActive] = useState(true);

    const togglePillar = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedPillar(expandedPillar === id ? null : id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl"
        >
            <div className="space-y-0">
                <div className="text-center mb-12 space-y-3">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">The System Architecture</h2>
                    <div className="flex items-center justify-center gap-2 opacity-60">
                        <TableIcon size={16} className="text-primary" />
                        <p className="text-sm font-black uppercase tracking-widest">Our Five Pillars</p>
                    </div>
       
                </div>

                <AnimatePresence>
                    {CORE_STATS.map((pillar) => {
                        const config = STAT_TYPE_CONFIG[pillar.id as keyof typeof STAT_TYPE_CONFIG] || STAT_TYPE_CONFIG.students;
                        const isExpanded = expandedPillar === pillar.id;

                        return (
                            <motion.div
                                key={pillar.id}
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                className="border-t border-border overflow-hidden"
                            >
                                <div
                                    onClick={(e) => togglePillar(pillar.id, e)}
                                    className="group py-10 flex items-center gap-8 px-6 cursor-pointer"
                                    onMouseEnter={(e) => {
                                        const iconDiv = e.currentTarget.querySelector('[data-icon-container]') as HTMLElement;
                                        if (iconDiv) {
                                            if (!iconDiv.dataset.originalBorder) {
                                                iconDiv.dataset.originalBorder = getComputedStyle(iconDiv).borderColor;
                                            }
                                            iconDiv.style.borderColor = config.color;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        const iconDiv = e.currentTarget.querySelector('[data-icon-container]') as HTMLElement;
                                        if (iconDiv && iconDiv.dataset.originalBorder) {
                                            iconDiv.style.borderColor = iconDiv.dataset.originalBorder;
                                        }
                                    }}
                                >
                                    <div>
                                        <div
                                            data-icon-container
                                            className="w-12 h-12 flex items-center justify-center rounded-2xl shadow-sm border border-border/50 transition-all"
                                            style={{ color: config.color }}
                                        >
                                            <config.icon size={22} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-display text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                                            {pillar.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{pillar.description}</p>
                                    </div>
                                    <div className="shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
                                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-6 pb-10 bg-muted/10 border-b border-border/30"
                                        >
                                            <div className="pl-28">
                                                {pillar.id === "student" && (
                                                    <div className="flex flex-col lg:flex-row items-center gap-12">
                                                        {/* Passport/ID Card Illustration */}
                                                        <div className="relative group/id">
                                                            <div className="absolute -inset-4 bg-yellow-500/5 rounded-[2rem] blur-2xl group-hover/id:bg-yellow-500/10 transition-all" />
                                                            <div className="relative w-72 h-44 bg-card border-2 border-border/80 rounded-2xl shadow-xl p-5 flex gap-4 overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-3">
                                                                    <div className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] rotate-90 origin-right translate-x-4">
                                                                        Identification
                                                                    </div>
                                                                </div>
                                                                <div className="w-24 h-full bg-muted/50 rounded-xl flex items-center justify-center border border-border/50 shrink-0">
                                                                    <HelmetIcon size={48} rental={isIndependent} className={!isIndependent ? "text-yellow-500/40" : ""} />
                                                                </div>
                                                                <div className="flex-1 space-y-3 pt-1">
                                                                    <div className="space-y-1">
                                                                        <div className="h-3 w-24 bg-foreground/10 rounded" />
                                                                        <div className="h-2 w-16 bg-muted-foreground/20 rounded" />
                                                                    </div>
                                                                    <div className="space-y-2 pt-2">
                                                                        <div className="flex gap-2">
                                                                            <div className="h-1.5 w-12 bg-muted rounded" />
                                                                            <div className="h-1.5 w-16 bg-muted rounded" />
                                                                        </div>
                                                                        <div className="h-1.5 w-full bg-muted/60 rounded" />
                                                                        <div className="h-1.5 w-4/5 bg-muted/60 rounded" />
                                                                        <div 
                                                                            className="flex items-center justify-end gap-2 pt-1 cursor-pointer group/toggle"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setIsIndependent(!isIndependent);
                                                                            }}
                                                                        >
                                                                            <span className={`text-[7px] font-black uppercase tracking-tighter transition-colors ${isIndependent ? "text-rose-500" : "text-muted-foreground/40"}`}>Independent</span>
                                                                            <div className={`w-5 h-2.5 rounded-full border transition-colors flex items-center px-0.5 ${isIndependent ? "bg-rose-500/20 border-rose-500/30" : "bg-muted border-border"}`}>
                                                                                <motion.div 
                                                                                    animate={{ x: isIndependent ? 10 : 0 }}
                                                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                                                    className={`w-1.5 h-1.5 rounded-full ${isIndependent ? "bg-rose-500" : "bg-muted-foreground/30"}`} 
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4 text-center opacity-60">
                                                                Student Identity Profile
                                                            </p>
                                                        </div>

                                                        {/* Lifecycle Flow */}
                                                        <div className="flex-1 flex flex-col gap-6 w-full">
                                                            <p className="text-sm font-semibold text-foreground/80 mb-2">
                                                                Operational Workflow
                                                            </p>
                                                            <div className="flex items-center justify-between w-full max-w-lg">
                                                                <FlowStep icon={RequestIcon} label="Request" color="#f59e0b" />
                                                                <FlowArrow />
                                                                <FlowStep icon={BookingIcon} label="Bookings" color="#3b82f6" />
                                                                <FlowArrow />
                                                                <FlowStep icon={LessonIcon} label="Lesson" color="#7dd3fc" />
                                                                <FlowArrow />
                                                                <FlowStep icon={FlagIcon} label="Events" color="#06b6d4" />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground leading-relaxed italic max-w-md">
                                                                From the initial request, students are assigned to bookings, which then
                                                                generate lessons and individual events on the classboard.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {pillar.id === "teacher" && (
                                                    <div className="flex flex-col lg:flex-row items-center gap-12">
                                                        {/* Instructor ID Card Illustration */}
                                                        <div className="relative group/id">
                                                            <div className="absolute -inset-4 bg-emerald-500/5 rounded-[2rem] blur-2xl group-hover/id:bg-emerald-500/10 transition-all" />
                                                            <div className="relative w-72 h-44 bg-card border-2 border-border/80 rounded-2xl shadow-xl p-5 flex gap-4 overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-3">
                                                                    <div className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] rotate-90 origin-right translate-x-4">
                                                                        Instructor
                                                                    </div>
                                                                </div>
                                                                <div className="w-24 h-full bg-muted/50 rounded-xl flex items-center justify-center border border-border/50 shrink-0">
                                                                    <HeadsetIcon size={48} className={`transition-all duration-500 ${isTeacherActive ? "text-emerald-500/40" : "text-muted-foreground/20 grayscale"}`} />
                                                                </div>
                                                                <div className="flex-1 space-y-3 pt-1">
                                                                    <div className="space-y-1">
                                                                        <div className="h-3 w-24 bg-foreground/10 rounded" />
                                                                        <div className="h-2 w-16 bg-muted-foreground/20 rounded" />
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                                                        <div className="h-4 w-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full" />
                                                                        <div className="h-4 w-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full" />
                                                                    </div>
                                                                    <div 
                                                                        className="flex items-center justify-end gap-2 pt-2 cursor-pointer group/toggle"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setIsTeacherActive(!isTeacherActive);
                                                                        }}
                                                                    >
                                                                        <span className={`text-[7px] font-black uppercase tracking-tighter transition-colors ${isTeacherActive ? "text-emerald-500" : "text-muted-foreground/40"}`}>Active</span>
                                                                        <div className={`w-5 h-2.5 rounded-full border transition-colors flex items-center px-0.5 ${isTeacherActive ? "bg-emerald-500/20 border-emerald-500/30" : "bg-muted border-border"}`}>
                                                                            <motion.div 
                                                                                animate={{ x: isTeacherActive ? 10 : 0 }}
                                                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                                                className={`w-1.5 h-1.5 rounded-full ${isTeacherActive ? "bg-emerald-500" : "bg-muted-foreground/30"}`} 
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4 text-center opacity-60">
                                                                Teacher Management Profile
                                                            </p>
                                                        </div>

                                                        {/* Performance & Rates */}
                                                        <div className="flex-1 flex flex-col gap-8 w-full">
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <HandshakeIcon size={16} className="text-emerald-500" />
                                                                    <p className="text-sm font-semibold text-foreground/80">
                                                                        Commission Templates
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-4">
                                                                    <div className="px-3 py-2 rounded-xl bg-muted/30 border border-border flex items-center gap-2">
                                                                        <HandshakeIcon size={14} className="text-emerald-500" />
                                                                        <span className="text-xs font-bold">Fixed Amount</span>
                                                                    </div>
                                                                    <div className="px-3 py-2 rounded-xl bg-muted/30 border border-border flex items-center gap-2">
                                                                        <HandshakeIcon size={14} className="text-emerald-500" />
                                                                        <span className="text-xs font-bold">Revenue %</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <LessonIcon size={16} className="text-blue-500" />
                                                                    <p className="text-sm font-semibold text-foreground/80">
                                                                        Lesson History
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-6 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                                                    <div className="flex items-center gap-2">
                                                                        <FlagIcon size={18} className="text-muted-foreground" />
                                                                        <span className="text-xs font-black">Events</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <DurationIcon size={18} className="text-muted-foreground" />
                                                                        <span className="text-xs font-black">Duration</span>
                                                                    </div>
                                                                    <div className="h-4 w-px bg-border mx-2" />
                                                                    <div className="flex items-center gap-2">
                                                                        <TrendingUpDown size={18} className="text-yellow-500" />
                                                                        <span className="text-xs font-black">Revenue Generated</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {pillar.id === "booking" && (
                                                    <div className="flex flex-col lg:flex-row items-start gap-12">
                                                        {/* Booking Form Simulation */}
                                                        <div className="w-72 bg-card border-2 border-border/80 rounded-2xl shadow-xl overflow-hidden shrink-0">
                                                            <div className="bg-primary/5 px-4 py-3 border-b border-border/50 flex items-center justify-between">
                                                                <div className="flex items-center gap-2 scale-90 origin-left">
                                                                    <BookingIcon size={14} className="text-blue-500" />
                                                                    <DateRangeBadge startDate="2025-01-17" endDate="2025-01-21" />
                                                                </div>
                                                            </div>
                                                            <div className="p-4 space-y-4">
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                                        <HelmetIcon size={12} className="text-yellow-500" />
                                                                        <span className="text-[10px] font-bold uppercase">Leader</span>
                                                                    </div>
                                                                    <div className="h-6 w-full bg-muted/50 rounded-lg flex items-center px-2">
                                                                        <span className="text-[10px] font-bold text-foreground">Alice Johnson</span>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="space-y-1.5">
                                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                                            <CreditIcon size={12} />
                                                                            <span className="text-[10px] font-bold uppercase tracking-tighter">
                                                                                Payments
                                                                            </span>
                                                                        </div>
                                                                        <div className="h-6 w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                                                                            <span className="text-[9px] font-black text-emerald-600 uppercase">350 Paid</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                                            <Activity size={12} />
                                                                            <span className="text-[10px] font-bold uppercase tracking-tighter">
                                                                                Status
                                                                            </span>
                                                                        </div>
                                                                        <div className="h-6 w-full bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                                                                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">Ongoing</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Revenue Calculation Example */}
                                                        <div className="flex-1 space-y-6 w-full pt-2">
                                                            <div className="p-5 bg-card border border-border rounded-2xl shadow-sm space-y-5 max-w-lg">
                                                                <div className="flex items-center justify-between text-xs font-bold border-b border-border pb-3">
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <span className="text-muted-foreground uppercase tracking-widest">Package</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[9px] font-black text-primary uppercase tracking-tighter">Package Tag</span>
                                                                        <EquipmentStudentPackagePriceBadge
                                                                            categoryEquipment="kite"
                                                                            equipmentCapacity={1}
                                                                            studentCapacity={1}
                                                                            packageDurationHours={8}
                                                                            pricePerHour={60}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-[1fr_1fr_1fr] gap-6 items-start">
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                            <PPHIcon size={12} />
                                                                            <span className="text-[9px] font-black uppercase tracking-widest">Rate</span>
                                                                        </div>
                                                                        <p className="text-lg font-black text-foreground leading-none">60 <span className="text-[10px] text-muted-foreground">/h</span></p>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                            <DurationIcon size={12} />
                                                                            <span className="text-[9px] font-black uppercase tracking-widest">Duration</span>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <p className="text-lg font-black text-foreground leading-none">5h</p>
                                                                            <span className="text-[9px] text-muted-foreground font-bold mt-1 italic">(5/8 done)</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-1 text-right">
                                                                        <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                                                                            <span className="text-[9px] font-black uppercase tracking-widest">Revenue</span>
                                                                            <TrendingUpDown size={12} />
                                                                        </div>
                                                                        <p className="text-2xl font-black text-emerald-600 leading-none">300</p>
                                                                    </div>
                                                                </div>

                                                                <div className="pt-4 border-t border-border/50 space-y-3">
                                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Assigned Lessons</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <div className="scale-90 origin-left">
                                                                            <TeacherLessonStatsBadge
                                                                                teacherId="t1"
                                                                                teacherUsername="john_smith"
                                                                                eventCount={1}
                                                                                durationMinutes={120}
                                                                                showCommission={true}
                                                                                commission={{ type: "fixed", cph: "20" }}
                                                                            />
                                                                        </div>
                                                                        <div className="scale-90 origin-left">
                                                                            <TeacherLessonStatsBadge
                                                                                teacherId="t2"
                                                                                teacherUsername="sarah_lee"
                                                                                eventCount={1}
                                                                                durationMinutes={180}
                                                                                showCommission={true}
                                                                                commission={{ type: "percentage", cph: "30" }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {pillar.id === "equipment" && (
                                                    <div className="flex flex-col lg:flex-row items-center gap-12">
                                                        {/* Equipment Categories Illustration */}
                                                        <div className="flex flex-col gap-4">
                                                            <div className="grid grid-cols-3 gap-4">
                                                                {[
                                                                    { Icon: KiteIcon, color: "#a855f7", label: "Kite" },
                                                                    { Icon: WingIcon, color: "#9333ea", label: "Wing" },
                                                                    { Icon: WindsurfIcon, color: "#7c3aed", label: "Wind" },
                                                                ].map(({ Icon, color, label }) => (
                                                                    <div key={label} className="flex flex-col items-center gap-2">
                                                                        <div
                                                                            className="w-16 h-16 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center transition-transform hover:scale-105"
                                                                            style={{ color }}
                                                                        >
                                                                            <Icon size={32} />
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                                            {label}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center mt-2 opacity-60">
                                                                Categorized Inventory
                                                            </p>
                                                        </div>

                                                        {/* Management */}
                                                        <div className="flex-1 flex flex-col gap-6 w-full">
                                                            <p className="text-sm font-semibold text-foreground/80">Management</p>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div className="p-4 bg-card border border-border rounded-xl space-y-2">
                                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                                        <HeadsetIcon size={14} className="text-emerald-500" />
                                                                        <span className="text-[9px] font-black uppercase tracking-tight">Teachers</span>
                                                                    </div>
                                                                    <div className="space-y-1 pl-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Assign</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Use</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Track</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="p-4 bg-card border border-border rounded-xl space-y-2">
                                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                                        <RepairIcon size={14} className="text-purple-500" />
                                                                        <span className="text-[9px] font-black uppercase tracking-tight">Repairs</span>
                                                                    </div>
                                                                    <div className="space-y-1 pl-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-1 h-1 rounded-full bg-purple-500" />
                                                                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Date</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-1 h-1 rounded-full bg-purple-500" />
                                                                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Description</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-1 h-1 rounded-full bg-purple-500" />
                                                                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Cost</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <p className="text-sm font-semibold text-foreground/80">Statistics</p>
                                                                <div className="p-5 bg-muted/30 border border-border/50 rounded-2xl space-y-4">
                                                                    <div className="flex items-center justify-between pb-2 border-b border-border/30">
                                                                        <EquipmentDisplay 
                                                                            equipment={{
                                                                                id: "eq1",
                                                                                brand: "North",
                                                                                model: "Rebel",
                                                                                size: 12,
                                                                                category: "kite",
                                                                                sku: "NOR-420",
                                                                                color: "Blue"
                                                                            }}
                                                                            showSku={false}
                                                                        />
                                                                    </div>
                                                                    
                                                                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <FlagIcon size={18} className="text-muted-foreground" />
                                                                            <span className="text-xs font-bold text-foreground uppercase tracking-wide">24</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <DurationIcon size={18} className="text-muted-foreground" />
                                                                            <span className="text-xs font-bold text-foreground uppercase tracking-wide">{getHMDuration(7200)}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <HelmetIcon size={18} className="text-red-500" />
                                                                            <span className="text-xs font-bold text-foreground uppercase tracking-wide">12</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <RepairIcon size={18} className="text-purple-500" />
                                                                            <span className="text-xs font-bold text-foreground uppercase tracking-wide">3</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <TrendingUp size={18} className="text-yellow-500" />
                                                                            <span className="text-xs font-bold text-foreground uppercase tracking-wide">1.2k Profit</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {pillar.id === "package" && (
                                                    <div className="flex flex-col lg:flex-row items-center gap-12">
                                                        {/* Left: Package Profiles */}
                                                        <div className="w-80 space-y-6 shrink-0">
                                                            <div className="space-y-4">
                                                                {/* Private */}
                                                                <div className="p-4 bg-card border border-border rounded-xl shadow-sm space-y-2">
                                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Private Profile</p>
                                                                    <EquipmentStudentPackagePriceBadge
                                                                        categoryEquipment="kite"
                                                                        equipmentCapacity={1}
                                                                        studentCapacity={1}
                                                                        packageDurationHours={8}
                                                                        pricePerHour={60}
                                                                    />
                                                                </div>
                                                                {/* Semi-Private */}
                                                                <div className="p-4 bg-card border border-border rounded-xl shadow-sm space-y-2 opacity-80 scale-95 origin-left">
                                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Semi-Private Profile</p>
                                                                    <EquipmentStudentPackagePriceBadge
                                                                        categoryEquipment="kite"
                                                                        equipmentCapacity={1}
                                                                        studentCapacity={2}
                                                                        packageDurationHours={8}
                                                                        pricePerHour={50}
                                                                    />
                                                                </div>
                                                                {/* Group */}
                                                                <div className="p-4 bg-card border border-border rounded-xl shadow-sm space-y-2 opacity-60 scale-90 origin-left">
                                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Group Profile</p>
                                                                    <EquipmentStudentPackagePriceBadge
                                                                        categoryEquipment="kite"
                                                                        equipmentCapacity={2}
                                                                        studentCapacity={4}
                                                                        packageDurationHours={8}
                                                                        pricePerHour={40}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right: Table Logic */}
                                                        <div className="flex-1 w-full pt-2">
                                                            <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl overflow-hidden max-w-2xl">
                                                                {/* Table Header */}
                                                                <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-4 bg-orange-500/10 px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-orange-800/70 border-b border-orange-500/10">
                                                                    <div>Equipment</div>
                                                                    <div>Students</div>
                                                                    <div>Duration</div>
                                                                    <div className="text-right">Price</div>
                                                                </div>

                                                                <div className="divide-y divide-orange-500/10">
                                                                    {/* Example 1 */}
                                                                    <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-4 px-5 py-4 items-center">
                                                                        <div className="text-xs font-bold text-foreground">1 Kite</div>
                                                                        <div className="text-xs font-bold text-foreground">1 Student</div>
                                                                        <DDD durationMinutes={480} />
                                                                        <PPP pricePerStudent={480} capacityStudents={1} durationMinutes={480} />
                                                                    </div>

                                                                    {/* Example 2 */}
                                                                    <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-4 px-5 py-4 items-center">
                                                                        <div className="text-xs font-bold text-foreground">1 Kite</div>
                                                                        <div className="text-xs font-bold text-foreground">2 Students</div>
                                                                        <DDD durationMinutes={480} />
                                                                        <PPP pricePerStudent={400} capacityStudents={2} durationMinutes={480} />
                                                                    </div>

                                                                    {/* Example 3 */}
                                                                    <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-4 px-5 py-4 items-center">
                                                                        <div className="text-xs font-bold text-foreground">2 Kites</div>
                                                                        <div className="text-xs font-bold text-foreground">4 Students</div>
                                                                        <DDD durationMinutes={480} />
                                                                        <PPP pricePerStudent={320} capacityStudents={4} durationMinutes={480} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div className="border-t border-border" />
            </div>
        </motion.div>
    );
}

function FlowStep({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
    return (
        <div className="flex flex-col items-center gap-3 group/step">
            <div
                className="w-12 h-12 flex items-center justify-center rounded-xl shadow-sm border border-border/50 group-hover/step:scale-110 transition-transform"
                style={{ backgroundColor: `${color}15`, color }}
            >
                <Icon size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">{label}</span>
        </div>
    );
}

function FlowArrow() {
    return (
        <div className="pb-6">
            <ArrowRight size={16} className="text-muted-foreground/30" strokeWidth={3} />
        </div>
    );
}

function EquipmentDisplay({ 
    equipment, 
    iconSize = 16, 
    showSku = true 
}: { 
    equipment: { id: string; brand: string; model: string; size: string | number; category: string; sku: string; color: string };
    iconSize?: number;
    showSku?: boolean;
}) {
    const config = EQUIPMENT_CATEGORIES.find((c) => c.id === equipment.category);
    const Icon = config?.icon || Activity;
    const color = config?.color || "#a855f7";

    return (
        <div className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-2">
                <div style={{ color }}>
                    <Icon size={iconSize} />
                </div>
                <span className="font-bold text-foreground text-sm">
                    {equipment.brand} {equipment.model}
                </span>
                {equipment.size && (
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-black text-[10px]">
                        {equipment.size}
                    </span>
                )}
            </div>
            {showSku && equipment.sku && (
                <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-6">
                    SKU: {equipment.sku} {equipment.color && `• ${equipment.color}`}
                </div>
            )}
        </div>
    );
}