"use client";

import { motion, AnimatePresence } from "framer-motion";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { EquipmentFulfillmentCell } from "@/src/components/equipment/EquipmentFulfillmentCell";
import type { TimelineEvent } from "@/src/components/timeline/types";

interface LessonEventRowProps {
    events: TimelineEvent[];
    isExpanded: boolean;
    equipmentCategory?: string;
    teacherId?: string;
    teacherUsername?: string;
    onEquipmentUpdate?: (eventId: string, equipment: any) => void;
}

export function LessonEventRow({ 
    events, 
    isExpanded, 
    equipmentCategory,
    teacherId,
    teacherUsername,
    onEquipmentUpdate,
}: LessonEventRowProps) {
    return (
        <AnimatePresence>
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-border"
                >
                    <div className="px-6 py-3 space-y-2">
                        {events.map((event) => {
                            const statusConfig = EVENT_STATUS_CONFIG[event.eventStatus as keyof typeof EVENT_STATUS_CONFIG];
                            const currentYear = new Date().getFullYear();
                            const eventYear = event.date.getFullYear();
                            const dateFormatted = event.date.toLocaleDateString("en-US", { 
                                day: "numeric", 
                                month: "short",
                                ...(eventYear !== currentYear ? { year: "numeric" } : {})
                            }).replace(",", "");
                            const durationFormatted = event.durationLabel;

                            return (
                                <div
                                    key={event.eventId}
                                    className="flex items-center justify-between gap-4 py-2 text-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div style={{ color: statusConfig?.color }}>
                                            <FlagIcon size={16} />
                                        </div>
                                        <span className="font-medium min-w-[100px]">{dateFormatted}</span>
                                        <span className="font-mono text-muted-foreground min-w-[60px]">{event.time}</span>
                                        <span className="font-mono text-muted-foreground min-w-[50px]">{durationFormatted}</span>
                                    </div>
                                    <EquipmentFulfillmentCell
                                        eventId={event.eventId}
                                        eventTime={event.time}
                                        eventDuration={event.duration}
                                        equipments={event.equipments?.map((eq) => ({
                                            id: eq.id,
                                            brand: eq.brand,
                                            model: eq.model,
                                            size: eq.size,
                                            sku: eq.sku,
                                            color: eq.color,
                                        }))}
                                        categoryId={equipmentCategory || event.equipmentCategory}
                                        teacherId={teacherId}
                                        teacherUsername={teacherUsername}
                                        eventStatus={event.eventStatus}
                                        onUpdate={onEquipmentUpdate}
                                    />
                                </div>
                            );
                        })}
                        {events.length === 0 && (
                            <div className="text-sm text-muted-foreground py-2 text-center">No events scheduled</div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
