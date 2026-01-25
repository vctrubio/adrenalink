"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EVENT_STATUS_CONFIG, LESSON_STATUS_CONFIG } from "@/types/status";
import { getEventStatusCounts, getProgressColor } from "@/getters/booking-progress-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import { calculateCommission, calculateLessonRevenue, type CommissionInfo } from "@/getters/commission-calculator";
import { formatDate } from "@/getters/date-getter";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { BookingProgressBadge } from "@/src/components/ui/badge/bookingprogress";
import { EquipmentStudentPaymentsBadge } from "@/src/components/ui/badge/equipment-student-payments";
import { TeacherComissionLessonTable, type TeacherComissionLessonData } from "@/src/components/ids/TeacherComissionLessonTable";
import { transformEventsToRows } from "@/getters/event-getter";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { MapPin, TrendingUpDown } from "lucide-react";
import type { LessonEventRowData } from "@/types/booking-lesson-event";
import { BookingStatusLabel } from "@/src/components/labels/BookingStatusLabel";
import { getTimeFromISO } from "@/getters/queue-getter";

export interface BookingData {
    id: string;
    status: string;
    leader_student_name: string;
    date_start: string;
    date_end: string;
    created_at: string;
    lessons?: LessonData[];
    school_package?: SchoolPackageData;
    booking_student?: BookingStudentData[];
    student_booking_payment?: PaymentData[];
}

export interface LessonData {
    id: string;
    status: string;
    teacher?: {
        id: string;
        username: string;
        first_name?: string;
    };
    events?: EventData[];
    commission?: {
        commission_type: string;
        cph: string;
    };
}

export interface EventData {
    id: string;
    date: string;
    duration: number;
    location?: string;
    status: string;
}

export interface StudentPackageData {
    id: string;
    status: string;
    requested_clerk_id: string;
    school_package?: SchoolPackageData;
    referral?: { code: string };
}

export interface SchoolPackageData {
    id: string;
    description: string;
    duration_minutes: number;
    price_per_student: number;
    capacity_students: number;
    capacity_equipment: number;
    category_equipment: string;
}

export interface BookingStudentData {
    student?: {
        id: string;
        first_name: string;
        last_name: string;
    };
}

export interface PaymentData {
    id: string;
    amount: number;
    created_at: string;
}

interface TeacherLessonRow {
    lessonId: string;
    teacherId: string;
    teacherName: string;
    teacherUsername: string;
    lessonStatus: string;
    commissionType: string;
    cph: number;
    totalDuration: number;
    totalHours: number;
    totalEarning: number;
    eventCount: number;
    events: LessonEventRowData[];
}

interface Totals {
    duration: number;
    hours: number;
    events: number;
    teacherEarnings: number;
    totalRevenue: number;
    schoolRevenue: number;
}

// Sub-component: Payments Section
function PaymentsSection({ payments, currency }: { payments: PaymentData[]; currency: string }) {
    const paymentEntity = ENTITY_DATA.find((e) => e.id === "payment")!;
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div style={{ color: paymentEntity.color }}>
                    <CreditIcon size={14} />
                </div>
                <span>Payments</span>
                {payments.length > 0 && <span className="text-muted-foreground">({payments.length})</span>}
            </div>
            {payments.length > 0 ? (
                <div className="space-y-1 pl-4">
                    {payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{formatDate(payment.created_at)}</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                                {payment.amount} {currency}
                            </span>
                        </div>
                    ))}
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border mt-1">
                        <span className="font-medium text-foreground">Total Paid</span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                            {totalPaid} {currency}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="text-xs text-muted-foreground pl-4 py-1">No payments recorded</div>
            )}
        </div>
    );
}

// Main Component
interface FullBookingCardProps {
    bookingData: BookingData;
    currency: string;
    formatCurrency: (num: number) => string;
}

export function FullBookingCard({ bookingData, currency, formatCurrency }: FullBookingCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const bookingEntity_color = bookingEntity.color;
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;

    const lessons = bookingData.lessons || [];
    const schoolPackage = bookingData.school_package;
    const payments = bookingData.student_booking_payment || [];
    const studentCount = bookingData.booking_student?.length || 1;

    if (!schoolPackage) {
        return <div className="rounded-xl border border-border p-4 text-muted-foreground">Booking missing package information</div>;
    }

    // Calculate progress bar
    const bookingEvents = lessons.flatMap((lesson) => lesson.events || []);
    const counts = getEventStatusCounts(bookingEvents as any);
    const progressBar = { background: getProgressColor(counts, schoolPackage.duration_minutes) };
    const usedMinutes = lessons.reduce((sum, lesson) => {
        const lessonMinutes = lesson.events?.reduce((acc, event) => acc + (event.duration || 0), 0) || 0;
        return sum + lessonMinutes;
    }, 0);

    // Build teacher lesson rows
    const teacherLessons: TeacherLessonRow[] = lessons.map((lesson) => {
        const events = lesson.events || [];
        const lessonDurationMinutes = events.reduce((sum, e) => sum + (e.duration || 0), 0);
        const lessonRevenue = calculateLessonRevenue(
            schoolPackage.price_per_student,
            studentCount,
            lessonDurationMinutes,
            schoolPackage.duration_minutes,
        );

        const commissionType = (lesson.commission?.commission_type as "fixed" | "percentage") || "fixed";
        const cph = parseFloat(lesson.commission?.cph || "0");
        const commissionInfo: CommissionInfo = { type: commissionType, cph };
        const commission = calculateCommission(lessonDurationMinutes, commissionInfo, lessonRevenue, schoolPackage.duration_minutes);

        const eventRows = transformEventsToRows(events as any);

        return {
            lessonId: lesson.id,
            teacherId: lesson.teacher?.id || "",
            teacherName: lesson.teacher?.first_name || lesson.teacher?.username || "Unknown",
            teacherUsername: lesson.teacher?.username || "unknown",
            lessonStatus: lesson.status,
            commissionType,
            cph,
            totalDuration: lessonDurationMinutes,
            totalHours: lessonDurationMinutes / 60,
            totalEarning: commission.earned,
            eventCount: events.length,
            events: eventRows,
        };
    });

    // Calculate totals
    const totals: Totals = teacherLessons.reduce(
        (acc, lesson) => ({
            duration: acc.duration + lesson.totalDuration,
            hours: acc.hours + lesson.totalHours,
            events: acc.events + lesson.eventCount,
            teacherEarnings: acc.teacherEarnings + lesson.totalEarning,
            totalRevenue: acc.totalRevenue,
            schoolRevenue: acc.schoolRevenue,
        }),
        { duration: 0, hours: 0, events: 0, teacherEarnings: 0, totalRevenue: 0, schoolRevenue: 0 },
    );

    // Calculate total revenue and school revenue
    const totalRevenue = calculateLessonRevenue(
        schoolPackage.price_per_student,
        studentCount,
        totals.duration,
        schoolPackage.duration_minutes,
    );
    totals.totalRevenue = totalRevenue;
    totals.schoolRevenue = totalRevenue - totals.teacherEarnings;

    const packageDurationHours = Math.round(schoolPackage.duration_minutes / 60);

    return (
        <div onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left outline-none cursor-pointer group/booking">
            <div className="rounded-xl border border-border overflow-hidden bg-card">
                {/* Progress Bar */}
                <div className="h-2" style={{ background: progressBar.background }} />

                {/* Header - Always Visible */}
                <div className="px-4 py-3 border-b border-border hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                            {/* Date and Progress Badge */}
                            <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                                <BookingStatusLabel
                                    status={bookingData.status}
                                    bookingId={bookingData.id}
                                    startDate={bookingData.date_start}
                                    endDate={bookingData.date_end}
                                />
                                <BookingProgressBadge
                                    usedMinutes={usedMinutes}
                                    totalMinutes={schoolPackage.duration_minutes}
                                    background={progressBar.background}
                                />
                            </div>

                            {/* Package Info and Revenue Row */}
                            <div className="flex items-center justify-between gap-4">
                                <EquipmentStudentPaymentsBadge
                                    categoryEquipment={schoolPackage.category_equipment}
                                    equipmentCapacity={schoolPackage.capacity_equipment}
                                    studentCapacity={schoolPackage.capacity_students}
                                    packageDurationHours={packageDurationHours}
                                    pricePerHour={schoolPackage.price_per_student}
                                    currency={currency}
                                />
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 border border-border/50 text-xs font-bold whitespace-nowrap">
                                    <TrendingUpDown size={14} className="text-muted-foreground" />
                                    <span className="text-foreground">
                                        {formatCurrency(totals.totalRevenue)} {currency}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Icon */}
                        <ToggleAdranalinkIcon isOpen={isExpanded} color={bookingEntity_color} className="flex-shrink-0" />
                    </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 space-y-3 border-t border-border">
                                {/* Package Description */}
                                <div className="space-y-1.5">
                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Package</div>
                                    {schoolPackage && (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <HoverToEntity
                                                entity={ENTITY_DATA.find((e) => e.id === "schoolPackage")!}
                                                id={schoolPackage.id}
                                            >
                                                <div
                                                    className="text-sm font-semibold text-foreground cursor-pointer transition-colors hover:opacity-80"
                                                    style={{ color: ENTITY_DATA.find((e) => e.id === "schoolPackage")!.color }}
                                                >
                                                    {schoolPackage.description}
                                                </div>
                                            </HoverToEntity>
                                        </div>
                                    )}
                                </div>

                                {/* Students */}
                                {bookingData.booking_student && bookingData.booking_student.length > 0 && (
                                    <div className="space-y-1.5">
                                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Students
                                        </div>
                                        <div className="space-y-1">
                                            {bookingData.booking_student.map((bs) => {
                                                const student = bs.student;
                                                const studentName = student ? `${student.first_name} ${student.last_name}` : "Unknown";
                                                const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
                                                return (
                                                    <div key={student?.id || "unknown"} onClick={(e) => e.stopPropagation()}>
                                                        <HoverToEntity entity={studentEntity} id={student?.id || ""}>
                                                            <div className="flex items-center gap-2 text-xs cursor-pointer py-1">
                                                                <div style={{ color: studentEntity.color }}>
                                                                    <HelmetIcon size={14} />
                                                                </div>
                                                                <span className="font-medium text-foreground">{studentName}</span>
                                                            </div>
                                                        </HoverToEntity>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Payments */}
                                <PaymentsSection payments={payments} currency={currency} />

                                {/* Lessons by Teacher */}
                                {teacherLessons.length > 0 && (
                                    <div className="space-y-1.5">
                                        {teacherLessons.map((lesson) => {
                                            const lessonData: TeacherComissionLessonData = {
                                                lessonId: lesson.lessonId,
                                                teacherUsername: lesson.teacherUsername,
                                                status: lesson.lessonStatus,
                                                commissionType: lesson.commissionType,
                                                cph: lesson.cph,
                                                eventCount: lesson.eventCount,
                                                duration: lesson.totalDuration,
                                                earned: lesson.totalEarning,
                                                events: lesson.events,
                                            };
                                            return (
                                                <TeacherComissionLessonTable
                                                    key={lesson.lessonId}
                                                    lesson={lessonData}
                                                    formatCurrency={formatCurrency}
                                                    currency={currency}
                                                    teacherEntity={teacherEntity}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
