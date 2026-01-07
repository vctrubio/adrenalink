"use client";

import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { COUNTRIES } from "@/config/countries";
import { ENTITY_DATA } from "@/config/entities";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { MasterTable, type ColumnDef, type MobileColumnDef, type GroupStats, type GroupingType } from "../MasterTable";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { SchoolStudentStatusLabel } from "@/src/components/labels/SchoolStudentStatusLabel";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { StudentStatusBadge } from "@/src/components/ui/badge";
import { SportActivityList } from "@/src/components/ui/badge/sport-activity";
import { getHMDuration } from "@/getters/duration-getter";
import type { StudentTableData } from "@/supabase/server/students";
import { SchoolStudentStatus, BOOKING_STATUS_CONFIG, type BookingStatus } from "@/types/status";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import ReactCountryFlag from "react-country-flag";
import { TrendingUp, TrendingDown, Check } from "lucide-react";

const HEADER_CLASSES = {
    yellow: "px-4 py-3 font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10",
    blue: "px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    purple: "px-4 py-3 font-medium text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10",
    zincRight: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right",
    center: "px-4 py-3 font-medium text-center",
} as const;

export function StudentsTable({ students = [] }: { students: StudentTableData[] }) {
    const desktopColumns: ColumnDef<StudentTableData>[] = [
        {
            header: "Student Profile",
            headerClassName: HEADER_CLASSES.yellow,
            render: (data) => (
                <div className="flex flex-col gap-1.5 items-start">
                    <div className="flex items-center gap-3">
                        <HoverToEntity entity={ENTITY_DATA.find(e => e.id === "student")!} id={data.studentId}>
                            <span className="font-bold text-foreground whitespace-nowrap">{data.firstName} {data.lastName}</span>
                        </HoverToEntity>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1" title={data.country}>
                                <ReactCountryFlag countryCode={getCountryCode(data.country)} svg style={{ width: '1em', height: '1em' }} />
                                <span>{data.country}</span>
                            </div>
                            <span>•</span>
                            <span className="truncate max-w-[150px]">{data.languages.join(", ")}</span>
                        </div>
                    </div>
                    <SchoolStudentStatusLabel 
                        studentId={data.studentId} 
                        status={data.schoolStudentStatus as SchoolStudentStatus} 
                        description={data.schoolStudentDescription} 
                    />
                </div>
            ),
        },
        {
            header: "Status",
            headerClassName: HEADER_CLASSES.yellow,
            render: (data) => (
                <StudentStatusBadge 
                    bookingCount={data.summaryStats.bookingCount} 
                    durationHours={data.summaryStats.durationHours} 
                    allBookingsCompleted={data.summaryStats.allBookingsCompleted} 
                />
            ),
        },
        {
            header: "EQUIPMENT",
            headerClassName: HEADER_CLASSES.purple,
            render: (data) => <span className="text-zinc-400 text-[10px] font-bold">-</span>, // Placeholder for student equipment
        },
        {
            header: "Activity",
            headerClassName: HEADER_CLASSES.purple,
            render: (data) => <SportActivityList stats={data.activityStats} />,
        },
        {
            header: "Bookings & Activity",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => (
                <div className="flex flex-col gap-3">
                    {data.bookings.map((booking) => {
                        const balance = booking.totalPayments - booking.expectedRevenue;
                        const isPaid = balance >= -1; // Tolerance for floating point
                        const statusConfig = BOOKING_STATUS_CONFIG[booking.status as BookingStatus];

                        return (
                            <div key={booking.id} className="p-2 rounded-lg bg-blue-50/30 dark:bg-blue-900/5 border border-blue-100 dark:border-blue-900/20 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <DateRangeBadge startDate={booking.dateStart} endDate={booking.dateEnd} />
                                    {statusConfig && (
                                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter" style={{ backgroundColor: `${statusConfig.color}15`, color: statusConfig.color }}>
                                            {booking.status === "completed" && <Check size={8} strokeWidth={4} />}
                                            {statusConfig.label}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300 italic">{booking.packageName}</span>
                                    {isPaid ? (
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <Check size={10} strokeWidth={3} /> Paid
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-900/30 px-1.5 py-0.5 rounded">
                                            {Math.abs(balance).toFixed(0)} due
                                        </span>
                                    )}
                                </div>
                                
                                <EquipmentStudentPackagePriceBadge
                                    categoryEquipment={booking.packageDetails.categoryEquipment}
                                    equipmentCapacity={booking.packageDetails.capacityEquipment}
                                    studentCapacity={booking.packageDetails.capacityStudents}
                                    packageDurationHours={booking.packageDetails.durationMinutes / 60}
                                    pricePerHour={booking.packageDetails.pricePerStudent / (booking.packageDetails.durationMinutes / 60)}
                                />

                                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-blue-100 dark:border-blue-900/20">
                                    <div className="flex items-center gap-1">
                                        <FlagIcon size={12} />
                                        <span>{booking.eventCount}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <DurationIcon size={12} />
                                        <span>{getHMDuration(booking.totalDurationHours * 60)}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 ml-auto font-medium">
                                        <span className="text-muted-foreground">Paid:</span>
                                        <span className="text-foreground">{booking.totalPayments.toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {data.bookings.length === 0 && <span className="text-xs text-muted-foreground italic">No bookings</span>}
                </div>
            ),
        },
        {
            header: "Financial Status",
            headerClassName: HEADER_CLASSES.zincRight,
            render: (data) => {
                const totalPaid = data.bookings.reduce((sum, b) => sum + b.totalPayments, 0);
                const totalExpected = data.bookings.reduce((sum, b) => sum + b.expectedRevenue, 0);
                const net = totalPaid - totalExpected;
                
                // net > 0 means paid more than expected (Overpaid)
                // net < 0 means paid less than expected (To Pay)
                // net ~ 0 means Settled

                const isSettled = Math.abs(net) < 1;
                const isOverpaid = net >= 1;
                
                return (
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Paid:</span>
                            <span className="text-sm font-bold text-foreground">{totalPaid.toFixed(0)}</span>
                        </div>
                        
                        {isSettled ? (
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-600">
                                <Check size={12} strokeWidth={3} />
                                <span className="text-xs font-black uppercase tracking-tight">Settled</span>
                            </div>
                        ) : (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded ${isOverpaid ? "bg-blue-500/10 text-blue-600" : "bg-rose-500/10 text-rose-600"}`}>
                                {isOverpaid ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                <span className="text-xs font-black">
                                    {Math.abs(net).toFixed(0)} {isOverpaid ? "overpaid" : "to pay"}
                                </span>
                            </div>
                        )}
                    </div>
                );
            },
        },
    ];

    const mobileColumns: MobileColumnDef<StudentTableData>[] = [
        {
            label: "Student",
            render: (data) => (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                        <HoverToEntity entity={ENTITY_DATA.find(e => e.id === "student")!} id={data.studentId}>
                            <div className="font-bold text-sm">{data.firstName} {data.lastName}</div>
                        </HoverToEntity>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ReactCountryFlag countryCode={getCountryCode(data.country)} svg style={{ width: '1em', height: '1em' }} />
                            <span>{data.country}</span>
                        </div>
                    </div>
                    <div className="scale-90 origin-left">
                        <StudentStatusBadge 
                            bookingCount={data.summaryStats.bookingCount} 
                            durationHours={data.summaryStats.durationHours} 
                            allBookingsCompleted={data.summaryStats.allBookingsCompleted} 
                        />
                    </div>
                </div>
            ),
        },
        {
            label: "Balance",
            render: (data) => {
                const totalPaid = data.bookings.reduce((sum, b) => sum + b.totalPayments, 0);
                const totalExpected = data.bookings.reduce((sum, b) => sum + b.expectedRevenue, 0);
                const net = totalPaid - totalExpected;
                const isPositive = net >= -1;

                return (
                    <span className={`text-xs font-black ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                        {net > 0 ? "+" : ""}{net.toFixed(0)}
                    </span>
                );
            },
        },
        {
            label: "Status",
            render: (data) => (
                <SchoolStudentStatusLabel 
                    studentId={data.studentId} 
                    status={data.schoolStudentStatus as SchoolStudentStatus} 
                    description={null} 
                />
            ),
        },
    ];

    return (
        <MasterTable
            rows={students}
            columns={desktopColumns}
            mobileColumns={mobileColumns}
            groupBy="all"
            showGroupToggle={false}
        />
    );
}

// Helper to attempt mapping country name to code (simple fallback)
// Ideally this would use a robust library or the country code stored in DB if available
function getCountryCode(countryName: string): string {
    const country = COUNTRIES.find(c => c.name.toLowerCase() === countryName.toLowerCase() || c.label.toLowerCase() === countryName.toLowerCase());
    return country?.code || "US";
}
