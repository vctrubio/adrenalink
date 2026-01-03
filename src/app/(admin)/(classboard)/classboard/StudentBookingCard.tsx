"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { MoreVertical, Receipt } from "lucide-react";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import { Dropdown, createStudentDropdownItems } from "@/src/components/ui/dropdown";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { getBookingProgressBar } from "@/getters/booking-progress-getter";
import { getPackageInfo } from "@/getters/school-packages-getter";
import { getFullDuration } from "@/getters/duration-getter";
import { useClassboardContext } from "@/src/providers/classboard-provider";
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
    students,
    onExpand,
}: {
    bookingId: string;
    dateStart: string;
    dateEnd: string;
    selectedDate: string;
    leaderName: string;
    studentCount: number;
    students: { id: string; firstName: string; lastName: string }[];
    onExpand: () => void;
}) => {

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

    return (
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <Link href={`/bookings/${bookingId}`} className="flex flex-col items-center justify-center bg-muted/50 rounded-lg py-1.5 px-2 min-w-[3rem] border border-border/50 hover:bg-muted/80 transition-colors">
                    <span className="text-xl font-black leading-none text-foreground">{startDate.getDate()}</span>
                    <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider leading-none mt-1">{startDate.toLocaleDateString("en-US", { month: "short" })}</span>
                </Link>
                <div className="flex flex-col">
                    <div className="font-semibold text-foreground truncate flex-1 text-lg text-left">
                        {leaderName}
                    </div>
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

const BookingSummaryBadges = ({ schoolPackage, lessons, studentCount, students }: { schoolPackage: ClassboardData["schoolPackage"]; lessons: ClassboardLesson[]; studentCount: number; students: { id: string; firstName: string; lastName: string }[] }) => {
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
    const badgeTriggerRef = useRef<HTMLButtonElement>(null);

    const packageInfo = getPackageInfo(schoolPackage, lessons);
    const totalPayment = packageInfo.eventHours * packageInfo.pricePerHour;

    const studentDropdownItems = createStudentDropdownItems(students);

    return (
        <div className="relative">
            <button ref={badgeTriggerRef} onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)} className="w-full p-2 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between gap-2 transition-colors hover:bg-muted/50 cursor-pointer">
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

            <Dropdown isOpen={isStudentDropdownOpen} onClose={() => setIsStudentDropdownOpen(false)} items={studentDropdownItems} align="left" triggerRef={badgeTriggerRef} />
        </div>
    );
};

interface InstructorListProps {
    lessons: ClassboardLesson[];
    onAddEvent: (lessonId: string) => void;
    loadingLessonId: string | null;
    draggableLessonIds?: Set<string>; // Only lessons with teachers
}

const InstructorList = ({ lessons, onAddEvent, loadingLessonId, draggableLessonIds }: InstructorListProps) => {
    const teacherColor = "#22c55e";

    // Filter to only show lessons that have teachers
    const visibleLessons = lessons.filter((lesson) => !draggableLessonIds || draggableLessonIds.has(lesson.id));

    // console.log("🎓 [InstructorList] All lessons:", lessons.length, "Draggable IDs:", draggableLessonIds?.size || 0, "Visible:", visibleLessons.length);
    // console.log("   - All lesson IDs:", lessons.map((l) => l.id));
    // console.log("   - Draggable lesson IDs:", Array.from(draggableLessonIds || []));

    return (
        <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground">Lessons</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {visibleLessons.map((lesson) => {
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
}

export default function StudentBookingCard({ bookingData }: StudentBookingCardProps) {
    const { setDraggedBooking, draggedBooking, addLessonEvent, selectedDate } = useClassboardContext();
    const [isExpanded, setIsExpanded] = useState(false);
    const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);

    const bookingId = bookingData.booking.id;
    const isDragging = draggedBooking?.bookingId === bookingId;

    // Debug logging
    console.log(`📋 [StudentBookingCard] Booking: ${bookingData.booking.leaderStudentName}`);
    console.log(`   Lessons count: ${bookingData.lessons.length}`);
    bookingData.lessons.forEach((l, idx) => {
        console.log(`   Lesson ${idx}: ${l.teacher?.username} - Events: ${l.events?.length || 0}`);
        if (l.events && l.events.length > 0) {
            l.events.forEach((e) => {
                console.log(`      Event: ${e.date} | Duration: ${e.duration}m`);
            });
        }
    });

    const { booking, schoolPackage, lessons, bookingStudents } = bookingData;
    const packageInfo = getPackageInfo(schoolPackage, lessons);

    const students = bookingStudents.map((bs) => bs.student);
    const draggableLessonIds = new Set(lessons.filter((l) => l.teacher?.id).map((l) => l.id));

    const handleDragStart = (e: React.DragEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest("[role=\"button\"]")) {
            e.preventDefault();
            return;
        }
        try {
            e.dataTransfer.setData("application/json", bookingId);
            e.dataTransfer.setData("text/plain", bookingId);
        } catch (err) {
            console.warn("dataTransfer setData error:", err);
        }
        e.dataTransfer.effectAllowed = "move";

        // Create DraggableBooking object for drag
        const draggableBooking: DraggableBooking = {
            bookingId,
            capacityStudents: bookingData.schoolPackage.capacityStudents,
            lessons: lessons
                .filter((l) => l.teacher?.id)
                .map((l) => ({
                    id: l.id,
                    teacherId: l.teacher!.id,
                })),
        };

        setDraggedBooking(draggableBooking);
    };

    const handleDragEnd = () => {
        setDraggedBooking(null);
    };

    const handleAddEvent = async (lessonId: string) => {
        setLoadingLessonId(lessonId);
        try {
            await addLessonEvent(bookingData, lessonId);
        } finally {
            setLoadingLessonId(null);
        }
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`group relative w-[345px] mx-auto flex-shrink-0 bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${isDragging ? "opacity-50" : "opacity-100"}`}
        >
            <BookingProgressBar lessons={lessons} durationMinutes={packageInfo.durationMinutes} />

            <div className="p-4 space-y-4">
                <CardHeader bookingId={booking.id} dateStart={booking.dateStart} dateEnd={booking.dateEnd} selectedDate={selectedDate} leaderName={booking.leaderStudentName} students={students} onExpand={() => setIsExpanded(!isExpanded)} />

                <div className="space-y-3">
                    <BookingSummaryBadges schoolPackage={schoolPackage} lessons={lessons} studentCount={students.length} students={students} />
                </div>

                <InstructorList lessons={lessons} onAddEvent={handleAddEvent} loadingLessonId={loadingLessonId} draggableLessonIds={draggableLessonIds} />
            </div>

            <ExpandableDetails isExpanded={isExpanded} schoolPackage={schoolPackage} bookingId={booking.id} />
        </div>
    );
}
