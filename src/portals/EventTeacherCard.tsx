"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon.jsx";
import { CardList } from "@/src/components/ui/card/card-list";
import { EventStartDurationTime } from "@/src/components/ui/EventStartDurationTime";
import { minutesToHours } from "@/getters/duration-getter";
import { MapPin } from "lucide-react";
import { EquipmentStudentCommissionBadge } from "@/src/components/ui/badge/equipment-student-commission";

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
    status,
    categoryEquipment,
    capacityEquipment = 0,
    commissionType = "fixed",
    commissionValue = 0,
}: EventTeacherCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    const durationHours = minutesToHours(duration);
    const totalPrice = (pricePerHour * durationHours).toFixed(0);

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
        { label: "Earnings", value: `${totalPrice} €` },
    ];

    return (
        <motion.div 
            layout
            className="group relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg"
        >
            {/* High Contrast Header */}
            <div className="flex items-center justify-between bg-zinc-900 px-6 py-5 text-white dark:bg-zinc-100 dark:text-zinc-900">
                {/* Left Side: Time and Duration */}
                <EventStartDurationTime date={date} duration={duration} />

                {/* Right Side: School Icon Placeholder */}
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm dark:bg-zinc-900/10 dark:border-zinc-900/20" />
            </div>

            {/* Collapsible Content Body */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 pt-2">
                            <CardList fields={fields} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer / Toggle Trigger */}
            <div className="p-4 flex items-center justify-between min-h-[64px]">
                {/* Commission & Location Info visible only when CLOSED */}
                <AnimatePresence>
                    {!isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-5"
                        >
                            <EquipmentStudentCommissionBadge 
                                categoryEquipment={categoryEquipment}
                                equipmentCapacity={capacityEquipment}
                                studentCapacity={capacity}
                                commissionType={commissionType}
                                commissionValue={commissionValue}
                            />

                            <div className="h-4 w-px bg-border" />

                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin size={20} className="text-foreground/70" />
                                <span className="text-sm font-medium truncate max-w-[120px]">{location}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Spacer to push icon right if info is hidden */}
                <div className="flex-1" />

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative text-foreground/80 hover:text-primary transition-colors duration-300 outline-none ml-4"
                    aria-label={isOpen ? "Collapse details" : "Expand details"}
                >
                    <motion.div 
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        whileHover={{ rotate: isOpen ? 192 : 12 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="origin-center"
                    >
                        <AdranlinkIcon size={32} />
                    </motion.div>
                </button>
            </div>
        </motion.div>
    );
}