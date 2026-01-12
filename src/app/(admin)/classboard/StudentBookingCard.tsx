"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { MoreVertical, Receipt, Plus, Loader2 } from "lucide-react";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import { TeacherLessonStatsBadge } from "@/src/components/ui/badge/teacher-lesson-stats";
import { Dropdown, createStudentDropdownItems } from "@/src/components/ui/dropdown";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { AssignTeacherToLessonModal } from "@/src/components/modals/AssignTeacherToLessonModal";
import { ClassboardProgressBar } from "./ClassboardProgressBar";
import { getEventStatusCounts, sortEventsByStatus } from "@/getters/booking-progress-getter";
import { getPackageInfo } from "@/getters/school-packages-getter";
import { getFullDuration } from "@/getters/duration-getter";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import type { ClassboardData, ClassboardLesson } from "@/backend/classboard/ClassboardModel";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";

const TIMEOUT_DURATION = 5000;

// --- Sub-components ---

const BookingProgressBar = ({
    counts,
    durationMinutes,
}: {
    counts: ReturnType<typeof getEventStatusCounts>;
    durationMinutes: number;
}) => {
    return <ClassboardProgressBar counts={counts} durationMinutes={durationMinutes} />;
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
                <Link
                    href={`/bookings/${bookingId}`}
                    className="flex flex-col items-center justify-center bg-muted/50 rounded-lg py-1.5 px-2 min-w-[3rem] border border-border/50 hover:bg-muted/80 transition-colors"
                >
                    <span className="text-xl font-black leading-none text-foreground">{startDate.getDate()}</span>
                    <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider leading-none mt-1">
                        {startDate.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                </Link>
                <div className="flex flex-col">
                    <div className="font-semibold text-foreground truncate flex-1 text-lg text-left">{leaderName}</div>
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
}: {
    schoolPackage: ClassboardData["schoolPackage"];
    lessons: ClassboardLesson[];
    studentCount: number;
    students: { id: string; firstName: string; lastName: string }[];
}) => {
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
    const badgeTriggerRef = useRef<HTMLButtonElement>(null);

    const packageInfo = getPackageInfo(schoolPackage, lessons);
    const totalPayment = packageInfo.eventHours * packageInfo.pricePerHour;

    const studentDropdownItems = createStudentDropdownItems(students);

    return (
        <div className="relative">
            <button
                ref={badgeTriggerRef}
                onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                className="w-full p-2 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between gap-2 transition-colors hover:bg-muted/50 cursor-pointer"
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

            <Dropdown
                isOpen={isStudentDropdownOpen}
                onClose={() => setIsStudentDropdownOpen(false)}
                items={studentDropdownItems}
                align="left"
                triggerRef={badgeTriggerRef}
            />
        </div>
    );
};

interface InstructorListProps {
    lessons: ClassboardLesson[];
    bookingData: ClassboardData;
    onAddEvent: (lessonId: string) => void;
    loadingLessonId: string | null;
    draggableLessonIds?: Set<string>; // Only lessons with teachers
    onAssignTeacher: () => void;
}

const InstructorList = ({
    lessons,
    bookingData,
    onAddEvent,
    loadingLessonId,
    draggableLessonIds,
    onAssignTeacher,
}: InstructorListProps) => {
    const teacherColor = "#22c55e";

    // Filter to only show lessons that have teachers
    const lessonsWithTeachers = lessons.filter((lesson) => !draggableLessonIds || draggableLessonIds.has(lesson.id));
    // Filter to show lessons without teachers
    const lessonsWithoutTeachers = lessons.filter((lesson) => !lesson.teacher?.id);

    return (
        <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground">Lessons</span>
                <button
                    onClick={() => {
                        console.log("Button clicked, lessons count:", lessons.length);
                        onAssignTeacher();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-normal text-muted-foreground hover:bg-muted/50 rounded-lg transition-colors"
                >
                    <Plus size={14} />
                    Assign Teacher
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {lessonsWithTeachers.map((lesson) => {
                    const isLoading = loadingLessonId === lesson.id;
                    const events = sortEventsByStatus(lesson.events || []);
                    const totalMinutes = events.reduce((sum, e) => sum + (e.duration || 0), 0);
                    const eventCount = events.length;

                    return (
                        <TeacherLessonStatsBadge
                            key={lesson.id}
                            teacherId={lesson.teacher.id}
                            teacherUsername={lesson.teacher.username}
                            eventCount={eventCount}
                            durationMinutes={totalMinutes}
                            isLoading={isLoading}
                            onClick={() => onAddEvent(lesson.id)}
                            showCommission={true}
                            commission={lesson.commission}
                        />
                    );
                })}
            </div>
        </div>
    );
};

const ExpandableDetails = ({
    isExpanded,
    schoolPackage,
    bookingId,
}: {
    isExpanded: boolean;
    schoolPackage: ClassboardData["schoolPackage"];
    bookingId: string;
}) => {
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
    const { setDraggedBooking, draggedBooking, addLessonEvent, selectedDate, globalFlag, teacherQueues } = useClassboardContext();
    const [isExpanded, setIsExpanded] = useState(false);
    const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
    const [isAssignTeacherModalOpen, setIsAssignTeacherModalOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const bookingId = bookingData.booking.id;
    const isDragging = draggedBooking?.bookingId === bookingId;

    // Check if this booking is currently being added to the board
    const isConfirming = globalFlag.hasOptimisticEventsForBooking(bookingId);

    const { booking, schoolPackage, lessons, bookingStudents } = bookingData;
    const packageInfo = getPackageInfo(schoolPackage, lessons);
    const allEvents = lessons.flatMap((l) => l.events || []);
    const eventCounts = getEventStatusCounts(allEvents);

    const students = bookingStudents.map((bs) => bs.student);
    const draggableLessonIds = new Set(lessons.filter((l) => l.teacher?.id).map((l) => l.id));

    useEffect(() => {
        console.log("isAssignTeacherModalOpen changed to:", isAssignTeacherModalOpen);
    }, [isAssignTeacherModalOpen]);

    useEffect(() => {
        if (loadingLessonId) {
            timeoutRef.current = setTimeout(() => {
                setLoadingLessonId(null);
                toast.error("Connection timeout - event not confirmed. Please try again.");
            }, TIMEOUT_DURATION);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [loadingLessonId]);

    const handleDragStart = (e: React.DragEvent) => {
        if (isConfirming) {
            e.preventDefault();
            return;
        }
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
        const lesson = lessons.find((l) => l.id === lessonId);
        if (lesson?.teacher) {
            const queue = teacherQueues.find((q) => q.teacher.id === lesson.teacher.id);
            if (queue && !queue.isActive) {
                toast.error(`${lesson.teacher.username} is not active`);
                return;
            }
        }
        setLoadingLessonId(lessonId);
        await addLessonEvent(bookingData, lessonId);
    };

    const handleOpenAssignTeacherModal = useCallback(() => {
        console.log("handleOpenAssignTeacherModal called");
        setIsAssignTeacherModalOpen(true);
    }, []);

    const handleAssignTeacherSuccess = useCallback((updatedLesson: ClassboardLesson) => {
        // Close modal
        setIsAssignTeacherModalOpen(false);
    }, []);

    return (
        <>
            <motion.div
                draggable={!isConfirming}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                animate={{
                    opacity: loadingLessonId || isConfirming ? 0.4 : isDragging ? 0.5 : 1,
                    scale: isConfirming ? 0.98 : 1,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`group relative w-[355px] mx-auto flex-shrink-0 bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md ${isConfirming ? "cursor-wait border-cyan-500/30 shadow-cyan-500/5" : ""}`}
            >
                {isConfirming && (
                    <div className="absolute inset-0 z-50 bg-background/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600">Confirming...</span>
                        </div>
                    </div>
                )}
                <BookingProgressBar counts={eventCounts} durationMinutes={packageInfo.durationMinutes} />

                <div className="p-4 space-y-4">
                    <CardHeader
                        bookingId={booking.id}
                        dateStart={booking.dateStart}
                        dateEnd={booking.dateEnd}
                        selectedDate={selectedDate}
                        leaderName={booking.leaderStudentName}
                        students={students}
                        onExpand={() => setIsExpanded(!isExpanded)}
                    />

                    <div className="space-y-3">
                        <BookingSummaryBadges
                            schoolPackage={schoolPackage}
                            lessons={lessons}
                            studentCount={students.length}
                            students={students}
                        />
                    </div>

                    <InstructorList
                        lessons={lessons}
                        bookingData={bookingData}
                        onAddEvent={handleAddEvent}
                        loadingLessonId={loadingLessonId}
                        draggableLessonIds={draggableLessonIds}
                        onAssignTeacher={handleOpenAssignTeacherModal}
                    />
                </div>

                <ExpandableDetails isExpanded={isExpanded} schoolPackage={schoolPackage} bookingId={booking.id} />
            </motion.div>

            {isAssignTeacherModalOpen && (
                <>
                    {console.log("Rendering modal with state:", { isOpen: isAssignTeacherModalOpen })}
                    <AssignTeacherToLessonModal
                        isOpen={isAssignTeacherModalOpen}
                        onClose={() => setIsAssignTeacherModalOpen(false)}
                        bookingData={bookingData}
                        onAssigned={handleAssignTeacherSuccess}
                    />
                </>
            )}
        </>
    );
}
