"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { MoreVertical, Receipt } from "lucide-react";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { CardList } from "@/src/components/ui/card/card-list";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { getBookingProgressBar } from "@/getters/booking-progress-getter";
import { getPackageInfo } from "@/getters/school-packages-getter";
import { getFullDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import type { ClassboardData, ClassboardLesson } from "@/backend/models/ClassboardModel";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";

// --- Sub-components ---

const BookingProgressBar = ({ lessons, durationMinutes }: { lessons: ClassboardLesson[]; durationMinutes: number }) => {
    const progressStyle = getBookingProgressBar(lessons, durationMinutes);
    return (
        <div className="h-1.5 w-full bg-muted">
            <div className="h-full transition-all duration-500 ease-out" style={{ ...progressStyle }} />
        </div>
    );
};

const CardHeader = ({
    bookingId,
    dateStart,
    dateEnd,
    selectedDate,
    leaderName,
    studentCount,
    students,
    studentColor,
    onExpand,
}: {
    bookingId: string;
    dateStart: string;
    dateEnd: string;
    selectedDate: string;
    leaderName: string;
    studentCount: number;
    students: { id: string; firstName: string; lastName: string }[];
    studentColor: string;
    onExpand: () => void;
}) => {
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
    const studentTriggerRef = useRef<HTMLButtonElement>(null);

    const startDate = new Date(dateStart + "T00:00:00");
    const endDate = new Date(dateEnd + "T00:00:00");
    const selected = new Date(selectedDate + "T00:00:00");

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = Math.ceil((selected.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const ratioText = totalDays === 1 ? "" : `${currentDay}/${totalDays} Days`;
    let statusText = totalDays === 1 ? "Single Day Booking" : "";
    let statusStyle = "text-muted-foreground";

    if (totalDays > 1) {
        if (currentDay === totalDays) {
            statusText = "Checking out";
            statusStyle = "text-blue-500/50 font-semibold";
        } else if (currentDay > totalDays) {
            statusText = "Ended";
            statusStyle = "text-red-500/50";
        }
    }

    const studentDropdownItems: DropdownItemProps[] = students.map((bs, index) => ({
        id: bs.id || index,
        label: `${bs.firstName} ${bs.lastName}`,
        icon: HelmetIcon,
        color: studentColor,
    }));

    return (
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <Link href={`/bookings/${bookingId}`} className="flex flex-col items-center justify-center bg-muted/50 rounded-lg py-1.5 px-2 min-w-[3rem] border border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all group/date">
                    <span className="text-xl font-black leading-none text-foreground group-hover/date:text-primary transition-colors">{startDate.getDate()}</span>
                    <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider leading-none mt-1 group-hover/date:text-primary transition-colors">{startDate.toLocaleDateString("en-US", { month: "short" })}</span>
                </Link>
                <div className="flex flex-col">
                    <button
                        ref={studentTriggerRef}
                        onClick={() => studentCount > 1 && setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                        className={`font-semibold text-foreground truncate flex-1 tracking-wider text-lg text-left ${studentCount > 1 ? "hover:text-primary cursor-pointer transition-colors" : "cursor-default"}`}
                        style={studentCount > 1 ? { color: studentColor } : {}}
                    >
                        {leaderName}
                    </button>
                    {studentCount > 1 && <Dropdown isOpen={isStudentDropdownOpen} onClose={() => setIsStudentDropdownOpen(false)} items={studentDropdownItems} align="left" triggerRef={studentTriggerRef} />}
                    <div className="text-[10px] font-medium text-muted-foreground">
                        {ratioText} {statusText && <span className={statusStyle}>{statusText}</span>}
                    </div>
                </div>
            </div>

            <button onClick={onExpand} className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground">
                <MoreVertical size={16} />
            </button>
        </div>
    );
};

const BookingSummaryBadges = ({
    schoolPackage,
    lessons,
    studentCount,
    students,
    studentColor,
}: {
    schoolPackage: ClassboardData["schoolPackage"];
    lessons: ClassboardLesson[];
    studentCount: number;
    students: { id: string; firstName: string; lastName: string }[];
    studentColor: string;
}) => {
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
    const badgeTriggerRef = useRef<HTMLButtonElement>(null);

    const packageInfo = getPackageInfo(schoolPackage, lessons);
    const totalPayment = packageInfo.eventHours * packageInfo.pricePerHour;

    const studentDropdownItems: DropdownItemProps[] = students.map((bs, index) => ({
        id: bs.id || index,
        label: `${bs.firstName} ${bs.lastName}`,
        icon: HelmetIcon,
        color: studentColor,
    }));

    return (
        <div className="relative">
            <button
                ref={badgeTriggerRef}
                onClick={() => studentCount > 1 && setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                className={`w-full p-2 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between gap-2 transition-colors ${studentCount > 1 ? "hover:bg-muted/50 cursor-pointer" : "cursor-default"}`}
            >
                <div className="flex-1 overflow-hidden">
                    <EquipmentStudentPackagePriceBadge
                        categoryEquipment={schoolPackage.categoryEquipment}
                        equipmentCapacity={schoolPackage.capacityEquipment}
                        studentCapacity={studentCount}
                        packageDurationHours={packageInfo.durationMinutes / 60}
                        pricePerHour={packageInfo.pricePerHour}
                    />
                </div>

                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 shrink-0 pl-2 border-l border-border/50">
                    <Receipt size={16} />
                    <span className="text-sm font-bold">{totalPayment.toFixed(0)}</span>
                </div>
            </button>

            {studentCount > 1 && <Dropdown isOpen={isStudentDropdownOpen} onClose={() => setIsStudentDropdownOpen(false)} items={studentDropdownItems} align="left" triggerRef={badgeTriggerRef} />}
        </div>
    );
};


interface InstructorListProps {
    lessons: ClassboardLesson[];
    onAddEvent: (lessonId: string) => void;
    loadingLessonId: string | null;
}

const InstructorList = ({
    lessons,
    onAddEvent,
    loadingLessonId,
}: InstructorListProps) => {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
    const teacherColor = teacherEntity?.color || "#22c55e";

    return (
        <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground">Lessons</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {lessons.map((lesson) => {
                    const isLoading = loadingLessonId === lesson.id;
                    const events = lesson.events || [];
                    const totalMinutes = events.reduce((sum, e) => sum + (e.duration || 0), 0);
                    const durationStr = getFullDuration(totalMinutes);
                    const eventCount = events.length;

                    return (
                        <button
                            key={lesson.id}
                            onClick={() => onAddEvent(lesson.id)}
                            disabled={isLoading}
                            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors border border-border/50 text-xs group"
                            title="Click to add event for this teacher"
                        >
                            <div className="flex items-center justify-center text-muted-foreground group-hover:text-primary">
                                {isLoading ? (
                                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <div style={{ color: teacherColor }}>
                                        <HeadsetIcon size={16} />
                                    </div>
                                )}
                            </div>
                            <span className="font-medium text-foreground">{lesson.teacher.username}</span>
                            <div className="h-3 w-px bg-border/60 mx-0.5" />
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-muted-foreground" title="Events">
                                    <FlagIcon size={12} />
                                    <span className="font-medium">{eventCount}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground" title="Duration">
                                    <DurationIcon size={12} />
                                    <span className="font-medium">{durationStr}</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const ExpandableDetails = ({ isExpanded, schoolPackage, bookingId }: { isExpanded: boolean; schoolPackage: ClassboardData["schoolPackage"]; bookingId: string }) => {
    if (!isExpanded) return null;

    return (
        <div className="bg-muted/30 border-t border-border/50">
            <div className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <PackageIcon size={16} className="text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Package</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{schoolPackage.description || "N/A"}</span>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

interface StudentBookingCardProps {
    bookingData: ClassboardData;
    draggableBooking: DraggableBooking;
    selectedDate: string;
    classboard: {
        onDragStart: (booking: DraggableBooking) => void;
        onDragEnd: () => void;
        onAddLessonEvent?: (booking: DraggableBooking, lessonId: string) => Promise<void>;
        availableTeachers?: { username: string; firstName: string; id: string }[];
    };
}

export default function StudentBookingCard({ bookingData, draggableBooking, selectedDate, classboard }: StudentBookingCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);

    const { booking, schoolPackage, lessons, bookingStudents } = bookingData;
    const packageInfo = getPackageInfo(schoolPackage, lessons);
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const studentColor = studentEntity?.color || "#eab308";
    const students = bookingStudents.map((bs) => bs.student);

    const handleDragStart = (e: React.DragEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest("[role=\"button\"]")) {
            e.preventDefault();
            return;
        }
        const bookingJson = JSON.stringify(draggableBooking);
        try {
            e.dataTransfer.setData("application/json", bookingJson);
            e.dataTransfer.setData("text/plain", bookingJson);
        } catch (err) {
            console.warn("dataTransfer setData error:", err);
        }
        e.dataTransfer.effectAllowed = "move";
        classboard.onDragStart(draggableBooking);
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        classboard.onDragEnd();
        setIsDragging(false);
    };

    const handleAddEvent = async (lessonId: string) => {
        if (!classboard.onAddLessonEvent) return;
        console.log("➕ [StudentBookingCard] Adding event for lesson:", lessonId);
        console.log("   - Booking:", draggableBooking.leaderStudentName);
        console.log("   - Lessons in booking:", draggableBooking.lessons.map((l) => ({ id: l.id, teacherId: l.teacherId })));
        setLoadingLessonId(lessonId);
        try {
            await classboard.onAddLessonEvent(draggableBooking, lessonId);
        } finally {
            setLoadingLessonId(null);
        }
    };

    return (
        <>
            <div
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className={`group relative w-[345px] mx-auto flex-shrink-0 bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${isDragging ? "opacity-50" : "opacity-100"}`}
            >
                <BookingProgressBar lessons={lessons} durationMinutes={packageInfo.durationMinutes} />

                <div className="p-4 space-y-4">
                    <CardHeader
                        bookingId={booking.id}
                        dateStart={booking.dateStart}
                        dateEnd={booking.dateEnd}
                        selectedDate={selectedDate}
                        leaderName={booking.leaderStudentName}
                        studentCount={students.length}
                        students={students}
                        studentColor={studentColor}
                        onExpand={() => setIsExpanded(!isExpanded)}
                    />

                    <div className="space-y-3">
                        <BookingSummaryBadges schoolPackage={schoolPackage} lessons={lessons} studentCount={students.length} students={students} studentColor={studentColor} />
                    </div>

                    <InstructorList
                        lessons={lessons}
                        onAddEvent={handleAddEvent}
                        loadingLessonId={loadingLessonId}
                    />
                </div>

                <ExpandableDetails isExpanded={isExpanded} schoolPackage={schoolPackage} bookingId={booking.id} />
            </div>
        </>
    );
}
