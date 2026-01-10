"use client";

import { motion, AnimatePresence } from "framer-motion";

import { useState, ReactNode } from "react";

import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";

import Image from "next/image";

import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";

import { EventStartDurationTime } from "@/src/components/ui/EventStartDurationTime";

import { LESSON_STATUS_CONFIG } from "@/types/status";

interface EventUserCardProps {
    date: string;

    duration: number;

    status?: string;

    footerLeftContent: ReactNode;

    children: ReactNode;
}

export function EventUserCard({ date, duration, status, footerLeftContent, children }: EventUserCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    const credentials = useSchoolCredentials();

    const statusConfig = status ? LESSON_STATUS_CONFIG[status as keyof typeof LESSON_STATUS_CONFIG] : null;

    return (
        <motion.div
            layout
            className="group relative w-full overflow-hidden rounded-3xl border-[1.5px] border-black bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl"
        >
            {/* Header (Background stays light, text adapts) */}

            <div className="relative flex items-center justify-between px-6 py-6 overflow-hidden bg-white border-b border-neutral-100">
                <div className="relative z-10 flex items-center gap-4">
                    <EventStartDurationTime date={date} duration={duration} className="text-zinc-900" />

                    {statusConfig && (
                        <span
                            className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{
                                backgroundColor: `${statusConfig.color}20`,

                                color: statusConfig.color,
                            }}
                        >
                            {statusConfig.label}
                        </span>
                    )}
                </div>

                {/* School Logo */}
                <div className="relative z-10">
                    {credentials?.logo ? (
                        <div className="relative w-14 h-14 rounded-full overflow-hidden border border-black/10 bg-white shadow-sm">
                            <Image src={credentials.logo} alt={credentials.username} fill className="object-cover" sizes="56px" />
                        </div>
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center border border-black/5 shadow-sm">
                            <span className="font-black text-xl">{credentials?.username?.[0]?.toUpperCase() || "A"}</span>
                        </div>
                    )}
                </div>
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
                        <div className="px-6 py-6">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer (Now Dark Zinc) */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="px-6 py-4 flex items-center justify-between min-h-[72px] bg-zinc-900 text-white cursor-pointer hover:bg-zinc-800 transition-colors"
            >
                <div className="flex items-center gap-5">{footerLeftContent}</div>

                <div className="flex-1" />

                <ToggleAdranalinkIcon isOpen={isOpen} variant="lg" color="white" />
            </div>
        </motion.div>
    );
}
