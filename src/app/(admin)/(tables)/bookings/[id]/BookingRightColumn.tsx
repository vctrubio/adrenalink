"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ENTITY_DATA } from "@/config/entities";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { Timeline } from "@/src/components/timeline";
import { ToggleBar } from "@/src/components/ui/ToggleBar";
import { Calendar, List, Table, Handshake } from "lucide-react";
import type { BookingData } from "@/backend/data/BookingData";
import { buildEventModels, groupEventsByLesson, groupEventsByTeacher, eventModelToTimelineEvent, eventModelToTransactionEventData, type EventModel } from "@/backend/data/EventModel";
import { TransactionEventsTable } from "@/src/app/(admin)/(tables)/TransactionEventsTable";
import { BookingReceipt, type BookingReceiptEventRow } from "@/src/components/ids/BookingReceipt";
import { TeacherBookingLessonTable } from "@/src/components/ids/TeacherBookingLessonTable";
import { type LessonRow } from "@/backend/data/TeacherLessonData";

type ViewMode = "timeline" | "by-teacher" | "table" | "receipt";

interface BookingRightColumnProps {
    booking: BookingData;
}

export function BookingRightColumn({ booking }: BookingRightColumnProps) {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<ViewMode>("timeline");
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;

    const lessons = booking.relations?.lessons || [];
    const schoolPackage = booking.relations?.school_package;

    const formatCurrency = (num: number): string => {
        const rounded = Math.round(num * 100) / 100;
        return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
    };

    // Normalize booking lessons data to match buildEventModels expected structure
    const normalizedLessons = useMemo(() => {
        const students = (booking.relations?.students || []).map((student: any) => ({
            id: student.id,
            first_name: student.first_name,
            last_name: student.last_name,
        }));

        return lessons.map((lesson: any) => ({
            ...lesson,
            // Normalize: events -> event (singular) to match expected structure
            event: lesson.events || [],
            // Add booking object with school_package nested
            booking: {
                id: booking.schema.id,
                leader_student_name: booking.schema.leader_student_name,
                date_start: booking.schema.date_start,
                date_end: booking.schema.date_end,
                status: booking.schema.status,
                students,
                school_package: schoolPackage,
            },
        }));
    }, [lessons, booking, schoolPackage]);

    // Build centralized event models (single source of truth)
    const eventModels = useMemo(() => {
        return buildEventModels(normalizedLessons);
    }, [normalizedLessons]);

    // Handle equipment assignment and status update, then revalidate
    const handleEquipmentUpdate = useCallback((eventId: string, equipment: any) => {
        router.refresh();
    }, [router]);

    // Convert to timeline events
    const timelineEvents = useMemo(() => {
        return eventModels.map(eventModelToTimelineEvent).sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [eventModels]);

    // Convert to TransactionEventData for table view
    const transactionEvents = useMemo(() => {
        return eventModels.map((event) => eventModelToTransactionEventData(event, currency));
    }, [eventModels, currency]);

    // Convert lesson groups to legacy format for receipt
    const eventRowsForReceipt: BookingReceiptEventRow[] = useMemo(() => {
        return eventModels.map((event) => ({
            eventId: event.eventId,
            lessonId: event.lessonId,
            date: event.date,
            time: event.time,
            dateLabel: event.dateLabel,
            dayOfWeek: event.dayOfWeek,
            duration: event.duration,
            durationLabel: event.durationLabel,
            location: event.location,
            teacherId: event.teacherId,
            teacherName: event.teacherName,
            teacherUsername: event.teacherUsername,
            eventStatus: event.eventStatus,
            lessonStatus: event.lessonStatus,
            teacherEarning: event.teacherEarning,
            schoolRevenue: event.schoolRevenue,
            totalRevenue: event.totalRevenue,
            commissionType: event.commissionType,
            commissionCph: event.commissionCph,
        }));
    }, [eventModels]);

    // Calculate totals for receipt
    const totals = useMemo(() => {
        return eventModels.reduce(
            (acc, event) => ({
                duration: acc.duration + event.duration,
                teacherEarnings: acc.teacherEarnings + event.teacherEarning,
                schoolRevenue: acc.schoolRevenue + event.schoolRevenue,
                totalRevenue: acc.totalRevenue + event.totalRevenue,
            }),
            { duration: 0, teacherEarnings: 0, schoolRevenue: 0, totalRevenue: 0 },
        );
    }, [eventModels]);

    return (
        <div className="space-y-6">
            <ToggleBar
                value={viewMode}
                onChange={(v) => setViewMode(v as ViewMode)}
                options={[
                    { id: "timeline", label: "Timeline", icon: Calendar },
                    { id: "by-teacher", label: "By Teacher", icon: Handshake },
                    { id: "table", label: "Table", icon: Table },
                    { id: "receipt", label: "Receipt", icon: List },
                ]}
            />

            <AnimatePresence mode="wait">
                {viewMode === "timeline" && (
                    <Timeline
                        events={timelineEvents}
                        currency={currency}
                        formatCurrency={formatCurrency}
                        showTeacher={true}
                        showFinancials={true}
                        onEquipmentUpdate={handleEquipmentUpdate}
                    />
                )}
                {viewMode === "by-teacher" && (
                    <ByTeacherView
                        eventModels={eventModels}
                        expandedLesson={expandedLesson}
                        setExpandedLesson={setExpandedLesson}
                        bookingEntity={bookingEntity}
                        studentEntity={studentEntity}
                        formatCurrency={formatCurrency}
                        currency={currency}
                        onEquipmentUpdate={handleEquipmentUpdate}
                    />
                )}
                {viewMode === "table" && (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <TransactionEventsTable events={transactionEvents} />
                    </motion.div>
                )}
                {viewMode === "receipt" && (
                    <BookingReceipt
                        booking={booking as any}
                        eventRows={eventRowsForReceipt}
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

// Sub-component: By Teacher View
function ByTeacherView({
    eventModels,
    expandedLesson,
    setExpandedLesson,
    bookingEntity,
    studentEntity,
    formatCurrency,
    currency,
    onEquipmentUpdate,
}: {
    eventModels: EventModel[];
    expandedLesson: string | null;
    setExpandedLesson: (id: string | null) => void;
    bookingEntity: any;
    studentEntity: any;
    formatCurrency: (num: number) => string;
    currency: string;
    onEquipmentUpdate?: (eventId: string, equipment: any) => void;
}) {
    const teacherGroups = useMemo(() => groupEventsByTeacher(eventModels), [eventModels]);
    const lessonGroups = useMemo(() => groupEventsByLesson(eventModels), [eventModels]);

    // Convert lesson groups to LessonRow format for TeacherBookingLessonTable
    const lessonRows: LessonRow[] = useMemo(() => {
        return lessonGroups.map((group) => ({
            lessonId: group.lessonId,
            bookingId: group.bookingId,
            leaderName: group.leaderName,
            dateStart: group.dateStart,
            dateEnd: group.dateEnd,
            lessonStatus: group.lessonStatus,
            bookingStatus: group.bookingStatus,
            commissionType: group.commissionType,
            cph: group.cph,
            totalDuration: group.totalDuration,
            totalHours: group.totalHours,
            totalEarning: group.totalEarning,
            eventCount: group.eventCount,
            events: group.events,
            equipmentCategory: group.equipmentCategory,
            studentCapacity: group.studentCapacity,
        }));
    }, [lessonGroups]);

    // Group lessons by teacher
    const lessonsByTeacher = useMemo(() => {
        const map = new Map<string, LessonRow[]>();
        for (const lesson of lessonRows) {
            const teacherGroup = teacherGroups.find((tg) =>
                tg.events.some((e) => e.lessonId === lesson.lessonId),
            );
            if (teacherGroup) {
                if (!map.has(teacherGroup.teacherId)) {
                    map.set(teacherGroup.teacherId, []);
                }
                map.get(teacherGroup.teacherId)!.push(lesson);
            }
        }
        return Array.from(map.entries()).map(([teacherId, lessons]) => {
            const teacher = teacherGroups.find((tg) => tg.teacherId === teacherId)!;
            return { teacher, lessons };
        });
    }, [lessonRows, teacherGroups]);

    return (
        <motion.div
            key="by-teacher"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            {lessonsByTeacher.map(({ teacher, lessons }) => (
                <div key={teacher.teacherId} className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/40">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{teacher.teacherUsername}</span>
                            <span className="text-sm text-muted-foreground">
                                ({teacher.eventCount} {teacher.eventCount === 1 ? "event" : "events"})
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {teacher.totalHours.toFixed(1)}h • {formatCurrency(teacher.totalEarning)} {currency}
                        </div>
                    </div>
                    {lessons.map((lesson) => (
                        <TeacherBookingLessonTable
                            key={lesson.lessonId}
                            lesson={lesson}
                            isExpanded={expandedLesson === lesson.lessonId}
                            onToggle={() => setExpandedLesson(expandedLesson === lesson.lessonId ? null : lesson.lessonId)}
                            bookingEntity={bookingEntity}
                            studentEntity={studentEntity}
                            teacherId={teacher.teacherId}
                            teacherUsername={teacher.teacherUsername}
                            onEquipmentUpdate={onEquipmentUpdate}
                        />
                    ))}
                </div>
            ))}
        </motion.div>
    );
}
