"use client";

import { motion, AnimatePresence } from "framer-motion";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { ChevronDown } from "lucide-react";

export interface ByTeacherEvent {
    eventId: string;
    date: Date;
    time?: string;
    dateLabel?: string;
    dayOfWeek?: string;
    duration: number;
    durationLabel: string;
    location: string;
    eventStatus: string;
}

export interface ByTeacherLesson {
    lessonId: string;
    id: string;
    name: string;
    username: string;
    events: ByTeacherEvent[];
    totalDuration: number;
    totalHours: number;
    totalEarning: number;
    eventCount: number;
    commissionType: string;
    cph: number;
    lessonStatus: string;
}

interface ByTeacherViewProps {
    lessons: ByTeacherLesson[];
    expandedLesson: string | null;
    setExpandedLesson: (id: string | null) => void;
    teacherEntity: any;
    TeacherIcon: any;
    showEarnings?: boolean;
}

export function ByTeacherView({ lessons, expandedLesson, setExpandedLesson, teacherEntity, TeacherIcon, showEarnings = true }: ByTeacherViewProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            {lessons.map((lesson) => (
                <div key={lesson.lessonId} className="rounded-xl border border-border overflow-hidden bg-card">
                    <button onClick={() => setExpandedLesson(expandedLesson === lesson.lessonId ? null : lesson.lessonId)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div style={{ color: teacherEntity.color }}>
                                <TeacherIcon className="w-5 h-5" />
                            </div>
                            <span className="font-semibold">{lesson.name}</span>
                            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${EVENT_STATUS_CONFIG[lesson.lessonStatus as keyof typeof EVENT_STATUS_CONFIG]?.color}20`, color: EVENT_STATUS_CONFIG[lesson.lessonStatus as keyof typeof EVENT_STATUS_CONFIG]?.color }}>
                                {lesson.lessonStatus}
                            </span>
                        </div>
                        {showEarnings && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-green-600 dark:text-green-400 font-semibold">{lesson.cph}</span>
                                <span className="text-muted-foreground">×</span>
                                <span className="text-primary font-semibold">{lesson.totalHours.toFixed(1)}h</span>
                                <span className="text-muted-foreground">=</span>
                                <span className="text-green-600 dark:text-green-400 font-bold">{(Math.round(lesson.totalEarning * 100) / 100).toString()}</span>
                            </div>
                        )}
                        <ChevronDown size={18} className={`text-muted-foreground transition-transform ${expandedLesson === lesson.lessonId ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                        {expandedLesson === lesson.lessonId && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                <div className="px-4 pb-3 space-y-2">
                                    {lesson.events.map((event) => (
                                        <div key={event.eventId} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-sm">
                                            <div className="flex items-center gap-3">
                                                <div style={{ color: EVENT_STATUS_CONFIG[event.eventStatus as keyof typeof EVENT_STATUS_CONFIG]?.color }}>
                                                    <FlagIcon size={14} />
                                                </div>
                                                {event.dateLabel && <span className="font-medium">{event.dateLabel}</span>}
                                                {event.time && <span className="font-mono text-muted-foreground">{event.time}</span>}
                                                <span className="text-muted-foreground">{event.durationLabel}</span>
                                                <span className="text-muted-foreground">{event.location}</span>
                                                <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${EVENT_STATUS_CONFIG[event.eventStatus as keyof typeof EVENT_STATUS_CONFIG]?.color}20`, color: EVENT_STATUS_CONFIG[event.eventStatus as keyof typeof EVENT_STATUS_CONFIG]?.color }}>
                                                    {event.eventStatus}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </motion.div>
    );
}
