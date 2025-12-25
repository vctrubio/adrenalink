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
import { Timeline, type TimelineEvent } from "@/src/components/timeline";
import { ByTeacherView, type ByTeacherLesson, type ByTeacherEvent } from "@/src/components/ui/ByTeacherView";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { Share2, Copy, Check } from "lucide-react";

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

interface TeacherStat extends ByTeacherLesson {
    events: EventRow[];
}

interface Totals {
    duration: number;
    teacherEarnings: number;
    schoolRevenue: number;
    totalRevenue: number;
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

// Sub-component: Receipt View
function ReceiptView({ booking, eventRows, totals, schoolPackage, formatCurrency, currency }: { booking: BookingModel; eventRows: EventRow[]; totals: Totals; schoolPackage: any; formatCurrency: (num: number) => string; currency: string }) {
    const [copied, setCopied] = useState(false);
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;

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

    const bookingStudents = booking.relations?.bookingStudents || [];
    const students = bookingStudents.map((bs) => ({
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
        <motion.div key="receipt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="rounded-xl border border-border overflow-hidden bg-card">
                {/* Booking Details Header */}
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3 mb-3">
                        <div style={{ color: studentEntity.color }}>
                            <HelmetIcon size={20} />
                        </div>
                        <span className="font-semibold">{booking.schema.leaderStudentName}</span>
                        {bookingStudents.length > 1 && (
                            <span className="text-xs text-muted-foreground">+{bookingStudents.length - 1} students</span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{packageDescription}</span>
                        <span>|</span>
                        <span>{packageHours}h package</span>
                        <span>|</span>
                        <span>{packageTypeStr}</span>
                        {studentCapacity > 1 && (
                            <>
                                <span>|</span>
                                <span>x{studentCapacity} students</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Receipt Header */}
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

    // Build event rows with all financial data
    const eventRows: EventRow[] = lessons
        .flatMap((lesson: any) => {
            const events = lesson.events || [];
            const lessonDurationMinutes = events.reduce((sum: number, event: any) => sum + (event.duration || 0), 0);
            const lessonRevenue = schoolPackage ? calculateLessonRevenue(schoolPackage.pricePerStudent, studentCount, lessonDurationMinutes, schoolPackage.durationMinutes) : 0;
            const commissionType = (lesson.commission?.commissionType as "fixed" | "percentage") || "fixed";
            const cph = parseFloat(lesson.commission?.cph || "0");

            return events.map((event: any) => {
                const eventDate = new Date(event.date);
                const eventDurationMinutes = event.duration || 0;
                const eventProportion = lessonDurationMinutes > 0 ? eventDurationMinutes / lessonDurationMinutes : 0;
                const eventRevenue = lessonRevenue * eventProportion;
                const eventCommission = calculateCommission(eventDurationMinutes, { type: commissionType, cph }, eventRevenue, schoolPackage?.durationMinutes || 60);

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
                    commissionType,
                    commissionCph: cph,
                };
            });
        })
        .sort((a: EventRow, b: EventRow) => a.date.getTime() - b.date.getTime());

    // Convert to TimelineEvent for shared component
    const timelineEvents: TimelineEvent[] = eventRows.map((e) => ({
        ...e,
        commissionType: e.commissionType,
        commissionCph: e.commissionCph,
    }));

    // Build teacher stats for By Teacher view
    const teacherStats: TeacherStat[] = lessons.map((lesson: any) => {
        const teacherEvents = eventRows.filter((e) => e.lessonId === lesson.id);
        const commissionType = lesson.commission?.commissionType || "fixed";
        const cph = parseFloat(lesson.commission?.cph || "0");
        const totalDuration = teacherEvents.reduce((sum, e) => sum + e.duration, 0);

        return {
            lessonId: lesson.id,
            id: lesson.teacher?.id || "",
            name: lesson.teacher?.firstName || lesson.teacher?.username || "No Name",
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
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

            <AnimatePresence mode="wait">
                {viewMode === "timeline" && (
                    <Timeline events={timelineEvents} currency={currency} formatCurrency={formatCurrency} showTeacher={true} showFinancials={true} />
                )}
                {viewMode === "by-teacher" && (
                    <motion.div key="by-teacher" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <ByTeacherView lessons={teacherStats} expandedLesson={expandedTeacher} setExpandedLesson={setExpandedTeacher} teacherEntity={teacherEntity} TeacherIcon={TeacherIcon} showEarnings={true} />
                    </motion.div>
                )}
                {viewMode === "table" && (
                    <TableView eventRows={eventRows} teacherEntity={teacherEntity} TeacherIcon={TeacherIcon} totals={totals} />
                )}
                {viewMode === "receipt" && (
                    <ReceiptView booking={booking} eventRows={eventRows} totals={totals} schoolPackage={schoolPackage} formatCurrency={formatCurrency} currency={currency} />
                )}
            </AnimatePresence>
        </div>
    );
}
