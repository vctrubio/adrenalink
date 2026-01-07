"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ENTITY_DATA } from "@/config/entities";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { Timeline, type TimelineEvent } from "@/src/components/timeline";
import { ToggleBar } from "@/src/components/ui/ToggleBar";
import { Calendar, Wrench, Package } from "lucide-react";
import type { EquipmentData } from "@/backend/data/EquipmentData";

type ViewMode = "events" | "rentals" | "repairs";

interface EquipmentRightColumnProps {
    equipment: EquipmentData;
}

export function EquipmentRightColumn({ equipment }: EquipmentRightColumnProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("events");
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const rentalEntity = ENTITY_DATA.find((e) => e.id === "rental")!;

    // Convert events to TimelineEvents
    const timelineEvents: TimelineEvent[] = equipment.relations.events.map((e) => ({
        eventId: e.id,
        lessonId: e.lesson_id,
        date: new Date(e.date),
        time: new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateLabel: new Date(e.date).toLocaleDateString(),
        dayOfWeek: new Date(e.date).toLocaleDateString([], { weekday: 'short' }),
        duration: e.duration,
        durationLabel: `${e.duration} mins`,
        location: e.location,
        teacherId: "", // Not directly in event
        teacherName: "",
        teacherUsername: "",
        eventStatus: e.status,
        lessonStatus: "",
        teacherEarning: 0,
        schoolRevenue: 0,
        totalRevenue: 0,
        commissionType: "fixed",
        commissionCph: 0,
    })).sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <div className="space-y-6">
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
                    <motion.div key="events" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {timelineEvents.length > 0 ? (
                            <Timeline events={timelineEvents} currency={currency} showTeacher={false} showFinancials={false} />
                        ) : (
                            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                                No lesson usage history found
                            </div>
                        )}
                    </motion.div>
                )}

                {viewMode === "rentals" && (
                    <motion.div key="rentals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="space-y-3">
                            {equipment.relations.rentals.length > 0 ? (
                                equipment.relations.rentals.map((rental) => (
                                    <div key={rental.id} className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-foreground">
                                                {rental.students.map(s => `${s.first_name} ${s.last_name}`).join(", ")}
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
                        </div>
                    </motion.div>
                )}

                {viewMode === "repairs" && (
                    <motion.div key="repairs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="space-y-3">
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
