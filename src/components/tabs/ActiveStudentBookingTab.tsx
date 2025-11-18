"use client";

import { useState } from "react";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { ENTITY_DATA } from "@/config/entities";
import { getPrettyDuration, getDurationHours } from "@/getters/duration-getter";
import { getEventStatusColor, getProgressBarColor } from "@/types/status";
import { StudentTag } from "@/src/components/tags";
import { StudentBookingTabFooter, type TabType } from "./StudentBookingTabFooter";
import type { ActiveBookingModel } from "@/backend/models/ActiveBookingModel";

const DURATION_COLOR_FILL = "#f59e0b";

interface ActiveStudentBookingTabProps {
    booking: ActiveBookingModel;
}

// Sleek progress slider with status-based color
const StudentProgressBar = ({ completedMinutes, totalMinutes, events }: { completedMinutes: number; totalMinutes: number; events: ActiveBookingModel["events"] }) => {
    const progressPercent = Math.min((completedMinutes / totalMinutes) * 100, 100);
    const progressColor = getProgressBarColor(events);
    const completedHours = getDurationHours(completedMinutes);
    const totalHours = getDurationHours(totalMinutes);

    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden flex-1">
                <div className="h-full transition-all duration-500" style={{ width: `${progressPercent}%`, backgroundColor: progressColor }} />
            </div>
            <div className="text-xs text-muted-foreground font-medium flex-shrink-0">
                {completedHours}/{totalHours} hrs
            </div>
        </div>
    );
};

export const ActiveStudentBookingTab = ({ booking }: ActiveStudentBookingTabProps) => {
    const [activeTab, setActiveTab] = useState<TabType>(null);

    const bookingEntityConfig = ENTITY_DATA.find((e) => e.id === "booking");
    const bookingColor = bookingEntityConfig?.color;

    const dateStart = new Date(booking.dateStart).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit",
    });

    const dateEnd = new Date(booking.dateEnd).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit",
    });

    // Calculate pricing
    const pricePerStudent = booking.package.pricePerStudent;
    const packageHours = booking.package.durationMinutes / 60;
    const pricePerHour = pricePerStudent / packageHours;
    const completedMinutes = booking.totalEventDuration;
    const teacherColor = ENTITY_DATA.find((e) => e.id === "teacher")?.color;

    // Calculate to pay
    const completedHours = completedMinutes / 60;
    const toPay = completedHours * pricePerHour;
    const hasPaid = 0;

    return (
        <div className="w-[365px] flex-shrink-0 space-y-3">
            {/* Main Booking Card */}
            <div className="bg-card border border-border rounded-lg overflow-hidden hover:bg-accent/10 transition-colors">
                <div className="p-4">
                    {/* Header: Booking Icon + Dates */}
                    <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0 p-2 border border-border rounded-lg" style={{ color: bookingColor }}>
                            <BookingIcon size={32} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-base font-semibold text-foreground mb-2">
                                {dateStart} - {dateEnd}
                            </div>
                            {/* Progress Slider */}
                            <StudentProgressBar completedMinutes={completedMinutes} totalMinutes={booking.package.durationMinutes} events={booking.events} />
                        </div>
                    </div>

                    {/* Student Tags */}
                    <div className="flex flex-wrap gap-2">
                        {booking.students.map((student) => (
                            <StudentTag key={student.id} icon={<HelmetIcon size={16} />} firstName={student.firstName} lastName={student.lastName} id={student.id} />
                        ))}
                    </div>
                </div>

                {/* Tab Footer */}
                <StudentBookingTabFooter booking={booking} activeTab={activeTab} onTabClick={setActiveTab} />

                {/* Tab Content */}
                {activeTab === "equipment" && (
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
                )}

                {activeTab === "events" && (
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
                )}

                {activeTab === "settings" && (
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
                )}
            </div>
        </div>
    );
};
