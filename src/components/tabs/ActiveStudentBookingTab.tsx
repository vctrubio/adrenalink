"use client";

import { useState } from "react";
import Link from "next/link";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { ENTITY_DATA } from "@/config/entities";
import { getPrettyDuration } from "@/getters/duration-getter";
import { formatDate } from "@/getters/date-getter";
import { getEventStatusColor, STATUS_COLORS } from "@/types/status";
import { StudentTag } from "@/src/components/tags";
import { StudentBookingTabFooter, type TabType } from "./StudentBookingTabFooter";
import type { ActiveBookingModel } from "@/backend/models/ActiveBookingModel";

const DURATION_COLOR_FILL = "#f59e0b";

interface ActiveStudentBookingTabProps {
    booking: ActiveBookingModel;
}

interface StudentProgressBarProps {
    events: ActiveBookingModel["events"];
    totalMinutes: number;
}

// Sleek progress slider with status-based color segments using STATUS_COLORS
const StudentProgressBar = ({ events, totalMinutes }: StudentProgressBarProps) => {
    if (!totalMinutes || totalMinutes === 0) {
        return <span className="text-xs text-muted-foreground">N/A</span>;
    }

    // Calculate event minutes by status
    const eventMinutes = {
        completed: events.filter((e) => e.status === "completed").reduce((sum, e) => sum + e.duration, 0),
        planned: events.filter((e) => e.status === "planned").reduce((sum, e) => sum + e.duration, 0),
        tbc: events.filter((e) => e.status === "tbc").reduce((sum, e) => sum + e.duration, 0),
    };

    const totalUsedMinutes = eventMinutes.completed + eventMinutes.planned + eventMinutes.tbc;
    const extraMinutes = Math.max(0, totalUsedMinutes - totalMinutes);
    
    // Determine the denominator for percentage calculation
    const denominator = totalUsedMinutes > totalMinutes ? totalUsedMinutes : totalMinutes;

    const completedPercentage = (eventMinutes.completed / denominator) * 100;
    const plannedPercentage = (eventMinutes.planned / denominator) * 100;
    const tbcPercentage = (eventMinutes.tbc / denominator) * 100;

    // Calculate cumulative percentages for proper positioning
    const completedWidth = Math.min(completedPercentage, 100);
    const plannedWidth = Math.min(plannedPercentage, 100 - completedWidth);
    const tbcWidth = Math.min(tbcPercentage, 100 - completedWidth - plannedWidth);

    const totalUsedHours = Math.round((totalUsedMinutes / 60) * 10) / 10;
    const totalMinutesHours = Math.round((totalMinutes / 60) * 10) / 10;

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
                <div
                    className="h-3 rounded-full overflow-hidden border border-border bg-gray-100 dark:bg-gray-800 flex-1"
                >
                    {/* Completed minutes - using STATUS_COLORS.eventCompleted */}
                    <div
                        className="h-full transition-all duration-300 float-left"
                        style={{
                            width: `${completedWidth}%`,
                            backgroundColor: STATUS_COLORS.eventCompleted,
                        }}
                    />
                    {/* Planned minutes - using STATUS_COLORS.eventPlanned */}
                    <div
                        className="h-full transition-all duration-300 float-left"
                        style={{
                            width: `${plannedWidth}%`,
                            backgroundColor: STATUS_COLORS.eventPlanned,
                        }}
                    />
                    {/* TBC minutes - using STATUS_COLORS.eventTbc */}
                    <div
                        className="h-full transition-all duration-300 float-left"
                        style={{
                            width: `${tbcWidth}%`,
                            backgroundColor: STATUS_COLORS.eventTbc,
                        }}
                    />
                </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 text-xs text-muted-foreground">
                <span>
                    {totalUsedHours}/{totalMinutesHours} hrs
                </span>
                {extraMinutes > 0 && (
                    <span style={{ color: "#f59e0b" }} className="font-semibold">
                        +{Math.round((extraMinutes / 60) * 10) / 10}
                    </span>
                )}
            </div>
        </div>
    );
};

// Header component with icon, dates, and progress bar
interface BookingHeaderProps {
    booking: ActiveBookingModel;
    bookingColor?: string;
    dateStart: string;
    dateEnd: string;
}

const BookingHeader = ({ booking, bookingColor, dateStart, dateEnd }: BookingHeaderProps) => {
    return (
        <div className="flex items-start gap-3 mb-3">
            <Link href={`/bookings/${booking.id}`}>
                <div className="flex-shrink-0 p-2 border border-border rounded-lg" style={{ color: bookingColor }}>
                    <BookingIcon size={32} />
                </div>
            </Link>
            <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-foreground mb-2">
                    {dateStart} - {dateEnd}
                </div>
                {/* Progress Slider */}
                <StudentProgressBar events={booking.events} totalMinutes={booking.package.durationMinutes} />
            </div>
        </div>
    );
};

// Students section component
interface BookingStudentsProps {
    students: ActiveBookingModel["students"];
}

const BookingStudents = ({ students }: BookingStudentsProps) => {
    return (
        <div className="flex flex-wrap gap-2">
            {students.map((student) => (
                <StudentTag key={student.id} icon={<HelmetIcon size={16} />} firstName={student.firstName} lastName={student.lastName} id={student.id} />
            ))}
        </div>
    );
};

// Tab content component
interface BookingTabContentProps {
    booking: ActiveBookingModel;
    activeTab: TabType;
    pricePerStudent: number;
    pricePerHour: number;
    toPay: number;
    teacherColor?: string;
}

const BookingTabContent = ({ booking, activeTab, pricePerStudent, pricePerHour, toPay, teacherColor }: BookingTabContentProps) => {
    const hasPaid = 0;

    if (activeTab === "equipment") {
        return (
            <div className="p-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">{getPrettyDuration(booking.package.durationMinutes)}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Total:</span>
                        <p className="font-medium">${pricePerStudent.toFixed(2)}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Price per Student:</span>
                        <p className="font-medium">${pricePerStudent.toFixed(2)}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Price per Hour:</span>
                        <p className="font-medium">${pricePerHour.toFixed(2)}/hr</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">To Pay:</span>
                        <p className="font-medium">${toPay.toFixed(2)}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Has Paid:</span>
                        <p className="font-medium">${hasPaid.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === "events") {
        return (
            <div className="px-3 pb-2 pt-3 space-y-2 bg-muted/20">
                {booking.events.length === 0 ? (
                    <div className="text-xs text-muted-foreground px-3 py-2">No events scheduled</div>
                ) : (
                    booking.events.map((event) => {
                        const statusColor = getEventStatusColor(event.status);
                        return (
                            <div key={event.id} className="flex items-center justify-between text-xs py-1">
                                <div className="flex items-center gap-2">
                                    <div className="flex-shrink-0" style={{ color: statusColor }}>
                                        <FlagIcon size={14} />
                                    </div>
                                    <div className="text-muted-foreground">
                                        {new Date(event.date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "2-digit",
                                        })}{" "}
                                        {new Date(event.date).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                    {event.teacher && (
                                        <div className="flex items-center gap-1 ml-2">
                                            <div style={{ color: teacherColor }}>
                                                <HeadsetIcon size={12} />
                                            </div>
                                            <div className="text-xs font-medium text-foreground">{event.teacher.username}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 font-semibold" style={{ color: DURATION_COLOR_FILL }}>
                                    <DurationIcon size={12} />
                                    {getPrettyDuration(event.duration)}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        );
    }

    if (activeTab === "settings") {
        return (
            <div className="p-4 border-t border-border bg-muted/20">
                <div className="text-sm space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground mb-3">Booking Status</div>
                    {(["active", "completed", "uncompleted"] as const).map((status) => (
                        <button key={status} className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors capitalize ${booking.status === status ? "bg-accent text-accent-foreground font-medium" : "text-foreground hover:bg-accent/50"}`}>
                            {status}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return null;
};

export const ActiveStudentBookingTab = ({ booking }: ActiveStudentBookingTabProps) => {
    const [activeTab, setActiveTab] = useState<TabType>(null);

    const bookingEntityConfig = ENTITY_DATA.find((e) => e.id === "booking");
    const bookingColor = bookingEntityConfig?.color;

    const dateStart = formatDate(booking.dateStart);
    const dateEnd = formatDate(booking.dateEnd);

    // Calculate pricing
    const pricePerStudent = booking.package.pricePerStudent;
    const packageHours = booking.package.durationMinutes / 60;
    const pricePerHour = pricePerStudent / packageHours;
    const teacherColor = ENTITY_DATA.find((e) => e.id === "teacher")?.color;

    // Calculate to pay
    const completedMinutes = booking.events.filter((e) => e.status === "completed").reduce((sum, e) => sum + e.duration, 0);
    const completedHours = completedMinutes / 60;
    const toPay = completedHours * pricePerHour;

    return (
        <div className="w-[365px] flex-shrink-0 space-y-3">
            {/* Main Booking Card */}
            <div className="bg-card border border-border rounded-lg overflow-hidden hover:bg-accent/10 transition-colors">
                <div className="p-4">
                    {/* Header */}
                    <BookingHeader booking={booking} bookingColor={bookingColor} dateStart={dateStart} dateEnd={dateEnd} />

                    {/* Students */}
                    <BookingStudents students={booking.students} />
                </div>

                {/* Tab Footer */}
                <StudentBookingTabFooter booking={booking} activeTab={activeTab} onTabClick={setActiveTab} />

                {/* Tab Content */}
                <BookingTabContent booking={booking} activeTab={activeTab} pricePerStudent={pricePerStudent} pricePerHour={pricePerHour} toPay={toPay} teacherColor={teacherColor} />
            </div>
        </div>
    );
};
