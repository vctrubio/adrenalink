"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import { LeaderStudent } from "@/src/components/LeaderStudent";
import { ENTITY_DATA } from "@/config/entities";
import { getEventStatusCounts, getProgressColor } from "@/getters/booking-progress-getter";
import { getPackageInfo } from "@/getters/school-packages-getter";
import { ActiveButtonsFooter } from "./ActiveButtonsFooter";
import type { ClassboardData, ClassboardLesson } from "@/backend/classboard/ClassboardModel";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import { BookingPackageTab } from "./BookingPackageTab";
import { BookingPaymentTab } from "./BookingPaymentTab";
import { BookingTeacherLessonTab } from "./BookingTeacherLessonTab";
import { BookingStudentTab } from "./BookingStudentTab";

export type TabType = "package" | "lessons" | "payment" | "student" | null;

const ICON_SIZE = 20;

export interface BookingTabsContent {
    activeTab: TabType;
    selectedTeacherUsername: string | null;
    selectedStudentId: string | null;
    onTabClick: (tab: TabType) => void;
    onTeacherSelect: (username: string | null) => void;
    onStudentSelect: (studentId: string | null) => void;
}

// --- Equipment Tag Component ---

const EquipmentTag = ({ schoolPackage }: { schoolPackage: ClassboardData["schoolPackage"] }) => {
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((e) => e.id === schoolPackage.categoryEquipment);
    const EquipmentIcon = equipmentConfig?.icon;
    const equipmentColor = equipmentConfig?.color;
    const capacity = schoolPackage.capacityEquipment;

    if (!EquipmentIcon) return null;

    if (capacity > 2) {
        return (
            <div className="flex items-center gap-1 pl-2" style={{ color: equipmentColor }} title={`Equipment Capacity: ${capacity}`}>
                <EquipmentIcon size={ICON_SIZE} />
                <span className="text-xs font-semibold">+{capacity}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center" style={{ color: equipmentColor }} title={`Equipment Capacity: ${capacity}`}>
            {Array.from({ length: capacity }).map((_, i) => (
                <EquipmentIcon key={`equip-${i}`} size={ICON_SIZE} className={`${i > 0 ? "-ml-2" : ""}`} />
            ))}
        </div>
    );
};

// --- Teacher Tag Component ---

interface TeacherTagProps {
    lessons: ClassboardLesson[];
    tabs: BookingTabsContent;
}

const TeacherTag = ({ lessons, tabs }: TeacherTagProps) => {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
    const TeacherIcon = teacherEntity?.icon;
    const teacherColor = teacherEntity?.color;

    if (lessons.length === 0) return null;

    return (
        <div className="relative flex items-center" style={{ height: 44, minWidth: 120 }}>
            {lessons.map((lesson, index) => {
                const isSelected = tabs.activeTab === "lessons" && tabs.selectedTeacherUsername === lesson.teacher.username;
                return (
                    <motion.button
                        key={lesson.teacher.username}
                        onClick={() => {
                            tabs.onTeacherSelect(isSelected ? null : lesson.teacher.username);
                            tabs.onTabClick("lessons");
                        }}
                        className="absolute flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer"
                        style={{
                            backgroundColor: isSelected ? `${teacherColor}30` : "transparent",
                            color: isSelected ? teacherColor : "inherit",
                        }}
                        animate={{
                            x: isSelected ? 0 : index * -28,
                            y: 0,
                            zIndex: isSelected ? 10 : lessons.length - index,
                            scale: isSelected ? 1 : 0.85,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onMouseEnter={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.backgroundColor = `${teacherColor}15`;
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isSelected ? `${teacherColor}30` : "transparent";
                        }}
                    >
                        <div style={{ color: teacherColor }}>{TeacherIcon && <TeacherIcon size={ICON_SIZE} />}</div>
                        <span className="font-medium whitespace-nowrap">{lesson.teacher.username}</span>
                    </motion.button>
                );
            })}
        </div>
    );
};

// --- Package Tag Component ---

const PackageTag = ({
    durationMinutes,
    pricePerHour,
    eventHours,
    activeTab,
    onClick,
    onPaymentClick,
}: {
    durationMinutes: number;
    pricePerHour: number;
    eventHours: number;
    activeTab: TabType;
    onClick: () => void;
    onPaymentClick: () => void;
}) => {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");
    const packageColor = packageEntity?.color || "#fb923c";
    const hours = Math.round(durationMinutes / 60);
    const totalPayment = eventHours * pricePerHour;
    const displayPayment = totalPayment % 1 === 0 ? Math.round(totalPayment) : totalPayment.toFixed(2);

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onClick}
                className="flex items-center gap-1.5 p-2 rounded-lg transition-colors w-fit"
                style={{ backgroundColor: activeTab === "package" ? `${packageColor}30` : "transparent" }}
                onMouseEnter={(e) => {
                    if (activeTab !== "package") {
                        e.currentTarget.style.backgroundColor = `${packageColor}20`;
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = activeTab === "package" ? `${packageColor}30` : "transparent";
                }}
            >
                <div style={{ color: packageColor }}>
                    <PackageIcon size={20} />
                </div>
                <span className="font-semibold text-foreground text-sm">
                    {hours}h<span className="font-black text-muted-foreground mx-0.5">/</span>
                    {Math.round(pricePerHour)}€
                </span>
            </button>
            <button
                onClick={onPaymentClick}
                className="flex items-center gap-1.5 p-2 rounded-lg transition-colors w-fit"
                style={{ backgroundColor: activeTab === "payment" ? `${packageColor}30` : "transparent" }}
                onMouseEnter={(e) => {
                    if (activeTab !== "payment") {
                        e.currentTarget.style.backgroundColor = `${packageColor}20`;
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = activeTab === "payment" ? `${packageColor}30` : "transparent";
                }}
            >
                <div style={{ color: packageColor }}>
                    <CreditIcon size={20} />
                </div>
                <span className="font-semibold text-foreground text-sm">
                    {eventHours}h<span className="font-black text-muted-foreground mx-0.5">/</span>
                    {displayPayment}€
                </span>
            </button>
        </div>
    );
};

// --- Date Card Component ---

interface DateCardProps {
    month: string;
    day: string;
    dateRangeText: string;
    bookingEntity: any;
    isDateMatch: boolean;
    href: string;
}

const DateCard = ({ month, day, dateRangeText, bookingEntity, isDateMatch, href }: DateCardProps) => (
    <Link href={href} className="col-span-3">
        <div className="border border-border rounded-lg overflow-hidden hover:bg-neutral-100 transition-colors cursor-pointer">
            <div className="py-1 text-center border-b border-border">
                <p className="text-xs font-bold" style={{ color: bookingEntity.color }}>
                    {month}
                </p>
                <p className="text-lg font-black text-foreground">{day}</p>
            </div>
            <div className={`text-center text-xs font-medium p-1 ${isDateMatch ? "bg-muted" : ""}`}>{dateRangeText}</div>
        </div>
    </Link>
);

// --- Header Component ---

interface BookingHeaderProps {
    bookingData: ClassboardData;
    month: string;
    day: string;
    tabs: BookingTabsContent;
    selectedDate: string;
}

const BookingHeader = ({ bookingData, month, day, tabs, selectedDate }: BookingHeaderProps) => {
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking");
    const { schoolPackage, lessons, booking } = bookingData;
    const packageInfo = getPackageInfo(schoolPackage, lessons);

    const endDate = new Date(booking.dateEnd);
    const selected = new Date(selectedDate);
    const daysUntilSelected = Math.ceil((selected.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
    const dateRangeText = endDate.toDateString() === selected.toDateString() ? "xp today" : `xp ${daysUntilSelected}d`;

    return (
        <div className="grid grid-cols-12 gap-3">
            <DateCard
                month={month}
                day={day}
                dateRangeText={dateRangeText}
                bookingEntity={bookingEntity}
                isDateMatch={endDate.toDateString() === selected.toDateString()}
                href={`/bookings/${booking.id}`}
            />

            <div className="col-span-9 space-y-2">
                <div className="flex items-center gap-3 overflow-x-auto">
                    <EquipmentTag schoolPackage={schoolPackage} />
                    {lessons.length > 0 && <div className="h-5 w-px bg-border"></div>}
                    <TeacherTag lessons={lessons} tabs={tabs} />
                </div>
                <PackageTag
                    durationMinutes={packageInfo.durationMinutes}
                    pricePerHour={packageInfo.pricePerHour}
                    eventHours={packageInfo.eventHours}
                    activeTab={tabs.activeTab}
                    onClick={() => tabs.onTabClick("package")}
                    onPaymentClick={() => tabs.onTabClick("payment")}
                />
            </div>
        </div>
    );
};

// --- Tab Content Wrapper Component ---

const TabContentWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="border-t border-border bg-muted/40 p-4">{children}</div>
);

// --- Tab Content Component ---

interface BookingTabContentProps {
    data: ClassboardData;
    tabs: BookingTabsContent;
}

const BookingTabContent = ({ data, tabs }: BookingTabContentProps) => {
    const packageInfo = getPackageInfo(data.schoolPackage, data.lessons);

    if (tabs.activeTab === "package") {
        return (
            <TabContentWrapper>
                <BookingPackageTab data={data} pricePerStudent={packageInfo.pricePerStudent} pricePerHour={packageInfo.pricePerHour} />
            </TabContentWrapper>
        );
    }
    if (tabs.activeTab === "lessons") {
        if (!tabs.selectedTeacherUsername) {
            return null;
        }
        const selectedTeacherData = data.lessons.find((l) => l.teacher.username === tabs.selectedTeacherUsername);
        if (!selectedTeacherData) {
            return null;
        }
        return (
            <TabContentWrapper>
                <BookingTeacherLessonTab
                    lessons={data.lessons}
                    selectedTeacherId={selectedTeacherData.id}
                    pricePerStudent={packageInfo.pricePerStudent}
                    packageDurationMinutes={packageInfo.durationMinutes}
                    studentCount={data.bookingStudents.length}
                />
            </TabContentWrapper>
        );
    }
    if (tabs.activeTab === "payment") {
        return (
            <TabContentWrapper>
                <BookingPaymentTab data={data} pricePerStudent={packageInfo.pricePerStudent} pricePerHour={packageInfo.pricePerHour} />
            </TabContentWrapper>
        );
    }
    if (tabs.activeTab === "student") {
        const selectedStudentData = tabs.selectedStudentId
            ? data.bookingStudents.find((bs) => bs.student.id === tabs.selectedStudentId)
            : null;
        return (
            <TabContentWrapper>
                <BookingStudentTab student={selectedStudentData?.student} />
            </TabContentWrapper>
        );
    }
    return null;
};

// --- Main Component ---

interface ActiveStudentBookingTabProps {
    bookingData: ClassboardData;
    draggableBooking: DraggableBooking;
    selectedDate: string;
    classboard: {
        onDragStart: (booking: DraggableBooking) => void;
        onDragEnd: () => void;
        onAddLessonEvent?: (booking: DraggableBooking, teacherUsername: string) => Promise<void>;
    };
}

export const ActiveStudentBookingTab = ({ bookingData, draggableBooking, selectedDate, classboard }: ActiveStudentBookingTabProps) => {
    const [activeTab, setActiveTab] = useState<TabType>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const id = draggableBooking.bookingId;
    const startDate = new Date(bookingData.booking.dateStart);
    const month = startDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const day = startDate.toLocaleDateString("en-US", { day: "numeric" });

    const packageInfo = getPackageInfo(bookingData.schoolPackage, bookingData.lessons);
    const bookingEvents = bookingData.lessons.flatMap((lesson) => lesson.events || []);
    const counts = getEventStatusCounts(bookingEvents as any);
    const progressBarStyle = { background: getProgressColor(counts, packageInfo.durationMinutes) };

    const tabs: BookingTabsContent = {
        activeTab,
        selectedTeacherUsername: selectedTeacher,
        selectedStudentId: selectedStudent,
        onTabClick: (tab: TabType) => {
            const newTab = activeTab === tab ? null : tab;
            setActiveTab(newTab);
        },
        onTeacherSelect: setSelectedTeacher,
        onStudentSelect: setSelectedStudent,
    };

    const handleAddLessonEvent = async (teacherUsername: string) => {
        setLoadingLessonId(teacherUsername);
        try {
            await classboard.onAddLessonEvent?.(draggableBooking, teacherUsername);
        } finally {
            setLoadingLessonId(null);
        }
    };

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

    return (
        <>
            <div className="flex-shrink-0">
                <div
                    draggable
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-150 cursor-grab active:cursor-grabbing"
                    style={{ opacity: isDragging ? 0.6 : 1 }}
                >
                    <div className="h-2 w-full" style={progressBarStyle} />
                    <div className="p-3 space-y-3">
                        <BookingHeader bookingData={bookingData} month={month} day={day} tabs={tabs} selectedDate={selectedDate} />
                        <div className="border-b border-border"></div>
                        <LeaderStudent
                            leaderStudentName={bookingData.booking.leaderStudentName}
                            bookingId={id}
                            bookingStudents={bookingData.bookingStudents.map((bs) => ({
                                id: bs.student.id,
                                firstName: bs.student.firstName,
                                lastName: bs.student.lastName,
                                passport: bs.student.passport || "",
                                country: bs.student.country || "",
                                phone: bs.student.phone || "",
                            }))}
                        />
                    </div>
                    <ActiveButtonsFooter
                        bookingId={id}
                        lessons={bookingData.lessons}
                        onAddLessonEvent={handleAddLessonEvent}
                        loadingLessonId={loadingLessonId}
                        bookingStatus={bookingData.booking.dateStart}
                    />
                    <BookingTabContent data={bookingData} tabs={tabs} />
                </div>
            </div>
        </>
    );
};
