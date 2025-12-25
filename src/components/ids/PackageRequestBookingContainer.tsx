"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SchoolPackageModel } from "@/backend/models";
import { ENTITY_DATA } from "@/config/entities";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getBookingProgressBar } from "@/getters/booking-progress-getter";
import { calculateCommission, calculateLessonRevenue, type CommissionInfo } from "@/getters/commission-calculator";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { BookingProgressBadge } from "@/src/components/ui/badge/bookingprogress";
import { BookingStatusLabel } from "@/src/components/labels/BookingStatusLabel";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon.jsx";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { Wallet, Tag, Handshake, TrendingUp, Users, Receipt } from "lucide-react";

export interface StudentPackageData {
    id: string;
    status: string;
    walletId: string;
    requestedDateStart: string;
    requestedDateEnd: string;
    createdAt: string;
    referral?: ReferralData;
    studentPackageStudents?: StudentPackageStudentData[];
    bookings?: BookingData[];
}

export interface ReferralData {
    id: string;
    code: string;
    commissionType: string;
    commissionValue: string;
    description?: string;
}

export interface StudentPackageStudentData {
    student?: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

export interface BookingData {
    id: string;
    dateStart: string;
    dateEnd: string;
    status: string;
    leaderStudentName: string;
    createdAt?: string;
    lessons?: LessonData[];
    bookingStudents?: BookingStudentData[];
}

export interface LessonData {
    id: string;
    status: string;
    teacher?: {
        id: string;
        username: string;
        firstName?: string;
    };
    commission?: {
        commissionType: string;
        cph: string;
    };
    events?: EventData[];
}

export interface EventData {
    id: string;
    date: string;
    duration: number;
    location?: string;
    status: string;
}

export interface BookingStudentData {
    student?: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

// Sub-component: Status Badge
function StatusBadge({ status }: { status: string }) {
    const getStatusStyle = () => {
        switch (status) {
            case "requested":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
            case "accepted":
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            case "rejected":
                return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
        }
    };

    return <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle()}`}>{status || "unknown"}</span>;
}

import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { LessonEventDurationBadge } from "@/src/components/ui/badge/lesson-event-duration";
import { LessonEventRow, type LessonEventRowData } from "@/src/components/ids/LessonEventRow";
import { TeacherComissionLessonTable, type TeacherComissionLessonData } from "@/src/components/ids/TeacherComissionLessonTable";

// Sub-component: Booking Card
function BookingCard({ booking, schoolPackage, formatCurrency, currency, referral }: { booking: BookingData; schoolPackage: SchoolPackageModel; formatCurrency: (num: number) => string; currency: string; referral?: ReferralData }) {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const lessons = booking.lessons || [];

    const studentCount = booking.bookingStudents?.length || 1;
    const packageDurationMinutes = schoolPackage.schema.durationMinutes;
    const pricePerStudent = schoolPackage.schema.pricePerStudent;

    // Calculate booking progress for this specific booking
    const bookingLessons = lessons.map((lesson) => ({
        events: (lesson.events || []).map((event) => ({
            duration: event.duration,
            status: event.status,
        })),
    }));
    const bookingProgress = getBookingProgressBar(bookingLessons as any, packageDurationMinutes);

    // Calculate used minutes for this booking
    const usedMinutes = lessons.reduce((sum, lesson) => {
        const events = lesson.events || [];
        return sum + events.reduce((eventSum, e) => eventSum + (e.duration || 0), 0);
    }, 0);

    const teacherLessonRows = lessons.map((lesson) => {
        const events = (lesson.events || []).map((event) => {
            const eventDate = new Date(event.date);
            return {
                eventId: event.id,
                date: eventDate,
                time: eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
                dateLabel: eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                duration: event.duration,
                durationLabel: getPrettyDuration(event.duration),
                location: event.location || "-",
                status: event.status,
            };
        });

        const totalDuration = events.reduce((sum, e) => sum + (e.duration || 0), 0);
        const commission = lesson.commission;
        const cph = parseFloat(commission?.cph || "0");
        const commissionType = commission?.commissionType || "fixed";
        const totalRevenue = calculateLessonRevenue(pricePerStudent, studentCount, totalDuration, packageDurationMinutes);
        const earned = commissionType === "fixed" ? cph * (totalDuration / 60) : (cph / 100) * totalRevenue;

        return {
            lessonId: lesson.id,
            teacherName: lesson.teacher?.username || "Unknown",
            teacherUsername: lesson.teacher?.username || "",
            status: lesson.status,
            cph,
            commissionType,
            eventCount: events.length,
            duration: totalDuration,
            earned,
            events,
        };
    });

    return (
        <>
            {/* Booking Header */}
            <div className="flex items-start gap-3 pb-3">
                {/* Booking Icon */}
                <div className="flex-shrink-0 mt-1" style={{ color: bookingEntity.color }}>
                    <BookingIcon size={32} />
                </div>

                {/* Booking Info */}
                <div className="flex-1 space-y-2">
                    {/* Date Range */}
                    <DateRangeBadge startDate={booking.dateStart} endDate={booking.dateEnd} />

                    {/* Booking Progress */}
                    <BookingProgressBadge usedMinutes={usedMinutes} totalMinutes={packageDurationMinutes} background={bookingProgress.background} />

                    {/* Booking Status */}
                    <div className="flex items-center gap-2">
                        <BookingStatusLabel status={booking.status} size={14} />
                        <span className="text-xs text-muted-foreground">{booking.createdAt ? `Created ${formatDate(booking.createdAt)}` : ""}</span>
                    </div>
                </div>
            </div>

            {/* Lessons Table */}
            {teacherLessonRows.length > 0 && (
                <div className="border-t border-border/50 mt-2 pt-2 bg-card/50 rounded-lg overflow-hidden">
                    {teacherLessonRows.map((lessonData) => (
                        <TeacherComissionLessonTable key={lessonData.lessonId} lesson={lessonData as TeacherComissionLessonData} formatCurrency={formatCurrency} currency={currency} teacherEntity={teacherEntity} />
                    ))}
                </div>
            )}
        </>
    );
}

// Sub-component: Student Package Card
export function StudentPackageCard({ studentPackage, schoolPackage, formatCurrency, currency }: { studentPackage: StudentPackageData; schoolPackage: SchoolPackageModel; formatCurrency: (num: number) => string; currency: string }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
    const referralEntity = ENTITY_DATA.find((e) => e.id === "referral")!;

    const students = studentPackage.studentPackageStudents || [];
    const studentNames = students
        .map((sps) => {
            const student = sps.student;
            if (!student) return null;
            return `${student.firstName} ${student.lastName}`;
        })
        .filter(Boolean)
        .join(", ");

    const bookings = studentPackage.bookings || [];
    const hasBookings = bookings.length > 0;

    // Calculate totals for all bookings
    const packageDurationMinutes = schoolPackage.schema.durationMinutes;
    let totalTeacherCommission = 0;
    let totalRevenue = 0;
    let totalReferralCommission = 0;

    bookings.forEach((booking) => {
        const lessons = booking.lessons || [];
        const studentCount = booking.bookingStudents?.length || 1;
        const packageDurationMinutes = schoolPackage.schema.durationMinutes;
        const pricePerStudent = schoolPackage.schema.pricePerStudent;

        let totalDuration = 0;
        let bookingTeacherCommission = 0;

        lessons.forEach((lesson) => {
            const events = lesson.events || [];
            const lessonDuration = events.reduce((sum, e) => sum + (e.duration || 0), 0);
            const lessonRevenue = calculateLessonRevenue(pricePerStudent, studentCount, lessonDuration, packageDurationMinutes);

            const commissionType = (lesson.commission?.commissionType as "fixed" | "percentage") || "fixed";
            const cph = parseFloat(lesson.commission?.cph || "0");
            const commissionInfo: CommissionInfo = { type: commissionType, cph };
            const commission = calculateCommission(lessonDuration, commissionInfo, lessonRevenue, packageDurationMinutes);

            totalDuration += lessonDuration;
            bookingTeacherCommission += commission.earned;
        });

        const totalHours = totalDuration / 60;
        const bookingRevenue = calculateLessonRevenue(pricePerStudent, studentCount, totalDuration, packageDurationMinutes);

        totalTeacherCommission += bookingTeacherCommission;
        totalRevenue += bookingRevenue;

        // Calculate referral commission
        if (studentPackage.referral) {
            const referralValue = parseFloat(studentPackage.referral.commissionValue || "0");
            if (studentPackage.referral.commissionType === "percentage") {
                totalReferralCommission += (referralValue / 100) * bookingRevenue;
            } else {
                totalReferralCommission += referralValue * totalHours;
            }
        }
    });

    const totalNet = totalRevenue - totalTeacherCommission - totalReferralCommission;

    return (
        <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left outline-none cursor-pointer">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 flex items-start justify-between gap-4 hover:bg-muted/20 transition-colors">
                    <div className="flex-1">
                        {/* Header Info */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <StatusBadge status={studentPackage.status} />
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Wallet size={12} />
                                <span className="font-mono">{studentPackage.walletId.slice(0, 8)}...</span>
                            </div>
                            {studentPackage.referral && (
                                <HoverToEntity entity={referralEntity} id={studentPackage.referral.id}>
                                    <div className="flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-80" style={{ color: referralEntity.color }}>
                                        <Tag size={12} />
                                        <span className="font-medium">{studentPackage.referral.code}</span>
                                    </div>
                                </HoverToEntity>
                            )}
                        </div>

                        {/* Student Names */}
                        {studentNames && <p className="text-sm font-medium text-foreground mb-1">{studentNames}</p>}

                        {/* Requested dates */}
                        <div className="text-xs text-muted-foreground mb-2">
                            Requested: {formatDate(studentPackage.requestedDateStart)} - {formatDate(studentPackage.requestedDateEnd)}
                        </div>

                        {/* Bookings Info */}
                        {hasBookings && (
                            <div className="space-y-3 mt-3">
                                {bookings.map((booking) => {
                                    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
                                    const bookingLessons = (booking.lessons || []).map((lesson) => ({
                                        events: (lesson.events || []).map((event) => ({
                                            duration: event.duration,
                                            status: event.status,
                                        })),
                                    }));
                                    const progress = getBookingProgressBar(bookingLessons as any, packageDurationMinutes);
                                    const usedMins = (booking.lessons || []).reduce((sum, lesson) => {
                                        const events = lesson.events || [];
                                        return sum + events.reduce((eventSum, e) => eventSum + (e.duration || 0), 0);
                                    }, 0);

                                    return (
                                        <div key={booking.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                                            <div className="flex-shrink-0 mt-0.5" style={{ color: bookingEntity.color }}>
                                                <BookingIcon size={20} />
                                            </div>
                                            <div className="flex-1 space-y-1.5 min-w-0">
                                                <DateRangeBadge startDate={booking.dateStart} endDate={booking.dateEnd} />
                                                <BookingProgressBadge usedMinutes={usedMins} totalMinutes={packageDurationMinutes} background={progress.background} />
                                                <div className="flex items-center gap-2">
                                                    <BookingStatusLabel status={booking.status} size={12} />
                                                    <span className="text-xs text-muted-foreground">
                                                        {booking.createdAt ? `Created ${formatDate(booking.createdAt)}` : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right side: Financials and Icon */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {hasBookings && (
                            <div className="flex items-center gap-4 text-xs">
                                <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end mb-0.5">
                                        <Handshake size={12} className="text-green-600 dark:text-green-400" />
                                        <span className="font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency(totalTeacherCommission)} {currency}
                                        </span>
                                    </div>
                                    <div className="text-muted-foreground">teacher</div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end mb-0.5">
                                        <Users size={12} className="text-blue-600 dark:text-blue-400" />
                                        <span className="font-bold text-blue-600 dark:text-blue-400">
                                            {formatCurrency(totalRevenue)} {currency}
                                        </span>
                                    </div>
                                    <div className="text-muted-foreground">revenue</div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end mb-0.5">
                                        <TrendingUp size={12} className="text-orange-600 dark:text-orange-400" />
                                        <span className="font-bold text-orange-600 dark:text-orange-400">
                                            {formatCurrency(totalNet)} {currency}
                                        </span>
                                    </div>
                                    <div className="text-muted-foreground">net</div>
                                </div>
                            </div>
                        )}
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0, scale: 1 }}
                            whileHover={{ rotate: isExpanded ? 200 : -20, scale: 1.15 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="origin-center"
                            style={{ color: packageEntity.color }}
                        >
                            <AdranlinkIcon size={20} />
                        </motion.div>
                    </div>
                </div>

                {/* Expanded bookings */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="px-4 pb-4 pt-2 space-y-4">
                                {hasBookings ? (
                                    <>
                                        {bookings.map((booking, idx) => (
                                            <div key={booking.id} className={`${idx > 0 ? "border-t border-border/30 pt-4" : ""}`}>
                                                <BookingCard booking={booking} schoolPackage={schoolPackage} formatCurrency={formatCurrency} currency={currency} referral={studentPackage.referral} />
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="text-sm text-muted-foreground py-2">No bookings yet</div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </button>
    );
}
