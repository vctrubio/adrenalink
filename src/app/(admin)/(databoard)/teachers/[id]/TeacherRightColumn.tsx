"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TeacherModel } from "@/backend/models";
import { ENTITY_DATA } from "@/config/entities";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { Timeline, type TimelineEvent } from "@/src/components/timeline";
import { ToggleBar } from "@/src/components/ui/ToggleBar";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { MapPin, Calendar, List } from "lucide-react";
import { TeacherLessonCard, type TeacherLessonCardData, type TeacherLessonCardEvent, type LessonEventRowData, TeacherBookingLessonTable, type TeacherBookingLessonTableData } from "@/src/components/ids";
import { getHMDuration } from "@/getters/duration-getter";
import { transformEventsToRows } from "@/getters/event-getter";
import { TeacherLessonComissionValue } from "@/src/components/ui/TeacherLessonComissionValue";
import { SearchInput } from "@/src/components/SearchInput";
import { calculateLessonRevenue } from "@/getters/commission-calculator";
import type { EventData } from "@/types/booking-lesson-event";

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
    events: LessonEventRowData[];
    equipmentCategory: string;
    studentCapacity: number;
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
                    <TeacherLessonComissionValue commissionType={commission.type} cph={commission.cph} currency={currency} />
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
interface TeacherRightColumnProps {
    teacher: TeacherModel;
}

export function TeacherRightColumn({ teacher }: TeacherRightColumnProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("timeline");
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
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
        const events = (lesson.events || []) as EventData[];
        const booking = lesson.booking;
        const commission = lesson.commission;
        const schoolPackage = booking?.studentPackage?.schoolPackage;

        const totalDuration = events.reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
        const totalHours = totalDuration / 60;
        const cph = parseFloat(commission?.cph || "0");
        const commissionType = commission?.commissionType || "fixed";
        const totalEarning = commissionType === "fixed" ? cph * totalHours : cph * totalHours;

        const eventRows = transformEventsToRows(events);

        for (const eventRow of eventRows) {
            const eventEarning = commissionType === "fixed" ? cph * (eventRow.duration / 60) : cph * (eventRow.duration / 60);

            // Calculate revenues
            const studentCount = booking?.bookingStudents?.length || 1;
            const pricePerStudent = schoolPackage?.pricePerStudent || 0;
            const packageDurationMinutes = schoolPackage?.durationMinutes || 60;

            const eventRevenue = calculateLessonRevenue(pricePerStudent, studentCount, eventRow.duration, packageDurationMinutes);
            const schoolRevenue = eventRevenue - eventEarning;

            // Build timeline event
            timelineEvents.push({
                eventId: eventRow.eventId,
                lessonId: lesson.id,
                date: eventRow.date,
                time: eventRow.time,
                dateLabel: eventRow.dateLabel,
                dayOfWeek: eventRow.dayOfWeek || "",
                duration: eventRow.duration,
                durationLabel: eventRow.durationLabel,
                location: eventRow.location,
                teacherId: teacher.schema.id,
                teacherName: teacher.schema.firstName || "Unknown",
                teacherUsername: teacher.schema.username,
                eventStatus: eventRow.status,
                lessonStatus: lesson.status,
                teacherEarning: eventEarning,
                schoolRevenue,
                totalRevenue: eventRevenue,
                commissionType,
                commissionCph: cph,
                bookingStudents: booking?.bookingStudents?.map((bs: any) => bs.student) || [],
                equipmentCategory: schoolPackage?.categoryEquipment,
                capacityEquipment: schoolPackage?.capacityEquipment,
                capacityStudents: schoolPackage?.capacityStudents,
            });
        }

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
            totalHours: totalDuration / 60,
            totalEarning,
            eventCount: events.length,
            events: eventRows,
            equipmentCategory: schoolPackage?.categoryEquipment!,
            studentCapacity: schoolPackage?.capacityStudents!,
        });
    }

    timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Filter based on search query
    const filteredLessonRows = lessonRows.filter((row) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        // Check leader name
        if (row.leaderName.toLowerCase().includes(query)) return true;

        // Check student names (need to find original booking to get students, or use what we have)
        // Since we don't have full student list in LessonRow easily accessible beyond leader,
        // we might want to check the timeline events for this lesson or modify LessonRow to include student names string.
        // For now, let's filter by leader name which is the primary student.
        return false;
    });

    const filteredTimelineEvents = timelineEvents.filter((event) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        // Check booking students
        if (event.bookingStudents) {
            return event.bookingStudents.some((s) => s.firstName.toLowerCase().includes(query) || s.lastName.toLowerCase().includes(query));
        }
        return false;
    });

    if (lessonRows.length === 0) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">No lessons found for this teacher</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex ">
                <ToggleBar
                    value={viewMode}
                    onChange={(v) => setViewMode(v as ViewMode)}
                    options={[
                        { id: "lessons", label: "By Lesson", icon: List },
                        { id: "commissions", label: "By Commission", icon: HandshakeIcon },
                        { id: "timeline", label: "Timeline", icon: Calendar },
                    ]}
                />
            </div>

            <AnimatePresence mode="wait">
                {viewMode === "lessons" && <LessonsView lessonRows={filteredLessonRows} expandedLesson={expandedLesson} setExpandedLesson={setExpandedLesson} bookingEntity={bookingEntity} studentEntity={studentEntity} />}
                {viewMode === "commissions" && <CommissionsView lessonRows={filteredLessonRows} expandedLesson={expandedLesson} setExpandedLesson={setExpandedLesson} bookingEntity={bookingEntity} studentEntity={studentEntity} formatCurrency={formatCurrency} />}
                {viewMode === "timeline" && <Timeline events={filteredTimelineEvents} currency={currency} formatCurrency={formatCurrency} showTeacher={false} showFinancials={true} searchPlaceholder="Search student names or locations..." />}
            </AnimatePresence>
        </div>
    );
}
