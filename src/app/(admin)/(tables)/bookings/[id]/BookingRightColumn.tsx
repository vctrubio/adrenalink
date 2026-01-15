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

type ViewMode = "timeline" | "by-lesson" | "table" | "receipt";

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

    const handleEquipmentUpdate = useCallback((eventId: string, equipment: any) => {
        router.refresh();
    }, [router]);

    // Single source of truth: Transform lessons to TransactionEventData once
    const transactionEvents = useMemo(() => {
        return lessonsToTransactionEvents(lessons, currency);
    }, [lessons, currency]);

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
                    { id: "by-lesson", label: "By Lesson", icon: Handshake },
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
                {viewMode === "by-lesson" && (
                    <ByLessonView
                        lessons={lessons}
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

// Sub-component: By Lesson View
function ByLessonView({
    lessons,
    transactionEvents,
    expandedLesson,
    setExpandedLesson,
    bookingEntity,
    studentEntity,
    formatCurrency,
    currency,
    onEquipmentUpdate,
}: {
    lessons: any[];
    transactionEvents: TransactionEventData[];
    expandedLesson: string | null;
    setExpandedLesson: (id: string | null) => void;
    bookingEntity: any;
    studentEntity: any;
    formatCurrency: (num: number) => string;
    currency: string;
    onEquipmentUpdate?: (eventId: string, equipment: any) => void;
}) {
    // Create a map of lesson ID to transaction events for quick lookup
    const eventsByLessonId = useMemo(() => {
        const map = new Map<string, TransactionEventData[]>();
        for (const event of transactionEvents) {
            const lessonId = event.event.lessonId || "unknown";
            if (!map.has(lessonId)) {
                map.set(lessonId, []);
            }
            map.get(lessonId)!.push(event);
        }
        return map;
    }, [transactionEvents]);

    // Group lessons directly (including those without events)
    const lessonsGrouped = useMemo(() => {
        if (!lessons || lessons.length === 0) {
            return [];
        }
        
        return lessons.map((lesson) => {
            const lessonId = lesson.id;
            const lessonEvents = eventsByLessonId.get(lessonId) || [];
            
            const totalDuration = lessonEvents.reduce((sum, e) => sum + e.event.duration, 0);
            const totalHours = totalDuration / 60;
            const totalEarning = lessonEvents.reduce((sum, e) => sum + e.financials.teacherEarnings, 0);

            // Get lesson data from first event if available, otherwise from lesson object
            const firstEvent = lessonEvents[0];
            const teacher = lesson.teacher;
            const commission = lesson.teacher_commission;
            const booking = lesson.booking;
            const schoolPackage = booking?.school_package;

            // Ensure we have all required data even when there are no events
            const hasEvents = lessonEvents.length > 0;
            
            return {
                lessonId,
                lesson,
                events: lessonEvents,
                totalDuration,
                totalHours,
                totalEarning,
                teacherUsername: teacher?.username || "",
                commissionType: commission?.commission_type || "fixed",
                cph: commission?.cph || "0",
                leaderName: booking?.leader_student_name || "",
                equipmentCategory: schoolPackage?.category_equipment || "",
                studentCapacity: schoolPackage?.capacity_students || 0,
                firstEventDate: hasEvents 
                    ? firstEvent.event.date 
                    : (booking?.date_start || ""),
                hasEvents,
            };
        });
    }, [lessons, eventsByLessonId]);

    return (
        <motion.div
            key="by-lesson"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            {lessonsGrouped.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No lessons found for this booking.
                </div>
            ) : (
                lessonsGrouped.map(({ lessonId, lesson, events, totalDuration, totalHours, totalEarning, teacherUsername, commissionType, cph, leaderName, equipmentCategory, studentCapacity, firstEventDate, hasEvents }) => {
                    const lessonRow: LessonRow = {
                        lessonId,
                        bookingId: lesson.booking_id || "",
                        leaderName,
                        dateStart: firstEventDate,
                        dateEnd: firstEventDate,
                        lessonStatus: lesson.status || "active",
                        bookingStatus: "active",
                        commissionType: commissionType as "fixed" | "percentage",
                        cph: parseFloat(cph),
                        totalDuration,
                        totalHours,
                        totalEarning,
                        eventCount: events.length,
                        events: hasEvents ? events.map(transactionEventToTimelineEvent) : [],
                        equipmentCategory,
                        studentCapacity,
                    };

                    return (
                        <TeacherBookingLessonTable
                            key={lessonId}
                            lesson={lessonRow}
                            isExpanded={expandedLesson === lessonId}
                            onToggle={() => setExpandedLesson(expandedLesson === lessonId ? null : lessonId)}
                            bookingEntity={bookingEntity}
                            studentEntity={studentEntity}
                            teacherUsername={teacherUsername}
                            onEquipmentUpdate={onEquipmentUpdate}
                        />
                    );
                })
            )}
        </motion.div>
    );
}
