"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, MapPin, DollarSign, User, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import Image from "next/image";
import { TransactionEventData } from "@/types/transaction-event";
import { EVENT_STATUS_CONFIG, type EventStatus } from "@/types/status";
import { getHMDuration } from "@/getters/duration-getter";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { EquipmentStudentPackagePriceBadge } from "../ui/badge/equipment-student-package-price";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";

interface TransactionEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: TransactionEventData;
}

export default function TransactionEventModal({ isOpen, onClose, data }: TransactionEventModalProps) {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!data) return null;

    const { event, teacher, studentNames, packageData, financials } = data;
    const statusConfig = EVENT_STATUS_CONFIG[event.status as EventStatus];
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === packageData.categoryEquipment);
    const EquipmentIcon = equipmentConfig?.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-card border-t sm:border border-border rounded-t-[32px] sm:rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                            <div className="flex items-center gap-3">
                                <Image src="/ADR.webp" alt="Adrenalink" width={24} height={24} />
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight uppercase tracking-tighter">Transaction</h3>
                                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                                        Instructor: {teacher.username}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-6">
                            {/* 1. Booking & Event (BLUE) */}
                            <SectionWrapper
                                title="Booking & Event"
                                colorClass="text-blue-600"
                                bgColorClass="bg-blue-50/50 dark:bg-blue-900/10"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <DataPoint
                                        icon={<FlagIcon size={14} />}
                                        label="Date"
                                        value={new Date(event.date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    />
                                    <DataPoint
                                        icon={<FlagIcon size={14} />}
                                        label="Time"
                                        value={new Date(event.date).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                        })}
                                    />
                                    <DataPoint
                                        icon={<DurationIcon size={14} />}
                                        label="Duration"
                                        value={getHMDuration(event.duration)}
                                    />
                                    <DataPoint icon={<MapPin size={14} />} label="Location" value={event.location || "TBD"} />
                                </div>
                            </SectionWrapper>

                            {/* 2. Students Involved (YELLOW) */}
                            <SectionWrapper
                                title="Involved Students"
                                colorClass="text-yellow-600"
                                bgColorClass="bg-yellow-50/50 dark:bg-yellow-900/10"
                            >
                                <div className="flex flex-wrap gap-2">
                                    {studentNames.map((name, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border"
                                        >
                                            <HelmetIcon size={14} className="text-yellow-500" />
                                            <span className="text-xs font-semibold">{name}</span>
                                        </div>
                                    ))}
                                </div>
                            </SectionWrapper>

                            {/* 3. Package & Equipment (ORANGE) */}
                            <SectionWrapper
                                title="Package Details"
                                colorClass="text-orange-600"
                                bgColorClass="bg-orange-50/50 dark:bg-orange-900/10"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground">{packageData.description}</span>
                                    </div>
                                    <div className="pt-2 border-t border-orange-100/50 dark:border-orange-900/20">
                                        <EquipmentStudentPackagePriceBadge
                                            categoryEquipment={packageData.categoryEquipment}
                                            equipmentCapacity={packageData.capacityEquipment}
                                            studentCapacity={packageData.capacityStudents}
                                            packageDurationHours={packageData.durationMinutes / 60}
                                            pricePerHour={packageData.pricePerStudent / (packageData.durationMinutes / 60)}
                                        />
                                    </div>
                                </div>
                            </SectionWrapper>

                            {/* 4. Financials & Status (GREY/ZINC) */}
                            <SectionWrapper
                                title="Financial Summary"
                                colorClass="text-zinc-600"
                                bgColorClass="bg-zinc-50/50 dark:bg-zinc-900/10"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                            <User size={14} />
                                            <span>Student Revenue</span>
                                        </div>
                                        <span className="font-bold">
                                            {financials.studentRevenue.toFixed(2)} {financials.currency}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                            <HandshakeIcon size={14} />
                                            <span>
                                                Commission{" "}
                                                <span className="font-bold text-foreground ml-1">
                                                    {financials.commissionType === "fixed"
                                                        ? `${financials.commissionValue} ${financials.currency}/h`
                                                        : `${financials.commissionValue}%`}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-destructive">
                                                -{financials.teacherEarnings.toFixed(2)} {financials.currency}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
                                        <div className="flex items-center gap-2 font-bold text-foreground">
                                            <Receipt size={16} />
                                            <span>Total Profit</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-lg font-black text-emerald-600 dark:text-emerald-400">
                                            {financials.profit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                            {financials.profit.toFixed(2)} {financials.currency}
                                        </div>
                                    </div>
                                </div>
                            </SectionWrapper>

                            {/* Status Footer */}
                            <div className="pt-2 flex justify-center pb-4">
                                {statusConfig && (
                                    <div
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em]"
                                        style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
                                    >
                                        {event.status === "completed" && <Check size={14} strokeWidth={4} />}
                                        {statusConfig.label}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function SectionWrapper({
    title,
    children,
    colorClass,
    bgColorClass,
}: {
    title: string;
    children: React.ReactNode;
    colorClass: string;
    bgColorClass: string;
}) {
    return (
        <div className="space-y-3">
            <div className={`py-1.5 rounded-lg ${bgColorClass} inline-block`}>
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${colorClass}`}>{title}</h4>
            </div>
            <div className="px-1">{children}</div>
        </div>
    );
}

function DataPoint({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate">{value}</p>
        </div>
    );
}
