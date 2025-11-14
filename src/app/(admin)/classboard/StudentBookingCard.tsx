"use client";

import { useState } from "react";
import { ChevronDown, Plus, ChevronUp } from "lucide-react";
import type { ComponentType } from "react";
import type { DraggableBooking } from "@/src/hooks/useClassboard";
import { getPrettyDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import { formatDate } from "@/getters/date-getter";
import type { SchoolPackageType } from "@/drizzle/schema";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import FlagIcon from "@/public/appSvgs/FlagIcon";

type StudentInfo = {
    name: string;
    description?: string | null;
    languages: string[];
};

interface StudentBookingCardProps {
    booking: DraggableBooking;
    students?: StudentInfo[];
    dateStart?: string;
    dateEnd?: string;
    package?: SchoolPackageType;
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

/*
prompt:
can u add in the dropdown, if i do open, first some seperator like before on each list, and then a bg for the whole thing of the entity bg please.
*/

// Common constants
const rowClassName = "grid grid-cols-[20px_1fr_20px] items-center gap-2 py-1";

// Reusable DropdownRow component
const DropdownRow = ({ items, children }: { items?: Array<{ value: string }>; children?: React.ReactNode }) => {
    if (items && items.length > 0) {
        return (
            <div className="pl-4 pr-2 pb-2">
                <div className="divide-y divide-muted/20">
                    {items.map((item, index) => (
                        <div key={index}>
                            <span className="text-sm font-medium text-foreground">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return <div className="pb-2 space-y-1">{children}</div>;
};

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
            const diffMs = e.setHours(0, 0, 0, 0) - s.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            daysLabel = `${Math.max(0, diffDays)}d`;
        } catch {
            daysLabel = "Xd";
        }
    }

    const isExpanded = expandedRow === "booking";
    const bgStyle = isExpanded && bookingEntity?.bgColor ? { backgroundColor: bookingEntity.bgColor + "20" } : {};

    return (
        <div style={bgStyle} className={isExpanded ? "rounded-lg" : ""}>
            <div className={`${rowClassName} px-2 rounded-t-lg border-b border-blue-400`}>
                <div className="w-6 h-6 flex items-center justify-center">
                    <EntityIcon entityId="booking" />
                </div>
                <div className="text-sm text-foreground">
                    {fStart || "-"}
                    {fStart && fEnd ? ` - ${fEnd}` : fEnd ? fEnd : ""}
                    {" • "}
                    {daysLabel}
                </div>
                <div className="w-6 h-6 flex items-center justify-center">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExpandedRow(isExpanded ? null : "booking");
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                        className="p-0"
                    >
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "transform rotate-180" : ""}`} style={{ color: bookingEntity?.color }} />
                    </button>
                </div>
            </div>
            {isExpanded && <BookingDropdownRow />}
        </div>
    );
};

const StudentRow = ({ students, expandedRow, setExpandedRow, studentEntity }: { students: StudentInfo[]; expandedRow: string | null; setExpandedRow: (id: string | null) => void; studentEntity: Entity | undefined }) => (
    <div className="px-2">
        {students.length > 0 ? (
            students.map((student, i) => {
                const isExpanded = expandedRow === `student-${i}`;
                const bgStyle = isExpanded && studentEntity?.bgColor ? { backgroundColor: studentEntity.bgColor + "20" } : {};

                return (
                    <div key={i} style={bgStyle} className={isExpanded ? "rounded-lg" : ""}>
                        <div className={rowClassName}>
                            <div className="w-6 h-6 flex items-center justify-center">
                                <EntityIcon entityId="student" />
                            </div>
                            <div className="text-sm text-foreground">{student.name}</div>
                            <div className="w-6 h-6 flex items-center justify-center">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setExpandedRow(isExpanded ? null : `student-${i}`);
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                    className="p-0"
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "transform rotate-180" : ""}`} style={{ color: studentEntity?.color }} />
                                </button>
                            </div>
                        </div>
                        {isExpanded && <StudentDropdownRow student={student} />}
                    </div>
                );
            })
        ) : (
            <div className="text-sm text-muted-foreground py-1">No students</div>
        )}
    </div>
);

const TeachersRow = ({ lessons, commissionEntity }: { lessons: DraggableBooking["lessons"]; commissionEntity: Entity | undefined }) => (
    <div className="px-2">
        {lessons.length > 0 ? (
            lessons.map((lesson) => (
                <div key={lesson.id}>
                    <div className={rowClassName}>
                        <div className="w-6 h-6 flex items-center justify-center">
                            <EntityIcon entityId="teacher" />
                        </div>
                        <div className="text-sm text-foreground">{lesson.teacherUsername}</div>
                        <div className="w-6 h-6 flex items-center justify-center">
                            <span
                                className="rounded px-2 py-0.5 text-xs font-medium"
                                style={{
                                    backgroundColor: commissionEntity?.bgColor + "20",
                                    color: commissionEntity?.color,
                                    borderColor: commissionEntity?.color,
                                    borderWidth: "1px",
                                    borderStyle: "solid",
                                }}
                            >
                                {lesson.commissionType === "fixed" ? `€${lesson.commissionCph}` : `${lesson.commissionCph}%`}
                            </span>
                        </div>
                    </div>
                    {lesson.events && lesson.events.length > 0 && <TeacherDropdownRow lesson={lesson} />}
                </div>
            ))
        ) : (
            <div className="text-sm text-muted-foreground py-1">No teachers assigned</div>
        )}
    </div>
);

const TeacherDropdownRow = ({ lesson }: { lesson: DraggableBooking["lessons"][0] }) => {
    if (!lesson.events || lesson.events.length === 0) {
        return (
            <DropdownRow>
                <div className="text-sm text-muted-foreground py-1">No events scheduled</div>
            </DropdownRow>
        );
    }

    return (
        <div className="pl-4 pr-2 pb-2 bg-muted/20">
            <div className="divide-y divide-muted/20">
                {lesson.events.map((event) => (
                    <div key={event.id} className="py-3 flex items-center gap-2">
                        <FlagIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                            {formatDate(event.date)} • {getPrettyDuration(event.duration)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Package Details Dropdown Component
const PackageDetailsDropdown = ({ packageData }: { packageData: SchoolPackageType }) => {
    if (!packageData) return null;

    const hours = packageData.durationMinutes / 60;
    const pricePerHourPerStudent = hours > 0 ? packageData.pricePerStudent / hours : 0;
    const totalPrice = packageData.pricePerStudent * packageData.capacityStudents;

    // Get equipment category config
    const categoryConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === packageData.categoryEquipment);
    const CategoryIcon = categoryConfig?.icon;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
                <span className="text-muted-foreground">Description:</span>
                <p className="font-medium">{packageData.description || "No description"}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Duration:</span>
                <p className="font-medium">{getPrettyDuration(packageData.durationMinutes)}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Price per Student:</span>
                <p className="font-medium">€{packageData.pricePerStudent}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Price per Hour/Student:</span>
                <p className="font-medium">€{Math.round(pricePerHourPerStudent * 100) / 100}/h</p>
            </div>
            <div>
                <span className="text-muted-foreground">Capacity:</span>
                <div className="flex items-center gap-2 mt-1">
                    {/* Equipment icons */}
                    {categoryConfig && CategoryIcon && (
                        <div className="flex items-center gap-1">
                            {Array.from({ length: packageData.capacityEquipment }).map((_, i) => (
                                <span key={`equipment-${i}`} style={{ color: categoryConfig.color }} className="inline-flex items-center justify-center">
                                    <CategoryIcon className="w-4 h-4" />
                                </span>
                            ))}
                        </div>
                    )}
                    <span className="text-muted-foreground">/</span>
                    {/* Student icons */}
                    <div className="flex items-center gap-1">
                        {Array.from({ length: packageData.capacityStudents }).map((_, i) => (
                            <EntityIcon key={`student-${i}`} entityId="student" className="w-4 h-4" />
                        ))}
                    </div>
                </div>
            </div>
            <div>
                <span className="text-muted-foreground">Expected Total:</span>
                <p className="font-medium text-green-600">€{totalPrice.toFixed(2)}</p>
            </div>
        </div>
    );
};

const PackageRow = ({ packageData, expandedRow, setExpandedRow, packageEntity }: { packageData?: SchoolPackageType; expandedRow: string | null; setExpandedRow: (id: string | null) => void; packageEntity: Entity | undefined }) => {
    if (!packageData) {
        return null;
    }

    const isExpanded = expandedRow === "package";
    const bgStyle = isExpanded && packageEntity?.bgColor ? { backgroundColor: packageEntity.bgColor + "20" } : {};

    return (
        <div className="px-2">
            <div style={bgStyle} className={isExpanded ? "rounded-lg" : ""}>
                <div className={rowClassName}>
                    <div className="w-6 h-6 flex items-center justify-center">
                        <EntityIcon entityId="schoolPackage" />
                    </div>
                    <div className="text-sm text-foreground">{packageData.name || packageData.description || "Package"}</div>
                    <div className="w-6 h-6 flex items-center justify-center">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setExpandedRow(isExpanded ? null : "package");
                            }}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                            className="p-0"
                        >
                            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "transform rotate-180" : ""}`} style={{ color: packageEntity?.color }} />
                        </button>
                    </div>
                </div>
                {isExpanded && (
                    <div className="p-4">
                        <PackageDetailsDropdown packageData={packageData} />
                    </div>
                )}
            </div>
        </div>
    );
};

// Footer Component
const CardFooter = ({ onAssignTeacher }: { onAssignTeacher: () => void }) => {
    return (
        <div className="-mx-0">
            {/* Footer Icons Bar */}
            <div className="flex flex-wrap items-center justify-end p-3 gap-y-3">
                <div className="flex flex-wrap items-center gap-3 px-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAssignTeacher();
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-xs">Assign Teacher</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const StudentDropdownRow = ({ student }: { student: StudentInfo }) => {
    const hasDescription = student.description && student.description.trim().length > 0;
    const hasLanguages = student.languages && Array.isArray(student.languages) && student.languages.length > 0;

    const items: Array<{ value: string }> = [];
    if (hasDescription && student.description) {
        items.push({ value: student.description });
    }
    if (hasLanguages) {
        items.push({ value: student.languages.join(", ") });
    }

    if (items.length === 0) {
        return (
            <DropdownRow>
                <div className="text-sm text-muted-foreground py-1">No additional information available</div>
            </DropdownRow>
        );
    }

    return <DropdownRow items={items} />;
};

const BookingDropdownRow = () => {
    // TODO: Replace with actual referral ID when available
    const items: Array<{ value: string }> = [
        { value: "REF-789" }, // Referral ID
    ];

    return <DropdownRow items={items} />;
};

export default function StudentBookingCard({ booking, students: studentsProp, dateStart, dateEnd, package: packageData, selectedClientDate, onDragStart, onDragEnd, onAddLessonEvent }: StudentBookingCardProps) {
    // local state
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    // derived values
    const students = studentsProp ?? [];

    // entity colors for theming
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking");
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
    const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission");
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");

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

    const handleAssignTeacher = () => {
        console.log("Assign teacher clicked for booking:", booking.bookingId);
    };

    // Render
    return (
        <div draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd} className="bg-card rounded-lg border border-blue-400 transition-shadow cursor-grab hover:shadow-md active:cursor-grabbing active:opacity-50 p-0">
            <div className="grid gap-1">
                <BookingRow start={dateStart} end={dateEnd} selectedDate={selectedClientDate} expandedRow={expandedRow} setExpandedRow={setExpandedRow} bookingEntity={bookingEntity} />

                <PackageRow packageData={packageData} expandedRow={expandedRow} setExpandedRow={setExpandedRow} packageEntity={packageEntity} />

                <StudentRow students={students} expandedRow={expandedRow} setExpandedRow={setExpandedRow} studentEntity={studentEntity} />
            </div>

            <div className="bg-muted/10 rounded-b-lg">
                <TeachersRow lessons={booking.lessons} commissionEntity={commissionEntity} />
                <CardFooter onAssignTeacher={handleAssignTeacher} />
            </div>
        </div>
    );
}
