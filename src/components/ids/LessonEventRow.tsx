"use client";

import { motion, AnimatePresence } from "framer-motion";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { getHMDuration } from "@/getters/duration-getter";
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
                            
                            // Format date like HomeGrouped.tsx
                            const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                            const months = [
                                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                            ];
                            const dateStr = `${weekdays[event.date.getDay()]} ${event.date.getDate()} ${months[event.date.getMonth()]}`;

                            return (
                                <div
                                    key={event.eventId}
                                    className="flex items-center justify-between gap-4 py-2 text-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div style={{ color: statusConfig?.color }}>
                                            <FlagIcon size={16} />
                                        </div>
                                        <span className="font-bold min-w-[140px]">
                                            {dateStr}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <DurationIcon size={14} className="text-muted-foreground/70" />
                                            <span className="font-mono text-muted-foreground tabular-nums">{event.time}</span>
                                        </div>
                                        <span className="font-mono text-muted-foreground">
                                            + {getHMDuration(event.duration)}
                                        </span>
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
