"use client";

import { useState } from "react";
import { STAT_TYPE_CONFIG } from "@/backend/data/StatsData";
import { motion, AnimatePresence } from "framer-motion";
import TableIcon from "@/public/appSvgs/TableIcon";
import { ChevronDown, ChevronRight } from "lucide-react";
import { StatsPreview } from "./StatsPreview";

const CORE_STATS = [
    { id: "student", number: "01", title: "Students", description: "Registration & tracking" },
    { id: "teacher", number: "02", title: "Teachers", description: "Hours & commissions" },
    { id: "equipment", number: "03", title: "Equipment", description: "Lifecycle management" },
    { id: "package", number: "04", title: "Packages", description: "Set your prices" },
    { id: "booking", number: "05", title: "Bookings", description: "Smart scheduling" },
];

export default function StatsExplainer() {
    const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

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
                                        const iconDiv = e.currentTarget.querySelector("[data-icon-container]") as HTMLElement;
                                        if (iconDiv) {
                                            if (!iconDiv.dataset.originalBorder) {
                                                iconDiv.dataset.originalBorder = getComputedStyle(iconDiv).borderColor;
                                            }
                                            iconDiv.style.borderColor = config.color;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        const iconDiv = e.currentTarget.querySelector("[data-icon-container]") as HTMLElement;
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
                                                <StatsPreview pillarId={pillar.id} />
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
