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
import { lessonsToTransactionEvents, transactionEventToTimelineEvent } from "@/getters/transaction-event-getter";
import { TransactionEventsTable } from "@/src/app/(admin)/(tables)/TransactionEventsTable";
import { BookingReceipt, type BookingReceiptEventRow } from "@/src/components/ids/BookingReceipt";
import { TeacherBookingLessonTable } from "@/src/components/ids/TeacherBookingLessonTable";
import { type LessonRow } from "@/backend/data/TeacherLessonData";
import type { TransactionEventData } from "@/types/transaction-event";

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
    const students = booking.relations?.students || [];

    const formatCurrency = (num: number): string => {
        const rounded = Math.round(num * 100) / 100;
        return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
    };

    const handleEquipmentUpdate = useCallback((eventId: string, equipment: any) => {
        router.refresh();
    }, [router]);

    // Single source of truth: Transform lessons to TransactionEventData once
    const transactionEvents = useMemo(() => {
        return lessonsToTransactionEvents(lessons, schoolPackage, students, booking.schema.leader_student_name, currency);
    }, [lessons, schoolPackage, students, booking.schema.leader_student_name, currency]);

    // Adapt TransactionEventData to TimelineEvent for timeline view
    const timelineEvents = useMemo(() => {
        return transactionEvents.map(transactionEventToTimelineEvent).sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [transactionEvents]);

    // Convert to BookingReceiptEventRow format
    const eventRowsForReceipt: BookingReceiptEventRow[] = useMemo(() => {
        return timelineEvents.map((event) => ({
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
    }, [timelineEvents]);

    // Calculate totals for receipt
    const totals = useMemo(() => {
        return transactionEvents.reduce(
            (acc, event) => ({
                duration: acc.duration + event.event.duration,
                teacherEarnings: acc.teacherEarnings + event.financials.teacherEarnings,
                schoolRevenue: acc.schoolRevenue + event.financials.studentRevenue,
                totalRevenue: acc.totalRevenue + event.financials.studentRevenue,
            }),
            { duration: 0, teacherEarnings: 0, schoolRevenue: 0, totalRevenue: 0 },
        );
    }, [transactionEvents]);

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
                        transactionEvents={transactionEvents}
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
    transactionEvents,
    expandedLesson,
    setExpandedLesson,
    bookingEntity,
    studentEntity,
    formatCurrency,
    currency,
    onEquipmentUpdate,
}: {
    transactionEvents: TransactionEventData[];
    expandedLesson: string | null;
    setExpandedLesson: (id: string | null) => void;
    bookingEntity: any;
    studentEntity: any;
    formatCurrency: (num: number) => string;
    currency: string;
    onEquipmentUpdate?: (eventId: string, equipment: any) => void;
}) {
    // Group transaction events by teacher
    const lessonsByTeacher = useMemo(() => {
        const map = new Map<string, TransactionEventData[]>();
        for (const event of transactionEvents) {
            const username = event.teacher.username;
            if (!map.has(username)) {
                map.set(username, []);
            }
            map.get(username)!.push(event);
        }

        return Array.from(map.entries()).map(([username, events]) => {
            const totalEvents = events.length;
            const totalDuration = events.reduce((sum, e) => sum + e.event.duration, 0);
            const totalHours = totalDuration / 60;
            const totalEarning = events.reduce((sum, e) => sum + e.financials.teacherEarnings, 0);

            // Group by lesson
            const lessonMap = new Map<string, TransactionEventData[]>();
            for (const event of events) {
                const lessonId = event.event.lessonId || "unknown";
                if (!lessonMap.has(lessonId)) {
                    lessonMap.set(lessonId, []);
                }
                lessonMap.get(lessonId)!.push(event);
            }

            const lessons = Array.from(lessonMap.entries()).map(([lessonId, lessonEvents]) => {
                const lessonDuration = lessonEvents.reduce((sum, e) => sum + e.event.duration, 0);
                const lessonHours = lessonDuration / 60;
                const lessonEarning = lessonEvents.reduce((sum, e) => sum + e.financials.teacherEarnings, 0);

                return {
                    lessonId,
                    events: lessonEvents,
                    totalDuration: lessonDuration,
                    totalHours: lessonHours,
                    totalEarning: lessonEarning,
                };
            });

            return { username, totalEvents, totalHours, totalEarning, lessons };
        });
    }, [transactionEvents]);

    return (
        <motion.div
            key="by-teacher"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            {lessonsByTeacher.map(({ username, totalEvents, totalHours, totalEarning, lessons }) => (
                <div key={username} className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/40">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{username}</span>
                            <span className="text-sm text-muted-foreground">
                                ({totalEvents} {totalEvents === 1 ? "event" : "events"})
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {totalHours.toFixed(1)}h • {formatCurrency(totalEarning)} {currency}
                        </div>
                    </div>
                    {lessons.map(({ lessonId, events, totalDuration, totalHours, totalEarning }) => {
                        const firstEvent = events[0];
                        const lessonRow: LessonRow = {
                            lessonId,
                            bookingId: "",
                            leaderName: firstEvent.leaderStudentName,
                            dateStart: firstEvent.event.date,
                            dateEnd: firstEvent.event.date,
                            lessonStatus: "active",
                            bookingStatus: "active",
                            commissionType: firstEvent.commission.type,
                            cph: firstEvent.commission.cph,
                            totalDuration,
                            totalHours,
                            totalEarning,
                            eventCount: events.length,
                            events,
                            equipmentCategory: firstEvent.packageData.categoryEquipment,
                            studentCapacity: firstEvent.packageData.capacityStudents,
                        };

                        return (
                            <TeacherBookingLessonTable
                                key={lessonId}
                                lesson={lessonRow}
                                isExpanded={expandedLesson === lessonId}
                                onToggle={() => setExpandedLesson(expandedLesson === lessonId ? null : lessonId)}
                                bookingEntity={bookingEntity}
                                studentEntity={studentEntity}
                                teacherUsername={username}
                                onEquipmentUpdate={onEquipmentUpdate}
                            />
                        );
                    })}
                </div>
            ))}
        </motion.div>
    );
}
