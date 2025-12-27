"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon.jsx";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import { CardList } from "@/src/components/ui/card/card-list";
import { EventStartDurationTime } from "@/src/components/ui/EventStartDurationTime";
import { minutesToHours } from "@/getters/duration-getter";
import { MapPin } from "lucide-react";

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
}: EventStudentCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const teacherFirstName = teacherName.split(" ")[0];

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

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

    return (
        <motion.div 
            layout
            className="group relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg"
        >
            {/* High Contrast Header */}
            <div className="flex items-center justify-between bg-zinc-900 px-6 py-5 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <EventStartDurationTime date={date} duration={duration} />
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm dark:bg-zinc-900/10 dark:border-zinc-900/20" />
            </div>

            {/* Collapsible Content Body */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 pt-2">
                            <CardList fields={fields} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer / Toggle Trigger */}
            <div className="p-4 flex items-center justify-between min-h-[64px] border-t border-border/50">
                <div className="flex items-center gap-5">
                    {/* Info moves/fades but stays present or transforms */}
                    <motion.div
                        layout
                        className="flex items-center gap-5 text-muted-foreground"
                    >
                        <div className="flex items-center gap-2">
                            <HeadsetIcon size={20} className="text-green-500" />
                            <span className={`text-sm font-medium transition-colors ${isOpen ? "text-foreground" : ""}`}>
                                {teacherFirstName}
                            </span>
                        </div>

                        <div className="h-4 w-px bg-border" />

                        <div className="flex items-center gap-2">
                            <MapPin size={18} className="text-foreground/70" />
                            <span className={`text-sm font-medium truncate max-w-[120px] transition-colors ${isOpen ? "text-foreground" : ""}`}>
                                {location}
                            </span>
                        </div>
                    </motion.div>
                </div>

                <div className="flex-1" />

                <button
                    onClick={handleToggle}
                    className="relative flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors duration-300 outline-none ml-4"
                >
                    <AnimatePresence>
                        {isOpen && (
                            <motion.span
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="text-xs font-bold uppercase tracking-widest text-primary"
                            >
                                Details
                            </motion.span>
                        )}
                    </AnimatePresence>
                    
                    <motion.div 
                        animate={{ rotate: isOpen ? 180 : 360 }}
                        whileHover={{ rotate: isOpen ? 192 : 372 }}
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
