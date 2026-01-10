"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { User } from "lucide-react";
import type { BookingModel } from "@/backend/models";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { getEventStatusCounts, getProgressColor } from "@/getters/booking-progress-getter";
import { getBookingDays } from "@/getters/bookings-getter";
import { getPackageRevenue } from "@/getters/school-packages-getter";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import DurationExpenseIcon from "@/public/appSvgs/DurationExpenseIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { EVENT_STATUS_CONFIG, LESSON_STATUS_CONFIG, type LessonStatus } from "@/types/status";
import { calculateCommission, calculateLessonRevenue, type CommissionInfo } from "@/getters/commission-calculator";
import type { SchoolPackageType } from "@/drizzle/schema";
import type { ClassboardLesson } from "@/backend/classboard/ClassboardModel";
import { Dropdown, DropdownLabel, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { updateLesson } from "@/supabase/server/lessons";

const ICON_SIZE = 20;

interface IconCountCapacityProps {
    icon: React.ReactNode;
    count: number;
    color: string;
}

function IconCountCapacity({ icon, count, color }: IconCountCapacityProps) {
    if (count === 1) {
        return <div style={{ color }}>{icon}</div>;
    }

    if (count > 2) {
        return (
            <div className="flex items-center gap-2">
                <div style={{ color }}>{icon}</div>
                <span className="text-xs font-semibold text-foreground">+{count}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <div style={{ color }}>{icon}</div>
            <span className="text-xs font-semibold text-foreground">{count}</span>
        </div>
    );
}

interface EquipmentCapacityProps {
    category: string;
    capacity: number;
}

function EquipmentCapacity({ category, capacity }: EquipmentCapacityProps) {
    const equipConfig = EQUIPMENT_CATEGORIES.find((e) => e.id === category);
    const Icon = equipConfig?.icon;

    if (!Icon) return null;

    return <IconCountCapacity icon={<Icon size={ICON_SIZE} />} count={capacity} color={equipConfig.color} />;
}

interface StudentCapacityProps {
    capacity: number;
}

function StudentCapacity({ capacity }: StudentCapacityProps) {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const StudentIcon = studentEntity?.icon;

    if (!StudentIcon) return null;

    return <IconCountCapacity icon={<StudentIcon size={ICON_SIZE} />} count={capacity} color={studentEntity.color} />;
}

interface StudentListProps {
    students: { id: string; firstName: string; lastName: string }[];
    capacity: number;
}

function StudentList({ students, capacity }: StudentListProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const StudentIcon = studentEntity?.icon;

    if (!StudentIcon || students.length === 0) {
        return null;
    }

    const dropdownItems: DropdownItemProps[] = students.map((student) => ({
        id: student.id,
        label: `${student.firstName} ${student.lastName}`,
        icon: StudentIcon,
        color: studentEntity.color,
        href: `/students/${student.id}`,
    }));

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
                <div style={{ color: studentEntity.color }}>
                    <StudentIcon size={ICON_SIZE} />
                </div>
                {students.length > 1 &&
                    (students.length > 2 ? (
                        <span className="text-xs font-semibold text-foreground">+{students.length}</span>
                    ) : (
                        <span className="text-xs font-semibold text-foreground">{students.length}</span>
                    ))}
            </button>
            <Dropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} items={dropdownItems} align="left" />
        </div>
    );
}

interface BookingDaysProps {
    days: number;
    bookingId: string;
}

function BookingDays({ days, bookingId }: BookingDaysProps) {
    const router = useRouter();
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking");
    const BookingIcon = bookingEntity?.icon;

    if (!BookingIcon) return null;

    if (days === 1) {
        return (
            <button
                onClick={() => router.push(`/bookings/${bookingId}`)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
                <div style={{ color: bookingEntity.color }}>
                    <BookingIcon size={ICON_SIZE} />
                </div>
            </button>
        );
    }

    return (
        <button
            onClick={() => router.push(`/bookings/${bookingId}`)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
            <div style={{ color: bookingEntity.color }}>
                <BookingIcon size={ICON_SIZE} />
            </div>
            <span className="text-xs font-semibold text-foreground">+{days}</span>
        </button>
    );
}

interface PackageInfoProps {
    durationMinutes: number;
    pricePerStudent: number;
    packageDescription: string;
    packageId: string;
    totalHours: number;
    capacityStudents: number;
}

function PackageInfo({
    durationMinutes,
    pricePerStudent,
    packageDescription,
    packageId,
    totalHours,
    capacityStudents,
}: PackageInfoProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");
    const packageDurationHours = Math.round(durationMinutes / 60);
    const revenue = getPackageRevenue(packageDurationHours, capacityStudents, pricePerStudent);

    const dropdownItems: DropdownItemProps[] = [
        {
            id: packageId,
            label: packageDescription,
            icon: PackageIcon,
            color: packageEntity?.color,
            href: `/packages/${packageId}`,
            description: `${packageDurationHours}h + ${capacityStudents} * ${pricePerStudent}€ = ${revenue}€`,
        },
    ];

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
                <div style={{ color: packageEntity?.color }}>
                    <PackageIcon size={ICON_SIZE} />
                </div>
                <span className="text-xs font-semibold text-foreground">{Math.round(durationMinutes / 60)}h</span>
                <span className="text-xs font-semibold text-muted-foreground">/</span>
                <span className="text-xs font-semibold text-foreground">{pricePerStudent}€</span>
            </button>
            <Dropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} items={dropdownItems} align="left" />
        </div>
    );
}

interface DurationExpenseProps {
    totalHours: number;
    packageDurationMinutes: number;
    pricePerStudent: number;
    capacityStudents: number;
}

function DurationExpense({ totalHours, packageDurationMinutes, pricePerStudent, capacityStudents }: DurationExpenseProps) {
    const packageHours = Math.round(packageDurationMinutes / 60);
    const hourDifference = totalHours - packageHours;
    const totalToPay = pricePerStudent * capacityStudents;

    return (
        <div className="flex items-center gap-2">
            <DurationExpenseIcon size={ICON_SIZE} />
            <span className="text-sm font-semibold text-foreground">{`${totalHours}h`}</span>
            {hourDifference !== 0 && (
                <span className="text-xs font-semibold text-muted-foreground">{`(${hourDifference > 0 ? "+" : ""}${hourDifference}h)`}</span>
            )}
            <span className="text-sm font-semibold text-foreground">=</span>
            <span className="text-sm font-semibold text-foreground">{`${pricePerStudent}€`}</span>
            {capacityStudents > 1 && (
                <span className="text-xs font-semibold text-muted-foreground">{`(all to pay: ${totalToPay}€)`}</span>
            )}
        </div>
    );
}

interface ReferralCodeProps {
    code: string;
}

function ReferralCode({ code }: ReferralCodeProps) {
    return (
        <div className="flex items-center gap-2">
            <User size={ICON_SIZE} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">{code}</span>
        </div>
    );
}

interface BookingInfoCapacityProps {
    bookingDays: number;
    bookingId: string;
    equipmentCategory: string;
    capacityEquipment: number;
    capacityStudents: number;
    students: { id: string; firstName: string }[];
    durationMinutes: number;
    pricePerStudent: number;
    packageDescription: string;
    packageId: string;
    totalHours: number;
    referralCode?: string;
}

function BookingInfoCapacity({
    bookingDays,
    bookingId,
    equipmentCategory,
    capacityEquipment,
    capacityStudents,
    students,
    durationMinutes,
    pricePerStudent,
    packageDescription,
    packageId,
    totalHours,
    referralCode,
}: BookingInfoCapacityProps) {
    return (
        <div className="flex items-center gap-6 overflow-visible">
            <BookingDays days={bookingDays} bookingId={bookingId} />
            <StudentList students={students} capacity={capacityStudents} />
            <EquipmentCapacity category={equipmentCategory} capacity={capacityEquipment} />
            <PackageInfo
                durationMinutes={durationMinutes}
                pricePerStudent={pricePerStudent}
                packageDescription={packageDescription}
                packageId={packageId}
                totalHours={totalHours}
                capacityStudents={capacityStudents}
            />
            {referralCode && <ReferralCode code={referralCode} />}
        </div>
    );
}

interface LessonRowProps {
    lessons: ClassboardLesson[];
    schoolPackage: SchoolPackageType;
    studentCount: number;
}

function LessonRow({ lessons, schoolPackage, studentCount }: LessonRowProps) {
    const router = useRouter();
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
    const TeacherIcon = teacherEntity?.icon;

    if (!teacherEntity || lessons.length === 0) return null;

    const handleLessonStatusUpdate = async (lessonId: string, status: LessonStatus) => {
        try {
            const result = await updateLesson(lessonId, { status });
            if (result.success) {
                router.refresh();
            } else {
                console.error("Failed to update lesson status:", result.error);
            }
        } catch (error) {
            console.error("Error updating lesson status:", error);
        }
    };

    return (
        <div className="space-y-4">
            {lessons.map((lesson) => {
                const events = lesson.events || [];
                const lessonDurationMinutes = events.reduce((sum, event) => sum + (event.duration || 0), 0);

                const lessonRevenue = calculateLessonRevenue(
                    schoolPackage.pricePerStudent,
                    studentCount,
                    lessonDurationMinutes,
                    schoolPackage.durationMinutes,
                );

                const commissionInfo: CommissionInfo = {
                    type: (lesson.commission?.commissionType as "fixed" | "percentage") || "fixed",
                    cph: parseFloat(lesson.commission?.cph || "0"),
                };

                const commission = calculateCommission(
                    lessonDurationMinutes,
                    commissionInfo,
                    lessonRevenue,
                    schoolPackage.durationMinutes,
                );

                const lessonStatusItems: DropdownItemProps[] = (["active", "rest", "completed", "uncompleted"] as const).map(
                    (status) => ({
                        id: status,
                        label: LESSON_STATUS_CONFIG[status].label,
                        icon: () => (
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: LESSON_STATUS_CONFIG[status].color }} />
                        ),
                        color: LESSON_STATUS_CONFIG[status].color,
                        onClick: () => handleLessonStatusUpdate(lesson.id, status),
                    }),
                );

                return (
                    <div key={lesson.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <HoverToEntity entity={teacherEntity} id={lesson.teacher.username}>
                                    <div className="flex items-center gap-2">
                                        {TeacherIcon && (
                                            <div style={{ color: teacherEntity.color, display: "flex", alignItems: "center" }}>
                                                <TeacherIcon size={ICON_SIZE} />
                                            </div>
                                        )}
                                        <span className="text-sm font-medium">{lesson.teacher.username}</span>
                                    </div>
                                </HoverToEntity>
                                <DropdownLabel
                                    value={lesson.status}
                                    items={lessonStatusItems}
                                    color={LESSON_STATUS_CONFIG[lesson.status].color}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {commission.commissionRate} × {commission.hours} = {commission.earnedDisplay}
                            </span>
                        </div>
                        {lesson.events && lesson.events.length > 0 && (
                            <div className="space-y-1 pl-6">
                                {lesson.events.map((event) => {
                                    const eventDate = new Date(event.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    });
                                    const eventTime = new Date(event.date).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    });
                                    const hours = Math.floor(event.duration / 60);
                                    const mins = event.duration % 60;
                                    const durationText = mins > 0 ? `${hours}:${mins.toString().padStart(2, "0")}` : `${hours}h`;

                                    return (
                                        <div key={event.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <div style={{ color: EVENT_STATUS_CONFIG[event.status].color }}>
                                                <FlagIcon size={12} />
                                            </div>
                                            <span className="font-semibold">{durationText}</span>
                                            <span>•</span>
                                            <span>
                                                {eventDate} at {eventTime}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

interface BookingProgressProps {
    background: string;
}

function BookingProgress({ background }: BookingProgressProps) {
    return <div className="h-2 w-full" style={{ background }} />;
}

interface BookingFooterProps {
    onReceiptClick: () => void;
    onAddStudentPayment: () => void;
    onAddTeacherPayment: () => void;
}

function BookingFooter({ onReceiptClick, onAddStudentPayment, onAddTeacherPayment }: BookingFooterProps) {
    return (
        <div className="bg-footer p-4 flex items-center justify-between gap-2 border-t border-border">
            <button
                onClick={onReceiptClick}
                className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded transition-colors"
            >
                Receipt
            </button>
            <div className="flex items-center gap-2">
                <button
                    onClick={onAddStudentPayment}
                    className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors"
                >
                    Add Student Payment
                </button>
                <button
                    onClick={onAddTeacherPayment}
                    className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors"
                >
                    Add Teacher Payment
                </button>
            </div>
        </div>
    );
}

interface BookingContainerProps {
    booking: BookingModel;
    onReceiptClick?: () => void;
    onAddStudentPayment?: () => void;
    onAddTeacherPayment?: () => void;
}

export function BookingContainer({
    booking,
    onReceiptClick = () => {},
    onAddStudentPayment = () => {},
    onAddTeacherPayment = () => {},
}: BookingContainerProps) {
    const lessons = booking.relations?.lessons || [];
    const schoolPackage = booking.relations?.studentPackage?.schoolPackage;

    if (!schoolPackage) {
        return <div className="p-4 text-destructive">Error: School package not found</div>;
    }

    const bookingEvents = lessons.flatMap((lesson) => lesson.events || []);
    const counts = getEventStatusCounts(bookingEvents as any);
    const progressBar = { background: getProgressColor(counts, schoolPackage.durationMinutes) };

    const totalMinutesUsed = lessons.reduce((sum, lesson) => {
        const lessonMinutes = lesson.events?.reduce((acc, event) => acc + (event.duration || 0), 0) || 0;
        return sum + lessonMinutes;
    }, 0);
    const totalHours = Math.round(totalMinutesUsed / 60);

    const bookingDays = getBookingDays(booking);

    const students =
        booking.relations?.bookingStudents?.map((bs: any) => ({
            id: bs.student.id,
            firstName: bs.student.firstName,
            lastName: bs.student.lastName,
        })) || [];

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: BookingContainer students =", students);
        console.log("DEV:JSON: BookingContainer bookingStudents =", booking.relations?.bookingStudents);
    }

    return (
        <div className="bg-card border border-border rounded-lg overflow-visible">
            <BookingProgress background={progressBar.background} />
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-6 pb-4 border-b border-blue-500">
                    <BookingInfoCapacity
                        bookingDays={bookingDays}
                        bookingId={booking.schema.id}
                        equipmentCategory={schoolPackage.categoryEquipment}
                        capacityEquipment={schoolPackage.capacityEquipment}
                        capacityStudents={schoolPackage.capacityStudents}
                        students={students}
                        durationMinutes={schoolPackage.durationMinutes}
                        pricePerStudent={schoolPackage.pricePerStudent}
                        packageDescription={schoolPackage.description}
                        packageId={schoolPackage.id}
                        totalHours={totalHours}
                        referralCode={booking.relations?.studentPackage?.relations?.referral?.code}
                    />
                    <DurationExpense
                        totalHours={totalHours}
                        packageDurationMinutes={schoolPackage.durationMinutes}
                        pricePerStudent={schoolPackage.pricePerStudent}
                        capacityStudents={schoolPackage.capacityStudents}
                    />
                </div>
                {lessons.length > 0 && <LessonRow lessons={lessons} schoolPackage={schoolPackage} studentCount={students.length} />}
            </div>
            <BookingFooter
                onReceiptClick={onReceiptClick}
                onAddStudentPayment={onAddStudentPayment}
                onAddTeacherPayment={onAddTeacherPayment}
            />
        </div>
    );
}
