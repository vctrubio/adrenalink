"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, ReactNode } from "react";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import Image from "next/image";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";

interface BookingUserCardProps {
    dateStart: string;
    dateEnd: string;
    status: string;
    footerLeftContent: ReactNode;
    children: ReactNode;
}

export function BookingUserCard({ dateStart, dateEnd, status, footerLeftContent, children }: BookingUserCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const credentials = useSchoolCredentials();

    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    return (
        <motion.div
            layout
            className="group relative w-full overflow-hidden rounded-3xl border-[1.5px] border-black bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl"
        >
            {/* Header (Background stays light, text adapts) */}
            <div className="relative flex items-center justify-between px-6 py-6 overflow-hidden bg-white border-b border-neutral-100">
                {/* Background Banner (Subtle texture) */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/beach-banner.jpg"
                        alt="Banner"
                        fill
                        className="object-cover opacity-10 grayscale"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Start</span>
                                <span className="text-lg font-bold text-zinc-900">
                                    {startDate.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                            <div className="h-8 w-px bg-zinc-300" />
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">End</span>
                                <span className="text-lg font-bold text-zinc-900">
                                    {endDate.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* School Logo */}
                <div className="relative z-10">
                    {credentials?.logo ? (
                        <div className="relative w-14 h-14 rounded-full overflow-hidden border border-black/10 bg-white/50 backdrop-blur-sm shadow-sm">
                            <Image
                                src={credentials.logo}
                                alt={credentials.username}
                                fill
                                className="object-cover"
                                sizes="56px"
                            />
                        </div>
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center border border-black/5 backdrop-blur-sm">
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
                        <div className="px-6 py-6">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer (Now Dark Zinc) */}
            <div className="px-6 py-4 flex items-center justify-between min-h-[72px] bg-zinc-900 text-white">
                <div className="flex items-center gap-5">
                    {footerLeftContent}
                </div>

                <div className="flex-1" />

                <ToggleAdranalinkIcon
                    isOpen={isOpen}
                    onClick={() => setIsOpen(!isOpen)}
                    variant="lg"
                    color="white"
                />
            </div>
        </motion.div>
    );
}
