"use client";

import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { LessonEventDurationBadge } from "@/src/components/ui/badge/lesson-event-duration";
import { BookingStatusLabel } from "@/src/components/labels/BookingStatusLabel";
import { LessonEventRow, type LessonEventRowData } from "@/src/components/ids/LessonEventRow";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

import { TeacherLessonComissionValue } from "@/src/components/ui/TeacherLessonComissionValue";

export interface TeacherBookingLessonTableData {
    lessonId: string;
    bookingId: string;
    leaderName: string;
    dateStart: string;
    dateEnd: string;
    lessonStatus: string;
    bookingStatus: string;
    commissionType: string;
    cph: number;
    totalDuration: number;
    totalHours: number;
    totalEarning: number;
    eventCount: number;
    events: LessonEventRowData[];
    equipmentCategory: string;
    studentCapacity: number;
}

interface TeacherBookingLessonTableProps {
    lesson: TeacherBookingLessonTableData;
    isExpanded: boolean;
    onToggle: () => void;
    bookingEntity: any;
    studentEntity: any;
}

export function TeacherBookingLessonTable({ lesson, isExpanded, onToggle, bookingEntity, studentEntity }: TeacherBookingLessonTableProps) {
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === lesson.equipmentCategory);
    const EquipmentIcon = equipmentConfig?.icon;
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    return (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
            <button onClick={onToggle} className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                    <HoverToEntity entity={bookingEntity} id={lesson.bookingId}>
                        <div className="flex items-center gap-2 text-muted-foreground">{EquipmentIcon && <EquipmentIcon size={20} />}</div>
                    </HoverToEntity>
                    <div className="flex items-center gap-2">
                        <div style={{ color: studentEntity.color }}>
                            <HelmetIcon size={16} />
                        </div>
                        <span className="font-semibold">{lesson.leaderName}</span>
                        {lesson.studentCapacity > 1 && <span className="text-xs text-muted-foreground">+{lesson.studentCapacity - 1} students</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        <BookingStatusLabel status={lesson.bookingStatus} size={16} />
                        <DateRangeBadge startDate={lesson.dateStart} endDate={lesson.dateEnd} />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                        <TeacherLessonComissionValue 
                            commissionType={lesson.commissionType} 
                            cph={lesson.cph} 
                            currency={currency} 
                        />
                        <span className="text-muted-foreground">×</span>
                        <LessonEventDurationBadge status={lesson.lessonStatus} events={lesson.eventCount} hours={lesson.totalHours} />
                        <span className="text-muted-foreground">=</span>
                        <span className="text-green-600 dark:text-green-400 font-bold">
                            {(Math.round(lesson.totalEarning * 100) / 100).toFixed(2)} {currency}
                        </span>
                    </div>
                    <div className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                        <AdranlinkIcon size={18} />
                    </div>
                </div>
            </button>

            <LessonEventRow events={lesson.events} isExpanded={isExpanded} />
        </div>
    );
}
