"use client";

import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { ActiveTeacherLessonBadge } from "@/src/components/ui/badge/active-teacher-lesson";
import { TeacherLessonStatsBadge } from "@/src/components/ui/badge/teacher-lesson-stats";
import { TeacherCommissionBadge } from "@/src/components/ui/badge/teacher-commission";
import { TeacherUsernameCommissionBadge } from "@/src/components/ui/badge/teacher-username-commission";
import { EquipmentStudentCommissionBadge } from "@/src/components/ui/badge/equipment-student-commission";
import { BrandSizeCategoryList } from "@/src/components/ui/badge/brand-size-category";
import { StudentStatusBadge } from "@/src/components/ui/badge/student-status";
import { TeacherActiveLesson } from "@/src/components/ui/badge/teacher-active-lesson";
import { SportEquipmentDurationList } from "@/src/components/ui/badge/sport-equipment-duration";
import { CommissionTypeValue } from "@/src/components/ui/badge/commission-type-value";
import { StatItemUI, STAT_TYPE_CONFIG } from "@/backend/data/StatsData";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { ENTITY_DATA } from "@/config/entities";
import { Calendar, Info, Plus } from "lucide-react";
import StudentBookingCard from "@/src/app/(admin)/classboard/StudentBookingCard";
import { StudentBookingActivityCard } from "@/src/app/(admin)/(tables)/students/StudentBookingActivityCard";
import { ClassboardProvider } from "@/src/providers/classboard-provider";
import { SchoolTeachersProvider } from "@/src/providers/school-teachers-provider";
import type { ClassboardData } from "@/backend/classboard/ClassboardModel";
import type { BookingTableStats, Package, LessonWithPayments } from "@/config/tables";
import { AddCommissionForm } from "@/src/components/ui/AddCommissionDropdown";
import { BADGE_STATUS_GREEN, BADGE_ACTION_CYAN, EVENT_STATUS_CONFIG, LESSON_STATUS_CONFIG, BOOKING_STATUS_CONFIG, ACTION_CYAN } from "@/types/status";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";

export default function BadgeShowcase() {
    return (
        <div className="space-y-12 p-8 bg-background rounded-lg border border-border">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Badge System & Status Indicators</h2>
                <div className="flex flex-wrap gap-6 items-center pt-1">
                    <div className="flex items-center gap-2" title="Total Bookings">
                        <BookingIcon size={18} className="text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground uppercase tracking-wide">Booking Count</span>
                    </div>
                    <div className="flex items-center gap-2" title="Lessons Assigned">
                        <LessonIcon size={18} className="text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground uppercase tracking-wide">Lessons Assigned</span>
                    </div>
                    <div className="flex items-center gap-2" title="Total Events">
                        <FlagIcon size={18} className="text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground uppercase tracking-wide">Total Events Count</span>
                    </div>
                    <div className="flex items-center gap-2" title="Total Duration">
                        <DurationIcon size={18} className="text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground uppercase tracking-wide">Total Events Duration</span>
                    </div>
                </div>

                <div className="h-px bg-border/50 my-2" />

                <div className="flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ACTION_CYAN }} />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active (Neon)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EVENT_STATUS_CONFIG.tbc.color }} />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">To Be Confirmed (Purple)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EVENT_STATUS_CONFIG.planned.color }} />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Planned (Grey)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EVENT_STATUS_CONFIG.completed.color }} />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Completed (Green)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EVENT_STATUS_CONFIG.uncompleted.color }} />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Uncompleted (Orange)</span>
                    </div>
                </div>
            </div>

            {/* 1. User Status Badges */}
            <div className="space-y-6">
                <div className="border-b border-border/50 pb-4">
                    <h3 className="text-xl font-bold text-foreground">User Activity Indicators</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Student Status Examples */}
                    <div className="space-y-4 p-5 bg-card rounded-xl border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-400">
                                <HelmetIcon size={18} />
                            </div>
                            <h3 className="font-semibold text-foreground">Student Badges</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm font-medium">New Student</span>
                                <StudentStatusBadge bookingCount={0} totalEventDuration={0} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm font-medium">Active (In Progress)</span>
                                <StudentStatusBadge 
                                    bookingCount={1} 
                                    totalEventDuration={120} 
                                    eventCount={2} 
                                    allBookingsCompleted={false} 
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm font-medium">Completed</span>
                                <StudentStatusBadge 
                                    bookingCount={5} 
                                    totalEventDuration={600} 
                                    eventCount={10} 
                                    allBookingsCompleted={true} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Teacher Status Examples */}
                    <div className="space-y-4 p-5 bg-card rounded-xl border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <HeadsetIcon size={18} />
                            </div>
                            <h3 className="font-semibold text-foreground">Teacher Badges</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm font-medium">No Lessons</span>
                                <TeacherActiveLesson totalLessons={0} completedLessons={0} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm font-medium">Ongoing (2/5 Done)</span>
                                <TeacherActiveLesson totalLessons={5} completedLessons={2} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm font-medium">All Completed</span>
                                <TeacherActiveLesson totalLessons={8} completedLessons={8} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Full Table Row Previews */}
            <div className="space-y-8">
                <div className="border-b border-border/50 pb-4">
                    <h3 className="text-xl font-bold text-foreground">Table Data Previews</h3>
                </div>

                <div className="space-y-10">
                    {/* Teacher Table Row Example */}
                    <div className="space-y-3">
                        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                            {/* Table Headers */}
                            <div className="hidden xl:grid grid-cols-[1.2fr_1fr_2fr_1fr] bg-muted/30 border-b border-border/50 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                                <div className="px-4 py-3">Teacher Profile</div>
                                <div className="px-4 py-3">Equipment</div>
                                <div className="px-4 py-3">Lessons</div>
                                <div className="px-4 py-3 text-center">Status</div>
                            </div>
                            
                            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr_2fr_1fr] divide-y xl:divide-y-0 xl:divide-x divide-border/50 items-center">
                                {/* Profile */}
                                <div className="p-4 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <HeadsetIcon size={16} className="text-emerald-500" />
                                        <span className="font-bold text-sm">Alex</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-tight">
                                        <span className="flex items-center gap-1">🇪🇸 SPAIN</span>
                                        <span className="opacity-20">|</span>
                                        <span>EN, ES, FR</span>
                                    </div>
                                </div>
                                
                                {/* Equipment */}
                                <div className="p-4">
                                    <BrandSizeCategoryList
                                        equipments={[
                                            { id: "e1", model: "Rebel", size: 12, categoryId: "kite" },
                                            { id: "e2", model: "Dice", size: 9, categoryId: "kite" },
                                        ]}
                                        showIcon={true}
                                    />
                                </div>

                                {/* Lessons Column */}
                                <div className="p-4 space-y-3">
                                    <div className="flex flex-wrap gap-1.5 pb-2 border-b border-border/40">
                                        <ActiveTeacherLessonBadge
                                            bookingId="b1"
                                            category="kite"
                                            leaderName="Alice Johnson"
                                            capacity={4}
                                            status="active"
                                            commission={{ type: "fixed", cph: "25" }}
                                        />
                                    </div>
                                    <SportEquipmentDurationList
                                        stats={{
                                            kite: { count: 5, durationMinutes: 300 },
                                            wing: { count: 2, durationMinutes: 120 },
                                        }}
                                    />
                                </div>

                                {/* Status Column */}
                                <div className="p-4 flex items-center gap-5 justify-center">
                                    <StatItemUI type="lessons" value={7} iconColor={true} hideLabel={true} />
                                    <StatItemUI type="duration" value={420} iconColor={true} hideLabel={true} />
                                    <StatItemUI type="commission" value={175} iconColor={true} hideLabel={true} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Student Table Row Example */}
                    <div className="space-y-3">
                        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                            {/* Table Headers */}
                            <div className="hidden xl:grid grid-cols-[1.2fr_2fr_1fr] bg-muted/30 border-b border-border/50 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                                <div className="px-4 py-3">Student Profile</div>
                                <div className="px-4 py-3">Bookings & Progress</div>
                                <div className="px-4 py-3 text-center">Status</div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_2fr_1fr] divide-y xl:divide-y-0 xl:divide-x divide-border/50 items-center">
                                {/* Profile */}
                                <div className="p-4 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="text-yellow-500">
                                            <HelmetIcon size={16} />
                                        </div>
                                        <span className="font-bold text-sm">Alice Johnson</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-tight">
                                        <span className="flex items-center gap-1">🇬🇧 UK</span>
                                        <span className="opacity-20">|</span>
                                        <span>EN, DE</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground/60 italic line-clamp-1 leading-relaxed">Intermediate level, looking to improve jumps.</p>
                                </div>

                                {/* Bookings Column */}
                                <div className="p-4">
                                    <StudentBookingActivityCard
                                        booking={{
                                            id: "b-001",
                                            status: "active",
                                            dateStart: "2025-01-17",
                                            dateEnd: "2025-01-21",
                                            packageName: "Advanced Kite Course",
                                            packageDetails: {
                                                categoryEquipment: "kite",
                                                capacityEquipment: 2,
                                                capacityStudents: 4,
                                                durationMinutes: 600,
                                                pph: 60,
                                            } as any,
                                            lessons: []
                                        }}
                                        stats={{
                                            events: {
                                                revenue: 600,
                                                statusCounts: { completed: 120, uncompleted: 0, planned: 120, tbc: 360 }
                                            },
                                            payments: { student: 350, teacher: 100 }
                                        } as any}
                                    />
                                </div>

                                {/* Status Column */}
                                <div className="p-4 flex justify-center">
                                    <StudentStatusBadge
                                        bookingCount={1}
                                        totalEventDuration={600}
                                        allBookingsCompleted={false}
                                        eventCount={3}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Teacher Commissions */}
            <div className="space-y-6">
                <div className="border-b border-border/50 pb-4">
                    <h3 className="text-xl font-bold text-foreground">Teacher Commissions</h3>
                </div>

                <div className="p-6 bg-card rounded-xl border border-border space-y-6">
                    {/* Commissions Header & Filter Simulation */}
                    <div className="flex items-center justify-between pb-4 border-b border-border/50">
                        <div className="flex items-center gap-2">
                            <HandshakeIcon size={18} className="text-muted-foreground" />
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Instructor Commissions</div>
                        </div>
                        <div className="flex items-center border border-border rounded-lg overflow-hidden bg-muted/20">
                            <button className="px-3 py-1.5 text-[10px] font-black uppercase bg-muted text-foreground">All</button>
                            <button className="px-3 py-1.5 text-[10px] font-black uppercase text-muted-foreground hover:bg-muted/40 border-l border-border">Fixed</button>
                            <button className="px-3 py-1.5 text-[10px] font-black uppercase text-muted-foreground hover:bg-muted/40 border-l border-border">%</button>
                            <button className="px-3 py-1.5 text-[10px] font-black uppercase text-muted-foreground hover:bg-muted/40 border-l border-border flex items-center gap-1">
                                <Plus size={10} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* List of active commissions */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Assigned Rates</p>
                            <div className="flex flex-wrap gap-2">
                                <CommissionTypeValue value={25} type="fixed" description="Standard Rate" isSelected={true} as="div" />
                                <CommissionTypeValue value={15} type="percentage" description="Senior Share" as="div" />
                                <CommissionTypeValue value={30} type="fixed" description="Private Lesson" as="div" />
                            </div>
                        </div>

                        {/* Add Commission Form Preview */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">New Rate Template</p>
                            <div className="scale-95 origin-top-left opacity-80 pointer-events-none">
                                <AddCommissionForm teacherId="demo" currency="€" onAdd={() => {}} />
                            </div>
                        </div>
                    </div>

                    {/* Commission Badge Examples */}
                    <div className="pt-6 border-t border-border/50">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Commission Visualization Styles</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <p className="text-[10px] text-muted-foreground font-bold">Teacher with Comission</p>
                                <TeacherUsernameCommissionBadge
                                    teacherIcon={ENTITY_DATA.find((e) => e.id === "teacher")?.icon!}
                                    teacherUsername="Alex"
                                    teacherColor={ENTITY_DATA.find((e) => e.id === "teacher")?.color!}
                                    commissionValue="25"
                                    commissionType="fixed"
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] text-muted-foreground font-bold">Teacher Lesson Summary</p>
                                <TeacherLessonStatsBadge
                                    teacherId="t1"
                                    teacherUsername="Alex"
                                    eventCount={3}
                                    durationMinutes={180}
                                    showCommission={true}
                                    commission={{ type: "fixed", cph: "25" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Booking Contexts & Equipment */}
            <div className="space-y-6">
                <div className="border-b border-border/50 pb-4">
                    <h3 className="text-xl font-bold text-foreground">Data Integritiy Throughout the Application</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Classboard Card */}
                    <div className="space-y-2">
                     
                        <ClassboardProvider>
                            <SchoolTeachersProvider>
                                <StudentBookingCard
                                    bookingData={{
                                        booking: {
                                            id: "booking-001",
                                            dateStart: "2025-01-17",
                                            dateEnd: "2025-01-21",
                                            leaderStudentName: "Alice Johnson",
                                            status: "active",
                                        },
                                        schoolPackage: {
                                            id: "pkg-001",
                                            description: "Advanced Kite Course",
                                            categoryEquipment: "kite",
                                            capacityEquipment: 2,
                                            capacityStudents: 4,
                                            durationMinutes: 600,
                                            pph: 60,
                                            pricePerStudent: 600,
                                        },
                                        lessons: [
                                            {
                                                id: "lesson-001",
                                                teacher: { id: "teacher-001", username: "Alex" },
                                                commission: { type: "fixed", cph: "25" },
                                                events: [
                                                    { id: "evt-001", duration: 120, status: "completed" },
                                                    { id: "evt-002", duration: 120, status: "planned" },
                                                    { id: "evt-003", duration: 360, status: "tbc" },
                                                ],
                                            },
                                        ],
                                        bookingStudents: [
                                            { student: { id: "student-001", firstName: "Alice", lastName: "Johnson" } },
                                            { student: { id: "student-002", firstName: "Bob", lastName: "Wilson" } },
                                            { student: { id: "student-003", firstName: "Charlie", lastName: "Brown" } },
                                            { student: { id: "student-004", firstName: "David", lastName: "Miller" } },
                                        ],
                                    } as ClassboardData}
                                />
                            </SchoolTeachersProvider>
                        </ClassboardProvider>
                    </div>

                    {/* Student Table Card */}
                    <div className="space-y-2">
                        <StudentBookingActivityCard
                            booking={{
                                id: "booking-001",
                                status: "active",
                                dateStart: "2025-01-17",
                                dateEnd: "2025-01-21",
                                packageName: "Advanced Kite Course",
                                packageDetails: {
                                    categoryEquipment: "kite",
                                    capacityEquipment: 2,
                                    capacityStudents: 4,
                                    durationMinutes: 600,
                                    pph: 60,
                                } as Package,
                                lessons: [
                                    {
                                        id: "lesson-001",
                                        teacherId: "teacher-001",
                                        teacherUsername: "Alex",
                                        commission: { type: "fixed", cph: "25" },
                                        events: {
                                            totalCount: 3,
                                            totalDuration: 600,
                                        },
                                    },
                                ] as LessonWithPayments[],
                            }}
                            stats={{
                                events: {
                                    revenue: 600,
                                    statusCounts: {
                                        completed: 120,
                                        uncompleted: 0,
                                        planned: 120,
                                        tbc: 360,
                                    },
                                },
                                payments: {
                                    student: 350,
                                    teacher: 100,
                                },
                            } as BookingTableStats}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}
