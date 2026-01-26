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
import { transactionEventToTimelineEvent } from "@/getters/booking-lesson-event-getter"; // Only need this for timeline conversion
import { TransactionEventsTable } from "@/src/app/(admin)/(tables)/TransactionEventsTable";
import { BookingReceipt, type BookingReceiptEventRow } from "@/src/components/ids/BookingReceipt";
import { TeacherBookingLessonTable } from "@/src/components/ids/TeacherBookingLessonTable";
import { safeArray } from "@/backend/error-handlers"; // Import safeArray

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
    const formatCurrency = useCallback((num: number) => {
        return `${num.toFixed(2)} ${currency}`;
    }, [currency]);

    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;

    // Directly use pre-computed transactions and lessonRows from booking.data
    const transactionEvents = booking.transactions || [];
    const lessonRows = booking.lessonRows || [];
    const schoolPackage = booking.relations?.school_package;

    const handleEquipmentUpdate = useCallback((eventId: string, equipment: any) => {
        router.refresh();
    }, [router]);

    // Adapt TransactionEventData to TimelineEvent for timeline view
    const timelineEvents = useMemo(() => {
        return safeArray(transactionEvents).map(transactionEventToTimelineEvent).sort((a, b) => a.date.getTime() - b.date.getTime());
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
        return safeArray(transactionEvents).reduce(
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
                        lessonRows={lessonRows}
                        expandedLesson={expandedLesson}
                        setExpandedLesson={setExpandedLesson}
                        bookingEntity={bookingEntity}
                        studentEntity={studentEntity}
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
                        <TransactionEventsTable events={transactionEvents} enableTableLogic={false} />
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
    lessonRows,
    expandedLesson,
    setExpandedLesson,
    bookingEntity,
    studentEntity,
    currency,
    onEquipmentUpdate,
}: {
    lessonRows: LessonRow[];
    expandedLesson: string | null;
    setExpandedLesson: (id: string | null) => void;
    bookingEntity: any;
    studentEntity: any;
    currency: string;
    onEquipmentUpdate?: (eventId: string, equipment: any) => void;
}) {

    return (
        <motion.div
            key="by-lesson"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            {lessonRows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No lessons found for this booking.
                </div>
            ) : (
                safeArray(lessonRows).map((lessonRow) => {
                    const teacherUsername = lessonRow.events[0]?.teacherUsername || ""; // Ensure teacherUsername is a string
                    return (
                        <TeacherBookingLessonTable
                            key={lessonRow.lessonId}
                            lesson={lessonRow}
                            isExpanded={expandedLesson === lessonRow.lessonId}
                            onToggle={() => setExpandedLesson(expandedLesson === lessonRow.lessonId ? null : lessonRow.lessonId)}
                            bookingEntity={bookingEntity}
                            studentEntity={studentEntity}
                            teacherUsername={teacherUsername}
                            onEquipmentUpdate={onEquipmentUpdate}
                            clickable={true} // Admin view, so clickable
                        />
                    );
                })
            )}
        </motion.div>
    );
}
