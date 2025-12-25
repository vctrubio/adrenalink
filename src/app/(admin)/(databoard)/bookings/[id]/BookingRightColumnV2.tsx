"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BookingModel } from "@/backend/models";
import { ENTITY_DATA } from "@/config/entities";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { getHMDuration, getPrettyDuration } from "@/getters/duration-getter";
import { calculateLessonRevenue, calculateCommission } from "@/getters/commission-calculator";
import { formatBookingReceiptText, formatBookingDate } from "@/getters/bookings-receipt-getter";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { DateSinceBadge } from "@/src/components/ui/badge/datesince";
import { TeacherUsernameCommissionBadge } from "@/src/components/ui/badge/teacher-username-commission";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { Share2, Copy, Check, MapPin, TrendingUp } from "lucide-react";

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

// Sub-component: Receipt View
function ReceiptView({ booking, eventRows, totals, schoolPackage, formatCurrency, currency }: { booking: BookingModel; eventRows: EventRow[]; totals: Totals; schoolPackage: any; formatCurrency: (num: number) => string; currency: string }) {
    const [copied, setCopied] = useState(false);

    const packageDescription = schoolPackage?.description || "No Package";
    const packageHours = schoolPackage ? Math.round(schoolPackage.durationMinutes / 60) : 0;
    const packageCategory = schoolPackage?.categoryEquipment || "No Category";
    const equipmentCapacity = schoolPackage?.capacityEquipment || 0;
    const studentCapacity = schoolPackage?.capacityStudents || 0;
    const totalHours = totals.duration / 60;

    let packageTypeStr = packageCategory;
    if (equipmentCapacity > 1) {
        packageTypeStr += ` (x${equipmentCapacity})`;
    }

    const bookingStartDate = formatBookingDate(booking.schema.dateStart);
    const bookingEndDate = formatBookingDate(booking.schema.dateEnd);
    const pricePerStudent = studentCapacity > 1 ? totals.totalRevenue / studentCapacity : totals.totalRevenue;

    const students = (booking.relations?.bookingStudents || []).map((bs) => ({
        firstName: bs.student?.firstName || "Unknown",
        lastName: bs.student?.lastName || "",
        passport: bs.student?.passport || undefined,
    }));

    const receiptText = formatBookingReceiptText(bookingStartDate, bookingEndDate, students, packageDescription, packageHours, packageTypeStr, studentCapacity, totalHours, formatCurrency, totals.totalRevenue, pricePerStudent, eventRows);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(receiptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <Share2 size={20} className="text-primary" />
                    <span className="font-semibold">Receipt</span>
                </div>
                <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    <span className={copied ? "text-green-600" : ""}>{copied ? "Copied!" : "Copy to clipboard"}</span>
                </button>
            </div>
            <div className="p-5 bg-muted/20">
                <pre className="font-mono text-sm whitespace-pre-wrap text-foreground leading-relaxed">{receiptText}</pre>
            </div>
        </div>
    );
}

// Sub-component: Timeline Event Card
function TimelineEventCard({ event, teacherEntity, TeacherIcon, lessons, currency, formatCurrency }: { event: EventRow; teacherEntity: any; TeacherIcon: any; lessons: any[]; currency: string; formatCurrency: (num: number) => string }) {
    return (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative group">
            <div className="absolute -left-[31px] top-3 w-4 h-4 rounded-full border-2 border-background" style={{ backgroundColor: EVENT_STATUS_CONFIG[event.eventStatus as keyof typeof EVENT_STATUS_CONFIG]?.color }} />
            <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-lg font-mono font-bold">{event.time}</span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <DurationIcon size={14} />
                        <span className="font-mono font-medium">{event.durationLabel}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${EVENT_STATUS_CONFIG[event.eventStatus as keyof typeof EVENT_STATUS_CONFIG]?.color}20`, color: EVENT_STATUS_CONFIG[event.eventStatus as keyof typeof EVENT_STATUS_CONFIG]?.color }}>
                        {event.eventStatus}
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-sm mb-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                    </div>
                    <HoverToEntity entity={teacherEntity} id={event.teacherUsername}>
                        <TeacherUsernameCommissionBadge teacherIcon={TeacherIcon} teacherUsername={event.teacherUsername} teacherColor={teacherEntity.color} commissionValue={lessons.find((l) => l.teacher?.username === event.teacherUsername)?.commission?.cph || "0"} commissionType={(lessons.find((l) => l.teacher?.username === event.teacherUsername)?.commission?.commissionType as "fixed" | "percentage") || "fixed"} currency={currency} />
                    </HoverToEntity>
                </div>
                <div className="space-y-2 pt-3 border-t border-border/50 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Teacher Commission</span>
                        <span className="font-mono font-semibold text-green-600 dark:text-green-400">{formatCurrency(Math.round(event.teacherEarning * 100) / 100)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Students Paid</span>
                        <span className="font-mono font-semibold">{formatCurrency(Math.round(event.totalRevenue * 100) / 100)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(Math.round(event.schoolRevenue * 100) / 100)}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Sub-component: Timeline View
function TimelineView({ sortedDates, eventRows, lessons, teacherEntity, TeacherIcon, currency, formatCurrency }: { sortedDates: Array<{ date: Date; dateLabel: string; dayOfWeek: string; events: EventRow[] }>; eventRows: EventRow[]; lessons: any[]; teacherEntity: any; TeacherIcon: any; currency: string; formatCurrency: (num: number) => string }) {
    return (
        <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {sortedDates.map(({ date, dayOfWeek, events }) => (
                <div key={date.toISOString()} className="relative">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-muted/50 border border-border/50">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide leading-none">{dayOfWeek}</span>
                            <span className="text-xl font-black leading-none text-foreground mt-0.5">{date.getDate()}</span>
                        </div>
                        <div className="flex-1 h-px bg-border" />
                        <DateSinceBadge date={date} />
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <FlagIcon size={14} />
                            <span>{events.length}</span>
                            <DurationIcon size={14} />
                            <span>{getHMDuration(events.reduce((sum, e) => sum + e.duration, 0))}</span>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                                <TrendingUp size={14} />
                                <span>{(Math.round(events.reduce((sum, e) => sum + e.schoolRevenue, 0) * 100) / 100).toString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="ml-7 border-l-2 border-border pl-6 space-y-3">
                        {events.map((event, idx) => (
                            <TimelineEventCard key={event.eventId} event={event} teacherEntity={teacherEntity} TeacherIcon={TeacherIcon} lessons={lessons} currency={currency} formatCurrency={formatCurrency} />
                        ))}
                    </div>
                </div>
            ))}
        </motion.div>
    );
}

// Sub-component: By Teacher View
function ByTeacherView({ teacherStats, expandedTeacher, setExpandedTeacher, teacherEntity, TeacherIcon, EVENT_STATUS_CONFIG, FlagIcon }: { teacherStats: TeacherStat[]; expandedTeacher: string | null; setExpandedTeacher: (id: string | null) => void; teacherEntity: any; TeacherIcon: any; EVENT_STATUS_CONFIG: any; FlagIcon: any }) {
    return (
        <motion.div key="by-teacher" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            {teacherStats.map((teacher) => (
                <div key={teacher.lessonId} className="rounded-xl border border-border overflow-hidden bg-card">
                    <button onClick={() => setExpandedTeacher(expandedTeacher === teacher.lessonId ? null : teacher.lessonId)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div style={{ color: teacherEntity.color }}>
                                <TeacherIcon className="w-5 h-5" />
                            </div>
                            <span className="font-semibold">{teacher.name}</span>
                            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${EVENT_STATUS_CONFIG[teacher.lessonStatus as keyof typeof EVENT_STATUS_CONFIG]?.color}20`, color: EVENT_STATUS_CONFIG[teacher.lessonStatus as keyof typeof EVENT_STATUS_CONFIG]?.color }}>
                                {teacher.lessonStatus}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-green-600 dark:text-green-400 font-semibold">{teacher.cph}</span>
                            <span className="text-muted-foreground">×</span>
                            <span className="text-primary font-semibold">{teacher.totalHours.toFixed(1)}h</span>
                            <span className="text-muted-foreground">=</span>
                            <span className="text-green-600 dark:text-green-400 font-bold">{(Math.round(teacher.totalEarning * 100) / 100).toString()}</span>
                        </div>
                    </button>
                    <AnimatePresence>
                        {expandedTeacher === teacher.lessonId && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                <div className="px-4 pb-3 space-y-2">
                                    {teacher.events.map((event) => (
                                        <div key={event.eventId} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-sm">
                                            <div className="flex items-center gap-3">
                                                <FlagIcon size={14} style={{ color: EVENT_STATUS_CONFIG[event.eventStatus as keyof typeof EVENT_STATUS_CONFIG]?.color }} />
                                                <span className="font-medium">{event.date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "2-digit" }).replace(",", "")}&apos;</span>
                                                <span className="font-mono text-muted-foreground">{event.durationLabel}</span>
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

// Sub-component: Table View
function TableView({ eventRows, teacherEntity, TeacherIcon, totals }: { eventRows: EventRow[]; teacherEntity: any; TeacherIcon: any; totals: Totals }) {
    return (
        <motion.div key="table" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="rounded-xl border border-border overflow-hidden">
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
                                        <HoverToEntity entity={teacherEntity} id={event.teacherUsername}>
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

// Sub-component: View Toggle
function ViewToggle({ viewMode, setViewMode }: { viewMode: ViewMode; setViewMode: (mode: ViewMode) => void }) {
    const modes: Array<{ id: ViewMode; label: string }> = [
        { id: "timeline", label: "Timeline" },
        { id: "by-teacher", label: "By Teacher" },
        { id: "table", label: "Table" },
        { id: "receipt", label: "Receipt" },
    ];

    return (
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl w-fit">
            {modes.map((mode) => (
                <button key={mode.id} onClick={() => setViewMode(mode.id)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === mode.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    {mode.label}
                </button>
            ))}
        </div>
    );
}

// Main component
interface BookingRightColumnV2Props {
    booking: BookingModel;
    stats: { label: string; value: string | number; icon?: React.ReactNode }[];
}

export function BookingRightColumnV2({ booking, stats }: BookingRightColumnV2Props) {
    const [viewMode, setViewMode] = useState<ViewMode>("timeline");
    const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const TeacherIcon = teacherEntity.icon;

    const lessons = booking.relations?.lessons || [];
    const schoolPackage = booking.relations?.studentPackage?.schoolPackage;
    const studentCount = booking.relations?.bookingStudents?.length || 1;

    const formatCurrency = (num: number): string => {
        const rounded = Math.round(num * 100) / 100;
        return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
    };

    const eventRows: EventRow[] = lessons
        .flatMap((lesson: any) => {
            const events = lesson.events || [];
            const lessonDurationMinutes = events.reduce((sum: number, event: any) => sum + (event.duration || 0), 0);

            const lessonRevenue = schoolPackage ? calculateLessonRevenue(schoolPackage.pricePerStudent, studentCount, lessonDurationMinutes, schoolPackage.durationMinutes) : 0;

            const commissionInfo = {
                type: (lesson.commission?.commissionType as "fixed" | "percentage") || "fixed",
                cph: parseFloat(lesson.commission?.cph || "0"),
            };

            return events.map((event: any) => {
                const eventDate = new Date(event.date);
                const eventDurationMinutes = event.duration || 0;
                const eventProportion = lessonDurationMinutes > 0 ? eventDurationMinutes / lessonDurationMinutes : 0;
                const eventRevenue = lessonRevenue * eventProportion;

                const eventCommission = calculateCommission(eventDurationMinutes, commissionInfo, eventRevenue, schoolPackage?.durationMinutes || 60);

                return {
                    eventId: event.id,
                    lessonId: lesson.id,
                    date: eventDate,
                    time: eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
                    dateLabel: eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    dayOfWeek: eventDate.toLocaleDateString("en-US", { weekday: "short" }),
                    duration: eventDurationMinutes,
                    durationLabel: getPrettyDuration(eventDurationMinutes),
                    location: event.location || "-",
                    teacherId: lesson.teacher?.id || "",
                    teacherName: lesson.teacher?.firstName || "Unknown",
                    teacherUsername: lesson.teacher?.username || "unknown",
                    eventStatus: event.status,
                    lessonStatus: lesson.status,
                    teacherEarning: eventCommission.earned,
                    schoolRevenue: eventRevenue - eventCommission.earned,
                    totalRevenue: eventRevenue,
                };
            });
        })
        .sort((a: EventRow, b: EventRow) => a.date.getTime() - b.date.getTime());

    const teacherStats: TeacherStat[] = lessons.map((lesson: any) => {
        const teacherEvents = eventRows.filter((e) => e.lessonId === lesson.id);
        const commissionType = lesson.commission?.commissionType || "fixed";
        const cph = parseFloat(lesson.commission?.cph || "0");
        const totalDuration = teacherEvents.reduce((sum, e) => sum + e.duration, 0);
        const totalHours = totalDuration / 60;
        const totalEarning = teacherEvents.reduce((sum, e) => sum + e.teacherEarning, 0);

        return {
            lessonId: lesson.id,
            id: lesson.teacher?.id || "",
            name: lesson.teacher?.firstName || lesson.teacher?.username || "No Name",
            username: lesson.teacher?.username || "unknown",
            events: teacherEvents,
            totalDuration,
            totalHours,
            totalEarning,
            eventCount: teacherEvents.length,
            commissionType,
            cph,
            lessonStatus: lesson.status,
        };
    });

    const totals: Totals = eventRows.reduce(
        (acc, event) => ({
            duration: acc.duration + event.duration,
            teacherEarnings: acc.teacherEarnings + event.teacherEarning,
            schoolRevenue: acc.schoolRevenue + event.schoolRevenue,
            totalRevenue: acc.totalRevenue + event.totalRevenue,
        }),
        { duration: 0, teacherEarnings: 0, schoolRevenue: 0, totalRevenue: 0 },
    );

    const eventsByDate = eventRows.reduce(
        (acc, event) => {
            const dateKey = event.date.toDateString();
            if (!acc[dateKey]) {
                acc[dateKey] = { date: event.date, dateLabel: event.dateLabel, dayOfWeek: event.dayOfWeek, events: [] };
            }
            acc[dateKey].events.push(event);
            return acc;
        },
        {} as Record<string, { date: Date; dateLabel: string; dayOfWeek: string; events: EventRow[] }>,
    );

    const sortedDates = Object.values(eventsByDate).sort((a, b) => a.date.getTime() - b.date.getTime());

    return (
        <div className="space-y-6">
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

            <AnimatePresence mode="wait">
                {viewMode === "timeline" && <TimelineView sortedDates={sortedDates} eventRows={eventRows} lessons={lessons} teacherEntity={teacherEntity} TeacherIcon={TeacherIcon} currency={currency} formatCurrency={formatCurrency} />}
                {viewMode === "by-teacher" && <ByTeacherView teacherStats={teacherStats} expandedTeacher={expandedTeacher} setExpandedTeacher={setExpandedTeacher} teacherEntity={teacherEntity} TeacherIcon={TeacherIcon} EVENT_STATUS_CONFIG={EVENT_STATUS_CONFIG} FlagIcon={FlagIcon} />}
                {viewMode === "table" && <TableView eventRows={eventRows} teacherEntity={teacherEntity} TeacherIcon={TeacherIcon} totals={totals} />}
                {viewMode === "receipt" && <ReceiptView booking={booking} eventRows={eventRows} totals={totals} schoolPackage={schoolPackage} formatCurrency={formatCurrency} currency={currency} />}
            </AnimatePresence>
        </div>
    );
}
