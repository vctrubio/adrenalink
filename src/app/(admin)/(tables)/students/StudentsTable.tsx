"use client";

import { MasterTable, type ColumnDef, type MobileColumnDef } from "../MasterTable";
import { StudentStatusBadge } from "@/src/components/ui/badge";
import { SchoolStudentStatus } from "@/types/status";
import type { StudentTableData } from "@/config/tables";
import ReactCountryFlag from "react-country-flag";
import { StudentBookingActivityCard } from "./StudentBookingActivityCard";
import { COUNTRIES } from "@/config/countries";
import Link from "next/link";

const HEADER_CLASSES = {
    yellow: "px-4 py-3 font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10",
    blue: "px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    purple: "px-4 py-3 font-medium text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10",
    zinc: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    center: "px-4 py-3 font-medium text-center",
} as const;

export function StudentsTable({ students = [] }: { students: StudentTableData[] }) {
    const desktopColumns: ColumnDef<StudentTableData>[] = [
        {
            header: "Student Profile",
            headerClassName: HEADER_CLASSES.yellow,
            render: (data) => {
                const isActive = data.schoolStudentStatus === "active";
                return (
                    <div className="flex flex-col gap-1 items-start max-w-[400px]">
                        <Link href={`students/${data.id}`} className="flex items-center gap-2 group">
                            <span className="font-bold text-foreground text-sm normal-case group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">
                                {data.firstName} {data.lastName}
                            </span>
                            {data.schoolStudentDescription && <p className="text-xs text-muted-foreground/60 italic line-clamp-2 leading-relaxed">{data.schoolStudentDescription}</p>}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-black uppercase tracking-tight">
                            <div className="flex items-center" title={data.country}>
                                <ReactCountryFlag countryCode={getCountryCode(data.country)} svg style={{ width: "1.2em", height: "1.2em" }} />
                            </div>
                            <span className="tabular-nums">{data.phone}</span>
                            <span className="opacity-20 text-foreground">|</span>
                            <span className="tabular-nums">{data.id.slice(0, 8)}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            header: "Bookings & Progress",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => (
                <div className="flex flex-col gap-3 min-w-[320px] pr-2">
                    {data.bookings.map((booking) => (
                        <StudentBookingActivityCard key={booking.id} booking={booking} stats={booking.stats} />
                    ))}
                    {data.bookings.length === 0 && <span className="text-xs text-muted-foreground italic">No bookings</span>}
                </div>
            ),
        },
        {
            header: "Status",
            headerClassName: HEADER_CLASSES.center,
            render: (data) => (
                <div className="flex justify-center">
                    <StudentStatusBadge bookingCount={data.stats.totalBookings} durationHours={data.stats.totalDurationMinutes / 60} allBookingsCompleted={true} />
                </div>
            ),
        },
    ];

    const mobileColumns: MobileColumnDef<StudentTableData>[] = [
        {
            label: "Student",
            headerClassName: HEADER_CLASSES.yellow,
            render: (data) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${data.schoolStudentStatus === "active" ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                        <div className="font-bold text-sm">
                            {data.firstName} {data.lastName}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-black uppercase">
                        <ReactCountryFlag countryCode={getCountryCode(data.country)} svg style={{ width: "1em", height: "1em" }} />
                        <span className="opacity-20 text-foreground">|</span>
                        <span>{data.phone}</span>
                    </div>
                </div>
            ),
        },
        {
            label: "Progress",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => (
                <div className="flex flex-col gap-2 min-w-[200px] pr-1">
                    {data.bookings.map((booking) => (
                        <StudentBookingActivityCard key={booking.id} booking={booking} stats={booking.stats} />
                    ))}
                </div>
            ),
        },
        {
            label: "Status",
            headerClassName: HEADER_CLASSES.zinc,
            render: (data) => (
                <div className="scale-90 origin-right">
                    <StudentStatusBadge bookingCount={data.stats.totalBookings} durationHours={data.stats.totalDurationMinutes / 60} allBookingsCompleted={true} />
                </div>
            ),
        },
    ];

    return <MasterTable rows={students} columns={desktopColumns} mobileColumns={mobileColumns} groupBy="all" showGroupToggle={false} />;
}

// Helper to attempt mapping country name to code (simple fallback)
// Ideally this would use a robust library or the country code stored in DB if available
function getCountryCode(countryName: string): string {
    const country = COUNTRIES.find((c) => c.name.toLowerCase() === countryName.toLowerCase() || c.label.toLowerCase() === countryName.toLowerCase());
    return country?.code || "US";
}
