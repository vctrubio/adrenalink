"use client";

import { useState } from "react";
import { ChevronDown, Plus, Loader2 } from "lucide-react";
import type { ComponentType } from "react";
import type { DraggableBooking } from "@/src/hooks/useClassboard";
import { getPrettyDuration } from "@/getters/duration-getter";
import { calculateLessonRevenue } from "@/getters/commission-calculator";
import { getEventStatusColor, EventStatus } from "@/types/status";
import { ENTITY_DATA } from "@/config/entities";
import { formatDate } from "@/getters/date-getter";

interface StudentBookingCardProps {
    booking: DraggableBooking;
    studentNames?: string[];
    dateStart?: string;
    dateEnd?: string;
    packageDurationMinutes?: number;
    packagePricePerStudent?: number;
    selectedClientDate?: string;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onAddLessonEvent?: (teacherUsername: string) => Promise<void>;
}

type Entity = {
    id: string;
    color: string;
    bgColor: string;
    icon: ComponentType<{ className?: string }>;
};

type Lesson = {
    id: string;
    teacherUsername: string;
    commissionType: "fixed" | "percentage";
    commissionCph: number;
    events?: Array<{
        id: string;
        date: string;
        duration: number;
        location: string;
        status: string;
    }>;
};

type CalculateLessonRevenue = (pricePerStudent: number, studentCount: number, durationMinutes: number, totalDuration: number) => number;

// Common constants
const rowClassName = "grid grid-cols-[24px_1fr_24px] items-center gap-2 py-1";

// Reusable DropdownRow component
const DropdownRow = ({ children }: { children: React.ReactNode }) => (
    <div className="px-4 pb-2 space-y-1 bg-muted/20">
        {children}
    </div>
);

// Subcomponents
const EntityIcon = ({ entityId, className = "w-4 h-4", style }: { entityId: string; className?: string; style?: React.CSSProperties }) => {
    const ent = ENTITY_DATA.find((e) => e.id === entityId);
    if (!ent) return null;
    const Icon = ent.icon as ComponentType<{ className?: string }>;
    return (
        <span style={{ color: ent.color, ...style }} className="inline-flex items-center justify-center">
            <Icon className={className} />
        </span>
    );
};

const BookingRow = ({ start, end, selectedDate, expandedRow, setExpandedRow, bookingEntity }: { start?: string; end?: string; selectedDate?: string; expandedRow: string | null; setExpandedRow: (id: string | null) => void; bookingEntity: Entity | undefined }) => {
    const fStart = start ? formatDate(start) : undefined;
    const fEnd = end ? formatDate(end) : undefined;

    // compute days until end date from selectedDate if provided
    let daysLabel = "Xd";
    if (selectedDate && end) {
        try {
            const s = new Date(selectedDate);
            const e = new Date(end);
            const diffMs = e.setHours(0,0,0,0) - s.setHours(0,0,0,0);
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            daysLabel = `${Math.max(0, diffDays)}d`;
        } catch {
            daysLabel = "Xd";
        }
    }

    return (
        <div>
            <div className={`${rowClassName} px-2 rounded-t-lg`} style={{ backgroundColor: bookingEntity?.bgColor + "20", borderBottomColor: bookingEntity?.color, borderBottomWidth: "2px", borderBottomStyle: "solid" }}>
                <div className="w-6 h-6 flex items-center justify-center"><EntityIcon entityId="booking" /></div>
                <div className="text-sm text-foreground">{fStart || "-"}{fStart && fEnd ? ` - ${fEnd}` : fEnd ? fEnd : ""}{" • "}{daysLabel}</div>
                <div className="w-6 h-6 flex items-center justify-center">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedRow(expandedRow === "booking" ? null : "booking"); }} onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }} className="p-0">
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedRow === "booking" ? "transform rotate-180" : ""}`} style={{ color: bookingEntity?.color }} />
                    </button>
                </div>
            </div>
            {expandedRow === "booking" && <BookingDropdownRow />}
        </div>
    );
};

const StudentRow = ({ students, expandedRow, setExpandedRow, studentEntity }: { students: string[]; expandedRow: string | null; setExpandedRow: (id: string | null) => void; studentEntity: Entity | undefined }) => (
    <div className="px-2" style={{ backgroundColor: studentEntity?.bgColor + "20" }}>
        {students.length > 0 ? students.map((s, i) => (
            <div key={i}>
                <div className={`${rowClassName} ${i < students.length - 1 ? "border-b border-border" : ""}`}>
                    <div className="w-6 h-6 flex items-center justify-center"><EntityIcon entityId="student" /></div>
                    <div className="text-sm text-foreground">{s}</div>
                    <div className="w-6 h-6 flex items-center justify-center">
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedRow(expandedRow === `student-${i}` ? null : `student-${i}`); }} onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }} className="p-0">
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedRow === `student-${i}` ? "transform rotate-180" : ""}`} style={{ color: studentEntity?.color }} />
                        </button>
                    </div>
                </div>
                {expandedRow === `student-${i}` && <StudentDropdownRow />}
            </div>
        )) : <div className="text-sm text-muted-foreground py-1">No students</div>}
    </div>
);

const TeachersRow = ({ lessons, expandedRow, setExpandedRow, teacherEntity, onAddLessonEvent, loadingLessonId }: { lessons: Lesson[]; expandedRow: string | null; setExpandedRow: (id: string | null) => void; teacherEntity: Entity | undefined; onAddLessonEvent?: (teacherUsername: string) => Promise<void>; loadingLessonId?: string | null }) => (
    <div className="px-2" style={{ backgroundColor: teacherEntity?.bgColor + "20" }}>
        {lessons.length > 0 ? lessons.map((lesson, i) => (
            <div key={lesson.id}>
                <div className={`${rowClassName} ${i < lessons.length - 1 ? "border-b border-border" : ""}`}>
                    <div className="w-6 h-6 flex items-center justify-center"><EntityIcon entityId="teacher" /></div>
                    <div className="text-sm text-foreground flex items-center gap-2">
                        {lesson.teacherUsername}
                        <span className="border rounded px-2 text-xs bg-muted">
                            {lesson.commissionType === "fixed" ? `€${lesson.commissionCph}/h` : `${lesson.commissionCph}%/h`}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAddLessonEvent?.(lesson.teacherUsername);
                            }}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                            disabled={loadingLessonId === lesson.id}
                            className="p-0 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add lesson event to teacher queue"
                        >
                            {loadingLessonId === lesson.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" style={{ color: teacherEntity?.color }} />
                            ) : (
                                <Plus className="w-4 h-4" style={{ color: teacherEntity?.color }} />
                            )}
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setExpandedRow(expandedRow === lesson.id ? null : lesson.id);
                            }}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                            className="p-0"
                        >
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${expandedRow === lesson.id ? "transform rotate-180" : ""}`}
                                style={{ color: teacherEntity?.color }}
                            />
                        </button>
                    </div>
                </div>
                {expandedRow === lesson.id && <TeacherDropdownRow lesson={lesson} />}
            </div>
        )) : (
            <button className={`${rowClassName} text-left`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); console.log("adding lesson to booking"); }} onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                <div className="w-6 h-6 flex items-center justify-center"><EntityIcon entityId="teacher" className="w-4 h-4 text-muted-foreground" /></div>
                <div className="text-sm text-muted-foreground">No teachers found</div>
                <div className="w-6 h-6 flex items-center justify-center">
                    <Plus className="w-4 h-4" style={{ color: teacherEntity?.color }} />
                </div>
            </button>
        )}
    </div>
);

const PackageRow = ({
    pricePerStudent,
    durationMinutes,
    expandedRow,
    setExpandedRow,
    packageEntity,
    studentCountFallback,
    calculateLessonRevenue,
}: {
    pricePerStudent?: number;
    durationMinutes?: number;
    expandedRow: string | null;
    setExpandedRow: (id: string | null) => void;
    packageEntity: Entity | undefined;
    studentCountFallback: number;
    calculateLessonRevenue: CalculateLessonRevenue;
}) => (
    <div>
        <div className={`${rowClassName} px-2`} style={{ backgroundColor: packageEntity?.bgColor + "20" }}>
            <div className="w-6 h-6 flex items-center justify-center"><EntityIcon entityId="schoolPackage" /></div>
            <div className="text-sm text-foreground">
                {pricePerStudent && durationMinutes ? (
                    (() => {
                        const lessonRevenue = calculateLessonRevenue(pricePerStudent, studentCountFallback, durationMinutes, durationMinutes);
                        const hours = durationMinutes / 60;
                        const pricePerHourTotal = hours > 0 ? lessonRevenue / hours : 0;
                        return `€${pricePerHourTotal.toFixed(2)} / hr`;
                    })()
                ) : (
                    "Package Details"
                )}
            </div>
            <div className="w-6 h-6 flex items-center justify-center">
                <button onClick={(e) => { e.stopPropagation(); setExpandedRow(expandedRow === "package" ? null : "package"); }} onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }} className="p-0">
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedRow === "package" ? "transform rotate-180" : ""}`} style={{ color: packageEntity?.color }} />
                </button>
            </div>
        </div>
        {expandedRow === "package" && <PackageDropdownRow pricePerStudent={pricePerStudent} durationMinutes={durationMinutes} dateStart={undefined} dateEnd={undefined} />}
    </div>
);

const PackageDropdownRow = ({
    pricePerStudent,
    durationMinutes,
    dateStart,
    dateEnd,
}: {
    pricePerStudent?: number;
    durationMinutes?: number;
    dateStart?: string;
    dateEnd?: string;
}) => (
    <DropdownRow>
        {durationMinutes && (
            <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Duration</span>
                <span className="text-sm font-medium text-foreground">{getPrettyDuration(durationMinutes)}</span>
            </div>
        )}
        {pricePerStudent && (
            <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Price/Student</span>
                <span className="text-sm font-medium text-foreground">€{pricePerStudent.toFixed(2)}</span>
            </div>
        )}
        {dateStart && (
            <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Date Start</span>
                <span className="text-sm font-medium text-foreground">{dateStart}</span>
            </div>
        )}
        {dateEnd && (
            <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Date End</span>
                <span className="text-sm font-medium text-foreground">{dateEnd}</span>
            </div>
        )}
    </DropdownRow>
);

const TeacherDropdownRow = ({ lesson }: { lesson: Lesson }) => {
    const event = lesson.events?.[0]; // assume lesson has events
    console.log("lesson event...........................................:", event);
    if (!event) return null;
    const statusColor = getEventStatusColor(event.status as EventStatus);
    const fmt = (iso?: string) => {
        if (!iso) return undefined;
        try {
            const d = new Date(iso);
            return d.toLocaleString(undefined, { month: "short", day: "numeric" });
        } catch {
            return iso;
        }
    };
    const fDate = fmt(event.date);
    return (
        <DropdownRow>
            <div className="grid grid-cols-[24px_1fr_24px] items-center gap-2 py-1">
                <div className="w-6 h-6 flex items-center justify-center">
                    <EntityIcon entityId="event" className="w-4 h-4" style={{ color: statusColor }} />
                </div>
                <div className="text-sm text-foreground">{fDate} • {event.duration}min</div>
                <div className="w-6 h-6" />
            </div>
        </DropdownRow>
    );
};

const StudentDropdownRow = () => (
    <DropdownRow>
        <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Passport Number</span>
            <span className="text-sm font-medium text-foreground">AB123456</span>
        </div>
        <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Languages</span>
            <span className="text-sm font-medium text-foreground">English, Spanish</span>
        </div>
    </DropdownRow>
);

const BookingDropdownRow = () => (
    <DropdownRow>
        <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Referral ID</span>
            <span className="text-sm font-medium text-foreground">REF-789</span>
        </div>
    </DropdownRow>
);

export default function StudentBookingCard({
    booking,
    studentNames,
    dateStart,
    dateEnd,
    packageDurationMinutes,
    packagePricePerStudent,
    selectedClientDate,
    onDragStart,
    onDragEnd,
    onAddLessonEvent,
}: StudentBookingCardProps) {
    // local state
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);

    // derived values (declare what we use up front)
    const students = studentNames ?? [];
    const hasDetails = Boolean(packageDurationMinutes || packagePricePerStudent || dateStart || dateEnd);
    const studentCountFallback = booking?.capacityStudents ?? (students.length || 1);

    // entity colors for theming
    const bookingEntity = ENTITY_DATA.find(e => e.id === "booking");
    const studentEntity = ENTITY_DATA.find(e => e.id === "student");
    const teacherEntity = ENTITY_DATA.find(e => e.id === "teacher");
    const packageEntity = ENTITY_DATA.find(e => e.id === "schoolPackage");

    // event handlers
    const handleDragStart = (e: React.DragEvent) => {
        const bookingJson = JSON.stringify(booking);
        try {
            e.dataTransfer.setData("application/json", bookingJson);
            e.dataTransfer.setData("text/plain", bookingJson);
        } catch (err) {
            console.warn("dataTransfer setData error:", err);
        }
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.();
    };

    const handleDragEnd = () => onDragEnd?.();

    const handleAddLessonEvent = async (teacherUsername: string) => {
        const lesson = booking.lessons.find((l) => l.teacherUsername === teacherUsername);
        if (!lesson) return;

        setLoadingLessonId(lesson.id);
        try {
            await onAddLessonEvent?.(teacherUsername);
        } finally {
            setLoadingLessonId(null);
        }
    };

    // Render
    return (
        <div draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd} className="bg-card rounded-lg border transition-shadow cursor-grab hover:shadow-md active:cursor-grabbing active:opacity-50 p-0">
            <div className="grid gap-0">
                <BookingRow start={dateStart} end={dateEnd} selectedDate={selectedClientDate} expandedRow={expandedRow} setExpandedRow={setExpandedRow} bookingEntity={bookingEntity} />

                <StudentRow students={students} expandedRow={expandedRow} setExpandedRow={setExpandedRow} studentEntity={studentEntity} />

                <TeachersRow lessons={booking.lessons as Lesson[]} expandedRow={expandedRow} setExpandedRow={setExpandedRow} teacherEntity={teacherEntity} onAddLessonEvent={handleAddLessonEvent} loadingLessonId={loadingLessonId} />

                {hasDetails && <PackageRow pricePerStudent={packagePricePerStudent} durationMinutes={packageDurationMinutes} expandedRow={expandedRow} setExpandedRow={setExpandedRow} packageEntity={packageEntity} studentCountFallback={studentCountFallback} calculateLessonRevenue={calculateLessonRevenue} />}
            </div>
        </div>
    );
}
