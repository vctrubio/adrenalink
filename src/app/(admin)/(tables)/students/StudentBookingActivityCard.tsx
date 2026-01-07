"use client";

import { useState } from "react";
import { Check, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import RequestIcon from "@/public/appSvgs/RequestIcon";
import { StatItemUI } from "@/backend/data/StatsData";
import { BOOKING_STATUS_CONFIG, type BookingStatus } from "@/types/status";
import type { BookingTableStats, Package, LessonWithPayments } from "@/config/tables";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { TeacherLessonStatsBadge } from "@/src/components/ui/badge/teacher-lesson-stats";
import { ClassboardProgressBar } from "../../classboard/ClassboardProgressBar";
import { BookingStatusDropdown } from "@/src/components/labels/BookingStatusDropdown";

interface StudentBookingActivityCardProps {
    booking: {
        id: string;
        status: string;
        dateStart: string;
        dateEnd: string;
        packageName: string;
        packageDetails: Package;
        lessons: LessonWithPayments[];
    };
    stats: BookingTableStats;
}

export function StudentBookingActivityCard({ booking, stats }: StudentBookingActivityCardProps) {
    const isCompleted = booking.status === "completed";
    const [isOpen, setIsOpen] = useState(!isCompleted);

    const statusConfig = BOOKING_STATUS_CONFIG[booking.status as BookingStatus];

    const revenue = stats.events.revenue;
    const paid = stats.payments.student;
    const balance = revenue - paid;
    const isPaid = paid >= revenue;

    return (
        <div className="rounded-xl bg-blue-50/30 dark:bg-blue-900/5 border border-blue-100 dark:border-blue-900/20 overflow-hidden transition-all duration-200">
            {/* Header / Clickable Area */}
            <div className="p-2.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <BookingStatusDropdown bookingId={booking.id} currentStatus={booking.status} dateStart={booking.dateStart} dateEnd={booking.dateEnd} />

                    <div className="h-3 w-px bg-border/60 mx-1 shrink-0 hidden sm:block" />

                    <div className="scale-90 origin-left shrink-0">
                        <EquipmentStudentPackagePriceBadge
                            categoryEquipment={booking.packageDetails.categoryEquipment}
                            equipmentCapacity={booking.packageDetails.capacityEquipment}
                            studentCapacity={booking.packageDetails.capacityStudents}
                            packageDurationHours={booking.packageDetails.durationMinutes / 60}
                            pricePerHour={booking.packageDetails.pph}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        {isPaid ? (
                            <div className="flex items-center gap-1 text-emerald-600">
                                <Check size={10} strokeWidth={4} />
                                <span className="font-black uppercase text-[8px]">Paid</span>
                            </div>
                        ) : (
                            <span className="text-rose-600 font-black uppercase text-[8px]">{balance.toFixed(0)} Due</span>
                        )}
                    </div>
                    <div className="hidden sm:block">{isOpen ? <ChevronDown size={14} className="text-muted-foreground/40" /> : <ChevronRight size={14} className="text-muted-foreground/40" />}</div>
                </div>
            </div>

            {/* Collapsible Content */}
            {isOpen && (
                <>
                    <ClassboardProgressBar counts={stats.events.statusCounts} durationMinutes={booking.packageDetails.durationMinutes} />

                    <div className="p-2.5 space-y-3 pt-3">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-wrap gap-1.5 flex-1">
                                {booking.lessons.map((lesson) => (
                                    <div key={lesson.id} className="scale-90 origin-left">
                                        <TeacherLessonStatsBadge
                                            teacherId={lesson.teacherId}
                                            teacherUsername={lesson.teacherUsername}
                                            eventCount={lesson.events.totalCount}
                                            durationMinutes={lesson.events.totalDuration}
                                            commission={lesson.commission}
                                            showCommission={true}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 border border-border/40 rounded-lg px-2 py-1 bg-muted/5 shrink-0">
                                {/* Progress Hours */}
                                <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase tracking-tighter shrink-0">
                                    <span>{(stats.events.statusCounts.completed / 60).toFixed(1)}</span>
                                    <span className="opacity-30">/</span>
                                    <span className="opacity-60">{(booking.packageDetails.durationMinutes / 60).toFixed(1)}H</span>
                                </div>

                                <div className="h-3 w-px bg-border/60 shrink-0" />

                                {/* Financials */}
                                <div className="flex items-center gap-3 text-[10px] font-bold shrink-0 opacity-60">
                                    <div className="flex items-center gap-1" title="Revenue">
                                        <TrendingUp size={10} className="text-yellow-500" />
                                        <span className="text-foreground">{revenue.toFixed(0)}</span>
                                    </div>
                                    <div className="flex items-center gap-1" title="Paid">
                                        <CreditIcon size={10} className="text-muted-foreground" />
                                        <span className="text-foreground">{paid.toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-blue-100 dark:border-blue-900/20">
                            <div className="flex items-center gap-2 flex-1 ml-1">
                                <RequestIcon size={12} className="text-muted-foreground/40 shrink-0" />
                                <span className="text-[10px] font-black text-foreground uppercase tracking-tight truncate">{booking.packageName}</span>
                            </div>

                            {statusConfig && (
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter shrink-0" style={{ backgroundColor: `${statusConfig.color}15`, color: statusConfig.color }}>
                                    {booking.status === "completed" && <Check size={8} strokeWidth={4} />}
                                    {statusConfig.label}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
