"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SchoolPackageModel } from "@/backend/models";
import { ENTITY_DATA } from "@/config/entities";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getEventStatusCounts, getProgressColor } from "@/getters/booking-progress-getter";
import { calculateCommission, calculateLessonRevenue, type CommissionInfo } from "@/getters/commission-calculator";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { BookingProgressBadge } from "@/src/components/ui/badge/bookingprogress";
import { BookingStatusLabel } from "@/src/components/labels/BookingStatusLabel";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { Wallet, Tag, Handshake, TrendingUp, Users, Receipt } from "lucide-react";

export interface StudentPackageData {
    id: string;
    status: string;
    wallet_id: string;
    requested_date_start: string;
    requested_date_end: string;
    created_at: string;
    referral?: ReferralData;
    studentPackageStudents?: StudentPackageStudentData[];
    bookings?: BookingData[];
}

export interface ReferralData {
    id: string;
    code: string;
    commission_type: string;
    commission_value: string;
    description?: string;
}

export interface StudentPackageStudentData {
    student?: {
        id: string;
        first_name: string;
        last_name: string;
    };
}

export interface BookingData {
    id: string;
    date_start: string;
    date_end: string;
    status: string;
    leader_student_name: string;
    created_at?: string;
    lessons?: LessonData[];
    booking_student?: BookingStudentData[];
}

export interface LessonData {
    id: string;
    status: string;
    teacher?: {
        id: string;
        username: string;
        first_name?: string;
    };
    commission?: {
        commission_type: string;
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
        first_name: string;
        last_name: string;
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

import { TeacherComissionLessonTable, type TeacherComissionLessonData } from "@/src/components/ids/TeacherComissionLessonTable";
import { transformEventsToRows } from "@/getters/event-getter";
import type { EventData as TypedEventData } from "@/types/booking-lesson-event";

// Sub-component: Booking Card
function BookingCard({ booking, schoolPackage, formatCurrency, currency }: { booking: BookingData; schoolPackage: any; formatCurrency: (num: number) => string; currency: string; referral?: ReferralData }) {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const lessons = booking.lessons || [];

    // Correctly using capacity_students as instructed
    const studentCount = schoolPackage.capacity_students || 1;
    const packageDurationMinutes = schoolPackage.duration_minutes;
    const pricePerStudent = schoolPackage.price_per_student;

    const teacherLessonRows = lessons.map((lesson) => {
        const events = transformEventsToRows((lesson.events || []) as TypedEventData[]);

        const totalDuration = events.reduce((sum, e) => sum + (e.duration || 0), 0);
        const cph = parseFloat(lesson.commission?.cph || "0");
        const commissionType = (lesson.commission?.commission_type as "fixed" | "percentage") || "fixed";
        const totalRevenue = calculateLessonRevenue(pricePerStudent, studentCount, totalDuration, packageDurationMinutes);
        const earned = commissionType === "fixed" ? cph * (totalDuration / 60) : (cph / 100) * totalRevenue;

        return {
            lessonId: lesson.id,
            teacherName: lesson.teacher?.first_name || "Unknown",
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
export function StudentPackageCard({ studentPackage, schoolPackage, formatCurrency, currency }: { studentPackage: StudentPackageData; schoolPackage: any; formatCurrency: (num: number) => string; currency: string }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
    const referralEntity = ENTITY_DATA.find((e) => e.id === "referral")!;

    const students = studentPackage.studentPackageStudents || [];
    const studentNames = students
        .map((sps) => {
            const student = sps.student;
            if (!student) return null;
            return `${student.first_name} ${student.last_name}`;
        })
        .filter(Boolean)
        .join(", ");

    const bookings = studentPackage.bookings || [];
    const hasBookings = bookings.length > 0;

    const walletId = studentPackage.wallet_id;
    const requestedDateStart = studentPackage.requested_date_start;
    const requestedDateEnd = studentPackage.requested_date_end;

    // Use capacity_students and duration_minutes from schoolPackage (Supabase structure)
    const pkg = schoolPackage.schema || schoolPackage; // Handle both PackageData and direct schema
    const packageDurationMinutes = pkg.duration_minutes;
    const pricePerStudent = pkg.price_per_student;
    const studentCount = pkg.capacity_students || 1;

    let totalTeacherCommission = 0;
    let totalRevenue = 0;
    let totalReferralCommission = 0;

    bookings.forEach((booking) => {
        const lessons = booking.lessons || [];
        let totalDuration = 0;
        let bookingTeacherCommission = 0;

        lessons.forEach((lesson) => {
            const events = lesson.events || [];
            const lessonDuration = events.reduce((sum, e) => sum + (e.duration || 0), 0);
            const lessonRevenue = calculateLessonRevenue(pricePerStudent, studentCount, lessonDuration, packageDurationMinutes);

            const commissionType = (lesson.commission?.commission_type as "fixed" | "percentage") || "fixed";
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
            const referralValue = parseFloat(studentPackage.referral.commission_value || "0");
            if (studentPackage.referral.commission_type === "percentage") {
                totalReferralCommission += (referralValue / 100) * bookingRevenue;
            } else {
                totalReferralCommission += referralValue * totalHours;
            }
        }
    });

    const totalNet = totalRevenue - totalTeacherCommission - totalReferralCommission;

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden group/package">
            <div 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="w-full text-left outline-none cursor-pointer px-4 py-3 flex items-start justify-between gap-4 hover:bg-muted/20 transition-colors"
            >
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2" onClick={(e) => e.stopPropagation()}>
                        <StatusBadge status={studentPackage.status} />
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Wallet size={12} />
                            <span className="font-mono">{walletId ? `${walletId.slice(0, 8)}...` : "No Wallet"}</span>
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

                    {studentNames && <p className="text-sm font-medium text-foreground mb-1">{studentNames}</p>}

                    <div className="text-xs text-muted-foreground mb-2">
                        Requested: {formatDate(requestedDateStart)} - {formatDate(requestedDateEnd)}
                    </div>

                    {hasBookings && (
                        <div className="space-y-3 mt-3">
                            {bookings.map((booking) => {
                                const bookingEvents = (booking.lessons || []).flatMap((lesson) => lesson.events || []);
                                const bookingCounts = getEventStatusCounts(bookingEvents as any);
                                const progress = { background: getProgressColor(bookingCounts, packageDurationMinutes) };
                                const usedMins = (booking.lessons || []).reduce((sum, lesson) => {
                                    const events = lesson.events || [];
                                    return sum + events.reduce((eventSum, e) => eventSum + (e.duration || 0), 0);
                                }, 0);

                                return (
                                    <div key={booking.id} className="flex flex-col gap-2 p-2 rounded-lg bg-muted/30" onClick={(e) => e.stopPropagation()}>
                                        <div className="w-fit">
                                            <BookingStatusLabel 
                                                status={booking.status} 
                                                bookingId={booking.id}
                                                startDate={booking.date_start} 
                                                endDate={booking.date_end} 
                                                size={20} 
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1.5 min-w-0">
                                            <BookingProgressBadge usedMinutes={usedMins} totalMinutes={packageDurationMinutes} background={progress.background} />
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {booking.created_at ? `Created ${formatDate(booking.created_at)}` : ""}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

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
                    <ToggleAdranalinkIcon 
                        isOpen={isExpanded} 
                        color={packageEntity.color} 
                    />
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="px-4 pb-4 pt-2 space-y-4">
                            {hasBookings ? (
                                <>
                                    {bookings.map((booking, idx) => (
                                        <div key={booking.id} className={`${idx > 0 ? "border-t border-border/30 pt-4" : ""}`}>
                                            <BookingCard booking={booking} schoolPackage={pkg} formatCurrency={formatCurrency} currency={currency} referral={studentPackage.referral} />
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground py-2 px-4 italic">No bookings yet</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}