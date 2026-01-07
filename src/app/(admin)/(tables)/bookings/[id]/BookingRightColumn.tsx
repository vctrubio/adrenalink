"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ENTITY_DATA } from "@/config/entities";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { getHMDuration } from "@/getters/duration-getter";
import { calculateLessonRevenue, calculateCommission } from "@/getters/commission-calculator";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { Timeline, type TimelineEvent } from "@/src/components/timeline";
import { TeacherComissionLessonTable, type TeacherComissionLessonData } from "@/src/components/ids/TeacherComissionLessonTable";
import { BookingReceipt, type BookingReceiptEventRow } from "@/src/components/ids/BookingReceipt";
import { ToggleBar } from "@/src/components/ui/ToggleBar";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { Calendar, List, Table } from "lucide-react";
import { transformEventsToRows } from "@/getters/event-getter";
import type { BookingData } from "@/backend/data/BookingData";
import type { EventData } from "@/types/booking-lesson-event";

type ViewMode = "timeline" | "by-teacher" | "table" | "receipt";

interface EventRow {
    eventId: string;
    lessonId: string;
    date: Date;
    time: string;
    dateLabel: string;
    dayOfWeek: string;
    duration: number;
    durationLabel: string;
    location: string;
    teacherId: string;
    teacherName: string;
    teacherUsername: string;
    eventStatus: string;
    lessonStatus: string;
    teacherEarning: number;
    schoolRevenue: number;
    totalRevenue: number;
    commissionType: string;
    commissionCph: number;
}

interface TeacherStat {
    lessonId: string;
    id: string;
    name: string;
    username: string;
    events: EventRow[];
    totalDuration: number;
    totalHours: number;
    totalEarning: number;
    eventCount: number;
    commissionType: string;
    cph: number;
    lessonStatus: string;
}

interface Totals {
    duration: number;
    teacherEarnings: number;
    schoolRevenue: number;
    totalRevenue: number;
}

// Sub-component: Table View
function TableView({ eventRows, teacherEntity, TeacherIcon, totals }: { eventRows: EventRow[]; teacherEntity: any; TeacherIcon: any; totals: Totals }) {
    return (
        <motion.div key="table" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-muted/50">
                                <th className="p-4 text-left font-semibold">Date</th>
                                <th className="p-4 text-left font-semibold">Time</th>
                                <th className="p-4 text-left font-semibold">Teacher</th>
                                <th className="p-4 text-left font-semibold">Duration</th>
                                <th className="p-4 text-right font-semibold text-green-600 dark:text-green-400">Commission</th>
                                <th className="p-4 text-right font-semibold text-orange-600 dark:text-orange-400">School</th>
                                <th className="p-4 text-right font-semibold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventRows.map((event, idx) => (
                                <tr key={event.eventId} className={`border-t border-border hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? "bg-background" : "bg-muted/10"}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: EVENT_STATUS_CONFIG[event.eventStatus as keyof typeof EVENT_STATUS_CONFIG]?.color }} />
                                            <span className="font-medium">{event.dateLabel}</span>
                                            <span className="text-xs text-muted-foreground">{event.dayOfWeek}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono">{event.time}</td>
                                    <td className="p-4">
                                        <HoverToEntity entity={teacherEntity} id={event.teacherId}>
                                            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                                                <div style={{ color: teacherEntity.color }}>
                                                    <TeacherIcon className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium">{event.teacherUsername}</span>
                                            </div>
                                        </HoverToEntity>
                                    </td>
                                    <td className="p-4 font-mono font-medium">{event.durationLabel}</td>
                                    <td className="p-4 text-right font-mono text-green-600 dark:text-green-400">{(Math.round(event.teacherEarning * 100) / 100).toString()}</td>
                                    <td className="p-4 text-right font-mono text-orange-600 dark:text-orange-400">{(Math.round(event.schoolRevenue * 100) / 100).toString()}</td>
                                    <td className="p-4 text-right font-mono font-bold">{(Math.round(event.totalRevenue * 100) / 100).toString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-muted/70 border-t-2 border-border font-bold">
                                <td className="p-4" colSpan={3}>
                                    <span className="text-muted-foreground">{eventRows.length} events</span>
                                </td>
                                <td className="p-4 font-mono">{getHMDuration(totals.duration)}</td>
                                <td className="p-4 text-right font-mono text-green-600 dark:text-green-400">{(Math.round(totals.teacherEarnings * 100) / 100).toString()}</td>
                                <td className="p-4 text-right font-mono text-orange-600 dark:text-orange-400">{(Math.round(totals.schoolRevenue * 100) / 100).toString()}</td>
                                <td className="p-4 text-right font-mono text-lg">{(Math.round(totals.totalRevenue * 100) / 100).toString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}

interface BookingRightColumnProps {
    booking: BookingData;
}

export function BookingRightColumn({ booking }: BookingRightColumnProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("timeline");
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const TeacherIcon = teacherEntity.icon;

    const lessons = booking.relations?.lessons || [];
    const schoolPackage = booking.relations?.schoolPackage;
    const studentCount = booking.relations?.students?.length || 1;

    const formatCurrency = (num: number): string => {
        const rounded = Math.round(num * 100) / 100;
        return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
    };

    // Build event rows with financial data
    const eventRows: EventRow[] = lessons
        .flatMap((lesson: any) => {
            const events = (lesson.events || []) as EventData[];
            const lessonDurationMinutes = events.reduce((sum: number, event: any) => sum + (event.duration || 0), 0);
            const lessonRevenue = schoolPackage ? calculateLessonRevenue(schoolPackage.price_per_student, studentCount, lessonDurationMinutes, schoolPackage.duration_minutes) : 0;
            const commissionType = (lesson.commission_type as "fixed" | "percentage") || "fixed";
            const cph = parseFloat(lesson.commission?.cph || "0");

            const basicRows = transformEventsToRows(events as any);

            return basicRows.map((row) => {
                const eventProportion = lessonDurationMinutes > 0 ? row.duration / lessonDurationMinutes : 0;
                const eventRevenue = lessonRevenue * eventProportion;
                const eventCommission = calculateCommission(row.duration, { type: commissionType, cph }, eventRevenue, schoolPackage?.duration_minutes || 60);

                return {
                    eventId: row.eventId,
                    lessonId: lesson.id,
                    date: row.date,
                    time: row.time,
                    dateLabel: row.dateLabel,
                    dayOfWeek: row.dayOfWeek || "",
                    duration: row.duration,
                    durationLabel: getHMDuration(row.duration),
                    location: row.location,
                    teacherId: lesson.teacher?.id || "",
                    teacherName: lesson.teacher?.first_name || "Unknown",
                    teacherUsername: lesson.teacher?.username || "unknown",
                    eventStatus: row.status,
                    lessonStatus: lesson.status,
                    teacherEarning: eventCommission.earned,
                    schoolRevenue: eventRevenue - eventCommission.earned,
                    totalRevenue: eventRevenue,
                    commissionType,
                    commissionCph: cph,
                };
            });
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Convert to TimelineEvent
    const timelineEvents: TimelineEvent[] = eventRows.map((e) => ({
        ...e,
        commissionType: e.commissionType,
        commissionCph: e.commissionCph,
    }));

    // Build teacher stats
    const teacherStats: TeacherStat[] = lessons.map((lesson: any) => {
        const teacherEvents = eventRows.filter((e) => e.lessonId === lesson.id);
        const commissionType = lesson.commission_type || "fixed";
        const cph = parseFloat(lesson.commission?.cph || "0");
        const totalDuration = teacherEvents.reduce((sum, e) => sum + e.duration, 0);

        return {
            lessonId: lesson.id,
            id: lesson.teacher?.id || "",
            name: lesson.teacher?.first_name || lesson.teacher?.username || "No Name",
            username: lesson.teacher?.username || "unknown",
            events: teacherEvents,
            totalDuration,
            totalHours: totalDuration / 60,
            totalEarning: teacherEvents.reduce((sum, e) => sum + e.teacherEarning, 0),
            eventCount: teacherEvents.length,
            commissionType,
            cph,
            lessonStatus: lesson.status,
        };
    });

    // Calculate totals
    const totals: Totals = eventRows.reduce(
        (acc, event) => ({
            duration: acc.duration + event.duration,
            teacherEarnings: acc.teacherEarnings + event.teacherEarning,
            schoolRevenue: acc.schoolRevenue + event.schoolRevenue,
            totalRevenue: acc.totalRevenue + event.totalRevenue,
        }),
        { duration: 0, teacherEarnings: 0, schoolRevenue: 0, totalRevenue: 0 },
    );

    return (
        <div className="space-y-6">
            <ToggleBar
                value={viewMode}
                onChange={(v) => setViewMode(v as ViewMode)}
                options={[
                    { id: "timeline", label: "Timeline", icon: Calendar },
                    { id: "by-teacher", label: "By Teacher", icon: HandshakeIcon },
                    { id: "table", label: "Table", icon: Table },
                    { id: "receipt", label: "Receipt", icon: List },
                ]}
            />

            <AnimatePresence mode="wait">
                {viewMode === "timeline" && <Timeline events={timelineEvents} currency={currency} formatCurrency={formatCurrency} showTeacher={true} showFinancials={true} />}
                {viewMode === "by-teacher" && (
                    <motion.div key="by-teacher" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                        {teacherStats.map((teacher) => {
                            const lessonData: TeacherComissionLessonData = {
                                lessonId: teacher.lessonId,
                                teacherUsername: teacher.username,
                                status: teacher.lessonStatus,
                                commissionType: teacher.commissionType,
                                cph: teacher.cph,
                                eventCount: teacher.eventCount,
                                duration: teacher.totalDuration,
                                earned: teacher.totalEarning,
                                events: teacher.events.map((e) => ({
                                    eventId: e.eventId,
                                    date: e.date,
                                    time: e.time,
                                    dateLabel: e.dateLabel,
                                    dayOfWeek: e.dayOfWeek,
                                    duration: e.duration,
                                    durationLabel: e.durationLabel,
                                    location: e.location,
                                    status: e.eventStatus,
                                })),
                            };

                            return (
                                <div key={teacher.lessonId} className="rounded-xl border border-border overflow-hidden bg-card">
                                    <TeacherComissionLessonTable lesson={lessonData} formatCurrency={formatCurrency} currency={currency} teacherEntity={teacherEntity} />
                                </div>
                            );
                        })}
                    </motion.div>
                )}
                {viewMode === "table" && <TableView eventRows={eventRows} teacherEntity={teacherEntity} TeacherIcon={TeacherIcon} totals={totals} />}
                {viewMode === "receipt" && (
                    <BookingReceipt 
                        booking={booking as any} 
                        eventRows={eventRows as BookingReceiptEventRow[]} 
                        totals={totals} 
                        schoolPackage={schoolPackage as any} 
                        formatCurrency={formatCurrency} 
                        currency={currency} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
