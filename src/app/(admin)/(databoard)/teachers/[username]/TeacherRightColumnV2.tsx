"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TeacherModel } from "@/backend/models";
import { ENTITY_DATA } from "@/config/entities";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { getPrettyDuration } from "@/getters/duration-getter";
import { EVENT_STATUS_CONFIG, LESSON_STATUS_CONFIG } from "@/types/status";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { Timeline, type TimelineEvent } from "@/src/components/timeline";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { MapPin, Calendar, List } from "lucide-react";
import { TeacherLessonCard, type TeacherLessonCardData, type TeacherLessonCardEvent, type LessonEventRowData, TeacherBookingLessonTable, type TeacherBookingLessonTableData } from "@/src/components/ids";
import { getHMDuration } from "@/getters/duration-getter";

type ViewMode = "lessons" | "timeline" | "commissions";

interface LessonRow {
    lessonId: string;
    bookingId: string;
    leaderName: string;
    dateStart: string;
    dateEnd: string;
    lessonStatus: string;
    bookingStatus: string;
    commissionType: string;
    cph: number;
    totalDuration: number;
    totalHours: number;
    totalEarning: number;
    eventCount: number;
    events: EventRow[];
    equipmentCategory: string;
    studentCapacity: number;
}

interface EventRow {
    eventId: string;
    date: Date;
    time: string;
    dateLabel: string;
    dayOfWeek: string;
    duration: number;
    durationLabel: string;
    location: string;
    status: string;
}

interface Totals {
    duration: number;
    hours: number;
    earning: number;
    events: number;
}

// Sub-component: View Toggle
function ViewToggle({ viewMode, setViewMode }: { viewMode: ViewMode; setViewMode: (mode: ViewMode) => void }) {
    const views: { id: ViewMode; label: string; icon: any }[] = [
        { id: "lessons", label: "By Lesson", icon: List },
        { id: "commissions", label: "By Commission", icon: HandshakeIcon },
        { id: "timeline", label: "Timeline", icon: Calendar },
    ];

    return (
        <div className="flex gap-2">
            {views.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => setViewMode(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                >
                    <Icon size={16} />
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
}

// Sub-component: Summary Header
function SummaryHeader({ totals, formatCurrency }: { totals: Totals; formatCurrency: (num: number) => string }) {
    return (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                    <FlagIcon size={16} className="text-muted-foreground" />
                    <span className="font-semibold">{totals.events} events</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <DurationIcon size={16} className="text-muted-foreground" />
                    <span className="font-semibold">{totals.hours.toFixed(1)}h</span>
                </div>
            </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(Math.round(totals.earning * 100) / 100)}</div>
        </div>
    );
}


// Sub-component: Commission Header
interface CommissionStats {
    type: string;
    hours: number;
    earning: number;
    lessonCount: number;
    cph: number;
}

function CommissionHeader({ commission, formatCurrency }: { commission: CommissionStats; formatCurrency: (num: number) => string }) {
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    return (
        <div className="rounded-lg bg-muted/30 border border-border p-4 space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div style={{ color: "#22c55e" }}>
                        <HandshakeIcon size={16} />
                    </div>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">{commission.type === "percentage" ? `${commission.cph}%` : `${commission.cph} ${currency}`}</span>
                    <span className="text-sm font-semibold text-muted-foreground capitalize">{commission.type === "fixed" ? "Fixed" : "Percentage"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FlagIcon size={14} />
                    <span>{commission.lessonCount} lessons</span>
                </div>
            </div>
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <DurationIcon size={14} />
                    <span className="font-medium">{getHMDuration(commission.hours * 60)}</span>
                </div>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(Math.round(commission.earning * 100) / 100)}</span>
            </div>
        </div>
    );
}

// Sub-component: Commissions View
function CommissionsView({
    lessonRows,
    expandedLesson,
    setExpandedLesson,
    bookingEntity,
    studentEntity,
    formatCurrency,
}: {
    lessonRows: LessonRow[];
    expandedLesson: string | null;
    setExpandedLesson: (id: string | null) => void;
    bookingEntity: any;
    studentEntity: any;
    formatCurrency: (num: number) => string;
}) {
    // Group lessons by commission type
    const commissionGroups = lessonRows.reduce(
        (acc, lesson) => {
            const key = lesson.commissionType;
            if (!acc[key]) {
                acc[key] = { type: key, hours: 0, earning: 0, cph: lesson.cph, lessons: [] as LessonRow[], lessonCount: 0 };
            }
            acc[key].hours += lesson.totalHours;
            acc[key].earning += lesson.totalEarning;
            acc[key].lessons.push(lesson);
            acc[key].lessonCount += 1;
            return acc;
        },
        {} as Record<string, CommissionStats & { lessons: LessonRow[] }>,
    );

    const commissionArray = Object.values(commissionGroups).sort((a, b) => b.earning - a.earning);

    return (
        <motion.div key="commissions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {commissionArray.map((commission) => (
                <div key={commission.type} className="space-y-2">
                    <CommissionHeader commission={commission} formatCurrency={formatCurrency} />
                    <div className="space-y-2">
                        {commission.lessons.map((lesson) => {
                            const lessonData: TeacherLessonCardData = {
                                lessonId: lesson.lessonId,
                                bookingId: lesson.bookingId,
                                leaderName: lesson.leaderName,
                                dateStart: lesson.dateStart,
                                dateEnd: lesson.dateEnd,
                                lessonStatus: lesson.lessonStatus,
                                bookingStatus: lesson.bookingStatus,
                                commissionType: lesson.commissionType,
                                cph: lesson.cph,
                                totalDuration: lesson.totalDuration,
                                totalHours: lesson.totalHours,
                                totalEarning: lesson.totalEarning,
                                eventCount: lesson.eventCount,
                                events: lesson.events as TeacherLessonCardEvent[],
                                equipmentCategory: lesson.equipmentCategory,
                                studentCapacity: lesson.studentCapacity,
                            };

                            return <TeacherLessonCard key={lesson.lessonId} lesson={lessonData} isExpanded={expandedLesson === lesson.lessonId} onToggle={() => setExpandedLesson(expandedLesson === lesson.lessonId ? null : lesson.lessonId)} />;
                        })}
                    </div>
                </div>
            ))}
        </motion.div>
    );
}

// Sub-component: Lessons View
function LessonsView({ lessonRows, expandedLesson, setExpandedLesson, bookingEntity, studentEntity }: { lessonRows: LessonRow[]; expandedLesson: string | null; setExpandedLesson: (id: string | null) => void; bookingEntity: any; studentEntity: any }) {
    return (
        <motion.div key="lessons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            {lessonRows.map((lesson) => {
                const lessonData: TeacherBookingLessonTableData = {
                    lessonId: lesson.lessonId,
                    bookingId: lesson.bookingId,
                    leaderName: lesson.leaderName,
                    dateStart: lesson.dateStart,
                    dateEnd: lesson.dateEnd,
                    lessonStatus: lesson.lessonStatus,
                    bookingStatus: lesson.bookingStatus,
                    commissionType: lesson.commissionType,
                    cph: lesson.cph,
                    totalDuration: lesson.totalDuration,
                    totalHours: lesson.totalHours,
                    totalEarning: lesson.totalEarning,
                    eventCount: lesson.eventCount,
                    events: lesson.events as LessonEventRowData[],
                    equipmentCategory: lesson.equipmentCategory,
                    studentCapacity: lesson.studentCapacity,
                };

                return (
                    <TeacherBookingLessonTable
                        key={lesson.lessonId}
                        lesson={lessonData}
                        isExpanded={expandedLesson === lesson.lessonId}
                        onToggle={() => setExpandedLesson(expandedLesson === lesson.lessonId ? null : lesson.lessonId)}
                        bookingEntity={bookingEntity}
                        studentEntity={studentEntity}
                    />
                );
            })}
        </motion.div>
    );
}

// Main Component
interface TeacherRightColumnV2Props {
    teacher: TeacherModel;
}

export function TeacherRightColumnV2({ teacher }: TeacherRightColumnV2Props) {
    const [viewMode, setViewMode] = useState<ViewMode>("lessons");
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    const formatCurrency = (num: number) => `${num.toFixed(2)} ${currency}`;

    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;

    const lessons = teacher.relations?.lessons || [];

    // Build lesson rows and timeline events from lessons data
    const lessonRows: LessonRow[] = [];
    const timelineEvents: TimelineEvent[] = [];

    for (const lesson of lessons) {
        const events = lesson.events || [];
        const booking = lesson.booking;
        const commission = lesson.commission;
        const schoolPackage = booking?.studentPackage?.schoolPackage;

        const totalDuration = events.reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
        const totalHours = totalDuration / 60;
        const cph = parseFloat(commission?.cph || "0");
        const commissionType = commission?.commissionType || "fixed";
        const totalEarning = commissionType === "fixed" ? cph * totalHours : cph * totalHours;

        const eventRows: EventRow[] = [];

        for (const event of events) {
            const eventDate = new Date(event.date);
            const eventDuration = event.duration || 0;
            const eventHours = eventDuration / 60;
            const eventEarning = commissionType === "fixed" ? cph * eventHours : cph * eventHours;

            const eventRow: EventRow = {
                eventId: event.id,
                date: eventDate,
                time: eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
                dateLabel: eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                dayOfWeek: eventDate.toLocaleDateString("en-US", { weekday: "short" }),
                duration: eventDuration,
                durationLabel: getPrettyDuration(eventDuration),
                location: event.location || "-",
                status: event.status,
            };
            eventRows.push(eventRow);

            // Build timeline event
            timelineEvents.push({
                eventId: event.id,
                lessonId: lesson.id,
                date: eventDate,
                time: eventRow.time,
                dateLabel: eventRow.dateLabel,
                dayOfWeek: eventRow.dayOfWeek,
                duration: eventDuration,
                durationLabel: eventRow.durationLabel,
                location: eventRow.location,
                teacherId: teacher.schema.id,
                teacherName: teacher.schema.firstName || "Unknown",
                teacherUsername: teacher.schema.username,
                eventStatus: event.status,
                lessonStatus: lesson.status,
                teacherEarning: eventEarning,
                schoolRevenue: 0, // Not calculated for teacher view
                totalRevenue: 0, // Not calculated for teacher view
                commissionType,
                commissionCph: cph,
                bookingStudents: booking?.bookingStudents,
                equipmentCategory: schoolPackage?.categoryEquipment,
                capacityEquipment: schoolPackage?.capacityEquipment,
                capacityStudents: schoolPackage?.capacityStudents,
            });
        }

        eventRows.sort((a, b) => a.date.getTime() - b.date.getTime());

        lessonRows.push({
            lessonId: lesson.id,
            bookingId: booking?.id || "",
            leaderName: booking?.leaderStudentName || "Unknown",
            dateStart: booking?.dateStart || "",
            dateEnd: booking?.dateEnd || "",
            lessonStatus: lesson.status,
            bookingStatus: booking!.status,
            commissionType,
            cph,
            totalDuration,
            totalHours,
            totalEarning,
            eventCount: events.length,
            events: eventRows,
            equipmentCategory: schoolPackage?.categoryEquipment!,
            studentCapacity: schoolPackage?.capacityStudents!,
        });
    }

    timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate totals
    const totals: Totals = lessonRows.reduce(
        (acc, lesson) => ({
            duration: acc.duration + lesson.totalDuration,
            hours: acc.hours + lesson.totalHours,
            earning: acc.earning + lesson.totalEarning,
            events: acc.events + lesson.eventCount,
        }),
        { duration: 0, hours: 0, earning: 0, events: 0 },
    );

    if (lessonRows.length === 0) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">No lessons found for this teacher</div>;
    }

    return (
        <div className="space-y-4">
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            <SummaryHeader totals={totals} formatCurrency={formatCurrency} />

            <AnimatePresence mode="wait">
                {viewMode === "lessons" && <LessonsView lessonRows={lessonRows} expandedLesson={expandedLesson} setExpandedLesson={setExpandedLesson} bookingEntity={bookingEntity} studentEntity={studentEntity} />}
                {viewMode === "commissions" && <CommissionsView lessonRows={lessonRows} expandedLesson={expandedLesson} setExpandedLesson={setExpandedLesson} bookingEntity={bookingEntity} studentEntity={studentEntity} formatCurrency={formatCurrency} />}
                {viewMode === "timeline" && <Timeline events={timelineEvents} currency={currency} formatCurrency={formatCurrency} showTeacher={false} showFinancials={true} />}
            </AnimatePresence>
        </div>
    );
}
