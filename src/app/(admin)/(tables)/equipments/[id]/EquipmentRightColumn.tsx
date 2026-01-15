"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToggleBar } from "@/src/components/ui/ToggleBar";
import { Calendar, Wrench, Package, MapPin, TrendingUp } from "lucide-react";
import type { EquipmentData } from "@/backend/data/EquipmentData";
import { getHMDuration } from "@/getters/duration-getter";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";

type ViewMode = "events" | "rentals" | "repairs";

interface EquipmentRightColumnProps {
    equipment: EquipmentData;
}

export function EquipmentRightColumn({ equipment }: EquipmentRightColumnProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("events");

    // Sort events by date (newest first)
    const sortedEvents = [...equipment.relations.events].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="space-y-4">
            <ToggleBar
                value={viewMode}
                onChange={(v) => setViewMode(v as ViewMode)}
                options={[
                    { id: "events", label: "Lesson Usage", icon: Calendar },
                    { id: "rentals", label: "Rentals", icon: Package },
                    { id: "repairs", label: "Repairs", icon: Wrench },
                ]}
            />

            <AnimatePresence mode="wait">
                {viewMode === "events" && (
                    <motion.div
                        key="events"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                    >
                        {sortedEvents.length > 0 ? (
                            sortedEvents.map((event) => {
                                const date = new Date(event.date);
                                const dateLabel = date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined
                                });
                                const time = date.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false
                                });

                                // Calculate revenue for this event
                                const pkg = event.lesson?.booking?.school_package;
                                let eventRevenue = 0;
                                if (pkg && pkg.duration_minutes > 0) {
                                    const pricePerMinute = pkg.price_per_student / pkg.duration_minutes;
                                    eventRevenue = pricePerMinute * (event.duration || 0) * (pkg.capacity_students || 1);
                                }

                                return (
                                    <div
                                        key={event.id}
                                        className="p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-muted-foreground" />
                                                    <span className="font-semibold text-foreground">{dateLabel}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FlagIcon size={16} className="text-muted-foreground" />
                                                    <span className="font-mono text-foreground">{time}</span>
                                                </div>
                                                {event.location && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={16} className="text-muted-foreground" />
                                                        <span className="text-sm text-foreground">{event.location}</span>
                                                    </div>
                                                )}
                                                {eventRevenue > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <TrendingUp size={16} className="text-success" />
                                                        <span className="text-sm font-semibold text-success">{Math.round(eventRevenue)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <DurationIcon size={16} className="text-muted-foreground" />
                                                <span className="font-mono font-semibold text-foreground">
                                                    {getHMDuration(event.duration)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                                No lesson usage history found
                            </div>
                        )}
                    </motion.div>
                )}

                {viewMode === "rentals" && (
                    <motion.div
                        key="rentals"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                    >
                        {equipment.relations.rentals.length > 0 ? (
                            equipment.relations.rentals.map((rental) => (
                                <div
                                    key={rental.id}
                                    className="p-4 bg-card border border-border rounded-xl flex items-center justify-between"
                                >
                                    <div>
                                        <div className="font-bold text-foreground">
                                            {rental.students.map((s) => `${s.first_name} ${s.last_name}`).join(", ")}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(rental.date).toLocaleDateString()} | {rental.location}
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-tighter px-2 py-1 rounded bg-primary/10 text-primary">
                                        {rental.status}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                                No rental history found
                            </div>
                        )}
                    </motion.div>
                )}

                {viewMode === "repairs" && (
                    <motion.div
                        key="repairs"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                    >
                        {equipment.relations.repairs.length > 0 ? (
                            equipment.relations.repairs.map((repair) => (
                                <div key={repair.id} className="p-4 bg-card border border-border rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-muted-foreground">
                                            {new Date(repair.created_at).toLocaleDateString()}
                                        </span>
                                        <Wrench size={14} className="text-muted-foreground" />
                                    </div>
                                    <div className="text-sm text-foreground font-medium">
                                        {repair.description || "No description provided"}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                                No repair history found
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
