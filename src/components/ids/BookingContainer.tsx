"use client";

import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { Menu } from "@headlessui/react";
import type { BookingModel } from "@/backend/models";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { getBookingProgressBar } from "@/getters/booking-progress-getter";
import { getBookingDays } from "@/getters/bookings-getter";
import { getPackageRevenue } from "@/getters/school-packages-getter";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { getEventStatusColor, getEventStatusLabel } from "@/types/status";
import { getTeacherLessonCommission } from "@/getters/teacher-commission-getter";
import type { SchoolPackageType } from "@/drizzle/schema";
import type { ClassboardLesson } from "@/backend/models/ClassboardModel";

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
    students: Array<{ id: string; firstName: string; lastName: string }>;
    capacity: number;
}

function StudentList({ students, capacity }: StudentListProps) {
    const router = useRouter();
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const StudentIcon = studentEntity?.icon;

    if (!StudentIcon || students.length === 0) {
        return null;
    }

    if (students.length === 1) {
        return (
            <Menu as="div" className="relative inline-block">
                <Menu.Button
                    onClick={() => console.log("DEV: Menu button clicked - 1 student")}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                    <div style={{ color: studentEntity.color }}>
                        <StudentIcon size={ICON_SIZE} />
                    </div>
                </Menu.Button>
                <Menu.Items className="absolute left-0 top-full mt-2 w-48 origin-top-left bg-background dark:bg-card border border-border rounded-lg shadow-lg focus:outline-none z-50">
                    <div className="p-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => {
                                        console.log("DEV: Clicked student:", students[0].firstName);
                                        router.push(`/students/${students[0].id}`);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${active ? "bg-muted/50 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                                >
                                    {students[0].firstName} {students[0].lastName}
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Menu>
        );
    }

    return (
        <Menu as="div" className="relative inline-block">
            <Menu.Button
                onClick={() => console.log("DEV: Menu button clicked - multiple students", students)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
                <div style={{ color: studentEntity.color }}>
                    <StudentIcon size={ICON_SIZE} />
                </div>
                {students.length > 2 ? <span className="text-xs font-semibold text-foreground">+{students.length}</span> : <span className="text-xs font-semibold text-foreground">{students.length}</span>}
            </Menu.Button>
            <Menu.Items className="absolute left-0 top-full mt-2 w-48 origin-top-left bg-background dark:bg-card border border-border rounded-lg shadow-lg focus:outline-none z-50">
                <div className="p-1">
                    {console.log("DEV: Rendering Menu.Items with students:", students)}
                    {students.map((student) => (
                        <Menu.Item key={student.id}>
                            {({ active }) => (
                                <button
                                    onClick={() => {
                                        console.log("DEV: Clicked student:", student.firstName);
                                        router.push(`/students/${student.id}`);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${active ? "bg-muted/50 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                                >
                                    {student.firstName} {student.lastName}
                                </button>
                            )}
                        </Menu.Item>
                    ))}
                </div>
            </Menu.Items>
        </Menu>
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

function PackageInfo({ durationMinutes, pricePerStudent, packageDescription, packageId, totalHours, capacityStudents }: PackageInfoProps) {
    const router = useRouter();
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");
    const packageDurationHours = Math.round(durationMinutes / 60);
    const revenue = getPackageRevenue(packageDurationHours, capacityStudents, pricePerStudent);

    return (
        <Menu as="div" className="relative inline-block">
            <Menu.Button
                onClick={() => console.log("DEV: Package menu clicked")}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
                <div style={{ color: packageEntity?.color }}>
                    <PackageIcon size={ICON_SIZE} />
                </div>
                <span className="text-xs font-semibold text-foreground">{Math.round(durationMinutes / 60)}h</span>
                <span className="text-xs font-semibold text-muted-foreground">/</span>
                <span className="text-xs font-semibold text-foreground">{pricePerStudent}€</span>
            </Menu.Button>
            <Menu.Items className="absolute left-0 top-full mt-2 w-48 origin-top-left bg-background dark:bg-card border border-border rounded-lg shadow-lg focus:outline-none z-50">
                <div className="p-1">
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => {
                                    console.log("DEV: Clicked package:", packageDescription);
                                    router.push(`/packages/${packageId}`);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${active ? "bg-muted/50 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                            >
                                <div>{packageDescription}</div>
                                <div className="text-xs text-foreground mt-2 pt-2 border-t border-border">{packageDurationHours}h + {capacityStudents} * {pricePerStudent}€ = <span className="font-semibold">{revenue}€</span></div>
                            </button>
                        )}
                    </Menu.Item>
                </div>
            </Menu.Items>
        </Menu>
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
    students: Array<{ id: string; firstName: string }>;
    durationMinutes: number;
    pricePerStudent: number;
    packageDescription: string;
    packageId: string;
    totalHours: number;
    referralCode?: string;
}

function BookingInfoCapacity({ bookingDays, bookingId, equipmentCategory, capacityEquipment, capacityStudents, students, durationMinutes, pricePerStudent, packageDescription, packageId, totalHours, referralCode }: BookingInfoCapacityProps) {
    return (
        <div className="flex items-center gap-6 overflow-visible">
            <BookingDays days={bookingDays} bookingId={bookingId} />
            <StudentList students={students} capacity={capacityStudents} />
            <EquipmentCapacity category={equipmentCategory} capacity={capacityEquipment} />
            <PackageInfo durationMinutes={durationMinutes} pricePerStudent={pricePerStudent} packageDescription={packageDescription} packageId={packageId} totalHours={totalHours} capacityStudents={capacityStudents} />
            {referralCode && <ReferralCode code={referralCode} />}
        </div>
    );
}

interface LessonRowProps {
    lessons: ClassboardLesson[];
    schoolPackage: SchoolPackageType;
}

function LessonRow({ lessons, schoolPackage }: LessonRowProps) {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
    const TeacherIcon = teacherEntity?.icon;

    if (!teacherEntity || lessons.length === 0) return null;

    return (
        <div className="space-y-4">
            {lessons.map((lesson) => {
                const commission = getTeacherLessonCommission(lesson.events || [], lesson.commission, schoolPackage.pricePerStudent, schoolPackage.durationMinutes);

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
                                <span className="text-xs text-muted-foreground capitalize">{lesson.status}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {commission.commissionRate} × {commission.hours} = {commission.earned}
                            </span>
                        </div>
                        {lesson.events && lesson.events.length > 0 && (
                            <div className="space-y-1 pl-6">
                                {lesson.events.map((event) => {
                                    const statusColor = getEventStatusColor(event.status);
                                    const statusLabel = getEventStatusLabel(event.status);
                                    const eventDate = new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                    const eventTime = new Date(event.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                                    const hours = Math.floor(event.duration / 60);
                                    const mins = event.duration % 60;
                                    const durationText = mins > 0 ? `${hours}:${mins.toString().padStart(2, "0")}` : `${hours}h`;

                                    return (
                                        <div key={event.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <div style={{ color: statusColor }}>
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

    const progressBar = getBookingProgressBar(lessons, schoolPackage.durationMinutes);

    const totalMinutesUsed = lessons.reduce((sum, lesson) => {
        const lessonMinutes = lesson.events?.reduce((acc, event) => acc + (event.duration || 0), 0) || 0;
        return sum + lessonMinutes;
    }, 0);
    const totalHours = Math.round(totalMinutesUsed / 60);

    const bookingDays = getBookingDays(booking);

    const students = booking.relations?.bookingStudents?.map((bs: any) => ({
        id: bs.student.id,
        firstName: bs.student.firstName,
        lastName: bs.student.lastName,
    })) || [];

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: BookingContainer students =", students);
        console.log("DEV:JSON: BookingContainer bookingStudents =", booking.relations?.bookingStudents);
    }

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
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
                    <div className="flex items-center gap-2">
                        <DurationIcon size={ICON_SIZE} />
                        <span className="text-sm font-semibold text-foreground">{totalHours}h</span>
                        {totalHours > Math.round(schoolPackage.durationMinutes / 60) && (
                            <span className="text-xs font-semibold text-foreground">(+{totalHours - Math.round(schoolPackage.durationMinutes / 60)}h)</span>
                        )}
                    </div>
                </div>
                {lessons.length > 0 && <LessonRow lessons={lessons} schoolPackage={schoolPackage} />}
            </div>
            <BookingFooter
                onReceiptClick={onReceiptClick}
                onAddStudentPayment={onAddStudentPayment}
                onAddTeacherPayment={onAddTeacherPayment}
            />
        </div>
    );
}
