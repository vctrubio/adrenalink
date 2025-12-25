"use client";

import { motion, AnimatePresence } from "framer-motion";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";

export interface LessonEventRowData {
    eventId: string;
    date: Date;
    time: string;
    dateLabel: string;
    dayOfWeek?: string;
    duration: number;
    durationLabel: string;
    location: string;
    status: string;
}

interface LessonEventRowProps {
    events: LessonEventRowData[];
    isExpanded: boolean;
}

export function LessonEventRow({ events, isExpanded }: LessonEventRowProps) {
    return (
        <AnimatePresence>
            {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-4 pb-3 space-y-2">
                        {events.map((event) => (
                            <div key={event.eventId} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-sm">
                                <div className="flex items-center gap-3">
                                    <FlagIcon size={14} style={{ color: EVENT_STATUS_CONFIG[event.status as keyof typeof EVENT_STATUS_CONFIG]?.color }} />
                                    <span className="font-medium">{event.date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "2-digit" }).replace(",", "")}&apos;</span>
                                    <span className="font-mono text-muted-foreground">{event.time}</span>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <DurationIcon size={12} />
                                        <span className="font-mono">{event.durationLabel}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <span>{event.location}</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${EVENT_STATUS_CONFIG[event.status as keyof typeof EVENT_STATUS_CONFIG]?.color}20`, color: EVENT_STATUS_CONFIG[event.status as keyof typeof EVENT_STATUS_CONFIG]?.color }}>
                                        {event.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {events.length === 0 && <div className="text-sm text-muted-foreground py-2 text-center">No events scheduled</div>}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
