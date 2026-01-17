"use client";

import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { ActiveTeacherLessonBadge } from "@/src/components/ui/badge/active-teacher-lesson";
import { TeacherLessonStatsBadge } from "@/src/components/ui/badge/teacher-lesson-stats";
import { TeacherCommissionBadge } from "@/src/components/ui/badge/teacher-commission";
import { StudentStatusBadge } from "@/src/components/ui/badge/student-status";
import { TeacherActiveLesson } from "@/src/components/ui/badge/teacher-active-lesson";
import { StatItemUI } from "@/backend/data/StatsData";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { Calendar } from "lucide-react";
import { ClassboardProgressBar } from "@/src/app/(admin)/classboard/ClassboardProgressBar";
import type { EventStatusMinutes } from "@/getters/booking-progress-getter";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import StudentBookingCard from "@/src/app/(admin)/classboard/StudentBookingCard";
import { StudentBookingActivityCard } from "@/src/app/(admin)/(tables)/students/StudentBookingActivityCard";
import { ClassboardProvider } from "@/src/providers/classboard-provider";
import { SchoolTeachersProvider } from "@/src/providers/school-teachers-provider";
import type { ClassboardData, ClassboardLesson } from "@/backend/classboard/ClassboardModel";
import type { BookingTableStats, Package, LessonWithPayments } from "@/config/tables";

export default function BadgeShowcase() {
    return (
        <div className="space-y-8 p-8 bg-background rounded-lg border border-border">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Understanding Badges</h2>
                <p className="text-muted-foreground">Visual indicators throughout the app that communicate status, capacity, and financial information at a glance.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">
                {/* Equipment Student Package Price Badge */}
                <div className="space-y-3 p-4 bg-card rounded-lg border border-border/50">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">Equipment & Package Info</h3>
                        <p className="text-sm text-muted-foreground">Displays equipment type, student/equipment capacity, duration, and price per hour.</p>
                    </div>
                    <div className="pt-2 border-t border-border/30">
                        <EquipmentStudentPackagePriceBadge
                            categoryEquipment="kite"
                            equipmentCapacity={2}
                            studentCapacity={4}
                            packageDurationHours={8}
                            pricePerHour={50}
                        />
                    </div>
                </div>

                {/* Active Teacher Lesson Badge */}
                <div className="space-y-3 p-4 bg-card rounded-lg border border-border/50">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">Teacher Lesson Info</h3>
                        <p className="text-sm text-muted-foreground">Interactive badge showing teacher, leader student, capacity, status, and commission details.</p>
                    </div>
                    <div className="pt-2 border-t border-border/30">
                        <ActiveTeacherLessonBadge
                            bookingId="booking-001"
                            category="kite"
                            leaderName="Alice Johnson"
                            capacity={3}
                            status="active"
                            commission={{ type: "fixed", cph: "15" }}
                        />
                    </div>
                </div>

                {/* Lesson Summary List */}
                <div className="space-y-3 p-4 bg-card rounded-lg border border-border/50">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">Lesson Summary List</h3>
                        <p className="text-sm text-muted-foreground">Shows assigned teachers for a booking with event counts, duration, and commission.</p>
                    </div>
                    <div className="pt-2 border-t border-border/30 flex flex-wrap gap-2">
                        <TeacherLessonStatsBadge
                            teacherId="teacher-001"
                            teacherUsername="john_smith"
                            eventCount={3}
                            durationMinutes={180}
                            isLoading={false}
                            onClick={() => {}}
                            showCommission={true}
                            commission={{ type: "fixed", cph: "15" }}
                        />
                        <TeacherLessonStatsBadge
                            teacherId="teacher-002"
                            teacherUsername="sarah_lee"
                            eventCount={2}
                            durationMinutes={120}
                            isLoading={false}
                            onClick={() => {}}
                            showCommission={true}
                            commission={{ type: "percentage", cph: "12" }}
                        />
                    </div>
                </div>

                {/* Teacher Commission Badge */}
                <div className="space-y-3 p-4 bg-card rounded-lg border border-border/50">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">Teacher Commission</h3>
                        <p className="text-sm text-muted-foreground">Displays teacher commission rate as fixed amount (currency) or percentage of revenue.</p>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-border/30">
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Fixed Commission</p>
                            <TeacherCommissionBadge value="15" type="fixed" currency="€" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Percentage Commission</p>
                            <TeacherCommissionBadge value="12" type="percentage" />
                        </div>
                    </div>
                </div>

                {/* Student Status Badge */}
                <div className="space-y-3 p-4 bg-card rounded-lg border border-border/50">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">Student Status</h3>
                        <p className="text-sm text-muted-foreground">Shows new students or displays booking count, event count, and total hours for active students.</p>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-border/30">
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">New Student</p>
                            <StudentStatusBadge bookingCount={0} totalEventDuration={0} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Active Student</p>
                            <StudentStatusBadge bookingCount={8} totalEventDuration={450} eventCount={6} allBookingsCompleted={true} />
                        </div>
                    </div>
                </div>

                {/* Teacher Status */}
                <div className="space-y-3 p-4 bg-card rounded-lg border border-border/50">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">Teacher Status</h3>
                        <p className="text-sm text-muted-foreground">Shows teacher statistics including lessons broken down by equipment, duration, and total commissions earned.</p>
                    </div>
                    <div className="pt-2 border-t border-border/30 space-y-3">
                        {/* Top row: Lessons, Duration, Commission */}
                        <div className="flex items-center gap-5">
                            <StatItemUI type="lessons" value={12} iconColor={true} hideLabel={true} />
                            <StatItemUI type="duration" value={720} iconColor={true} hideLabel={true} />
                            <StatItemUI type="commission" value={1850} iconColor={true} hideLabel={true} />
                        </div>

                        {/* Bottom row: Equipment breakdown */}
                        <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                            {[
                                { catId: "kite", count: 5 },
                                { catId: "wing", count: 4 },
                                { catId: "windsurf", count: 3 },
                            ].map(({ catId, count }) => {
                                const config = EQUIPMENT_CATEGORIES.find((c) => c.id === catId);
                                const Icon = config?.icon || Calendar;

                                return (
                                    <div
                                        key={catId}
                                        className="flex items-center gap-1.5"
                                        title={`${config?.label || catId} Lessons`}
                                    >
                                        <span className="text-muted-foreground">
                                            <Icon size={12} />
                                        </span>
                                        <span className="tabular-nums text-xs font-bold text-foreground">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Booking Cards Section */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">Student Booking Views</h3>
                    <p className="text-sm text-muted-foreground">Same booking displayed in two different interfaces - Classboard (teacher-focused) and Student Table (student-focused).</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Classboard Card */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Classboard View</p>
                        <ClassboardProvider>
                            <SchoolTeachersProvider>
                                <StudentBookingCard
                                    bookingData={{
                                        booking: {
                                            id: "booking-001",
                                            dateStart: "2025-01-17",
                                            dateEnd: "2025-01-19",
                                            leaderStudentName: "Alice Johnson",
                                            status: "active",
                                        },
                                        schoolPackage: {
                                            id: "pkg-001",
                                            description: "Beginner Kite Course",
                                            categoryEquipment: "kite",
                                            capacityEquipment: 2,
                                            capacityStudents: 4,
                                            durationMinutes: 480,
                                            pph: 50,
                                        },
                                        lessons: [
                                            {
                                                id: "lesson-001",
                                                teacher: { id: "teacher-001", username: "john_smith" },
                                                commission: { type: "fixed", cph: "15" },
                                                events: [
                                                    { id: "evt-001", duration: 120, status: "completed" },
                                                    { id: "evt-002", duration: 60, status: "planned" },
                                                ],
                                            },
                                        ],
                                        bookingStudents: [
                                            { student: { id: "student-001", firstName: "Alice", lastName: "Johnson" } },
                                            { student: { id: "student-002", firstName: "Bob", lastName: "Wilson" } },
                                        ],
                                    } as ClassboardData}
                                />
                            </SchoolTeachersProvider>
                        </ClassboardProvider>
                    </div>

                    {/* Student Table Card */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Student Table View</p>
                        <StudentBookingActivityCard
                            booking={{
                                id: "booking-001",
                                status: "active",
                                dateStart: "2025-01-17",
                                dateEnd: "2025-01-19",
                                packageName: "Beginner Kite Course",
                                packageDetails: {
                                    categoryEquipment: "kite",
                                    capacityEquipment: 2,
                                    capacityStudents: 4,
                                    durationMinutes: 480,
                                    pph: 50,
                                } as Package,
                                lessons: [
                                    {
                                        id: "lesson-001",
                                        teacherId: "teacher-001",
                                        teacherUsername: "john_smith",
                                        commission: { type: "fixed", cph: "15" },
                                        events: {
                                            totalCount: 2,
                                            totalDuration: 180,
                                        },
                                    },
                                ] as LessonWithPayments[],
                            }}
                            stats={{
                                events: {
                                    revenue: 200,
                                    statusCounts: {
                                        completed: 120,
                                        uncompleted: 0,
                                        planned: 180,
                                        tbc: 120,
                                    },
                                },
                                payments: {
                                    student: 200,
                                    teacher: 150,
                                },
                            } as BookingTableStats}
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Design Principle:</span> Badges use semantic colors and consistent icons to provide instant recognition of status across the platform. Each icon represents a specific data type: students, equipment, duration, pricing, and commissions.
                </p>
            </div>
        </div>
    );
}
