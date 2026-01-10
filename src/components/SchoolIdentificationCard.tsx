"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";

interface SchoolIdentificationCardProps {
    name: string;
    username: string;
    country: string;
    currency: string;
    equipmentCategories?: string | null;
    iconUrl?: string | null;
}

export function SchoolIdentificationCard({
    name,
    username,
    country,
    currency,
    equipmentCategories,
    iconUrl,
}: SchoolIdentificationCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Parse categories from comma-separated string
    const categories = equipmentCategories
        ? equipmentCategories
              .split(",")
              .map((cat) => cat.trim())
              .filter(Boolean)
        : [];

    return (
        <Link href={`/subdomain?username=${username}`}>
            <motion.div
                layout
                className="group relative w-full overflow-hidden rounded-3xl border-[1.5px] border-black bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl cursor-pointer"
            >
                {/* Header (Background stays light, text adapts) */}
                <div className="relative flex items-center justify-between px-6 py-6 overflow-hidden bg-white border-b border-neutral-100">
                    {/* Background Banner (Subtle texture) */}
                    <div className="absolute inset-0 z-0">
                        <Image src="/beach-banner.jpg" alt="Banner" fill className="object-cover opacity-10 grayscale" priority />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
                    </div>

                    <div className="relative z-10 flex items-center gap-4">
                        {/* School Logo */}
                        {iconUrl ? (
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-black/10 bg-white/50 backdrop-blur-sm shadow-sm flex-shrink-0">
                                <Image src={iconUrl} alt={name} fill className="object-cover" sizes="48px" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center border border-black/5 backdrop-blur-sm flex-shrink-0">
                                <span className="font-black text-lg">{name[0]?.toUpperCase() || "S"}</span>
                            </div>
                        )}

                        {/* School Name */}
                        <div>
                            <h3 className="text-xl font-bold text-zinc-900">{name}</h3>
                            <p className="text-sm text-zinc-600">@{username}</p>
                        </div>
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
                                {categories.length > 0 ? (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-muted-foreground">Categories Offered</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map((category, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-sm font-medium"
                                                >
                                                    {category}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No categories listed</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer (Now Dark Zinc) */}
                <div className="px-6 py-4 flex items-center justify-between min-h-[72px] bg-zinc-900 text-white">
                    <div className="flex items-center gap-5">
                        <div className="flex flex-col">
                            <span className="text-xs text-zinc-400">Location</span>
                            <span className="text-sm font-semibold">{country}</span>
                        </div>
                        <div className="w-px h-8 bg-zinc-700" />
                        <div className="flex flex-col">
                            <span className="text-xs text-zinc-400">Currency</span>
                            <span className="text-sm font-semibold">{currency}</span>
                        </div>
                    </div>

                    <div className="flex-1" />

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setIsOpen(!isOpen);
                        }}
                        className="focus:outline-none"
                    >
                        <ToggleAdranalinkIcon isOpen={isOpen} onClick={() => {}} variant="lg" color="white" />
                    </button>
                </div>
            </motion.div>
        </Link>
    );
}
