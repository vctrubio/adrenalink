"use client";

import React, { useState } from "react";
import { Copy, Check, Mail, Share2 } from "lucide-react";
import { TransactionEventsTable, DUMMY_EXPORT } from "@/src/app/(admin)/(tables)/TransactionEventsTable";
import { TablesProvider } from "@/src/app/(admin)/(tables)/layout";
import type { StudentViewData, TeacherViewData } from "@/src/hooks/useClassboardShareExportData";
import type { TransactionEventData } from "@/types/transaction-event";
import { COUNTRIES } from "@/config/countries";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { getTimeAMPM } from "@/getters/date-getter";
import WhatsappIcon from "@/public/appSvgs/WhatsappIcon";

// --- Helper Components ---

function getCountryCode(countryName: string): string {
    const country = COUNTRIES.find(
        (c) => c.name.toLowerCase() === countryName.toLowerCase() || c.code.toLowerCase() === countryName.toLowerCase(),
    );
    return country ? country.code : "US";
}

function CopyButton({ text, schoolName, dateLabel }: { text: string; schoolName: string; dateLabel: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    const encodedText = encodeURIComponent(text);
    const encodedSubject = encodeURIComponent(`Schedule for ${dateLabel} - ${schoolName}`);

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
                title="Copy to clipboard"
            >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                <span className={copied ? "text-green-500" : ""}>{copied ? "Copied!" : "Copy"}</span>
            </button>
            <a
                href={`https://wa.me/?text=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-green-500 transition-colors"
                title="Share via WhatsApp"
            >
                <WhatsappIcon className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
            </a>
            <a
                href={`mailto:?subject=${encodedSubject}&body=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-blue-500 transition-colors"
                title="Share via Email"
            >
                <Mail size={14} />
                <span>Email</span>
            </a>
        </div>
    );
}

// --- Formatters ---

function formatDateRange(startDateStr: string, endDateStr: string): string {
    // Extract date part only (YYYY-MM-DD)
    const startDate = startDateStr.split(" ")[0];
    const endDate = endDateStr.split(" ")[0];

    const start = new Date(startDate);
    const end = new Date(endDate);

    const startFormatted = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endFormatted = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Check if dates are the same day
    if (start.toDateString() === end.toDateString()) {
        return `${startFormatted} (1 day)`;
    }

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffDaysText = `+${diffDays + 1}`;

    return `${startFormatted} - ${endFormatted} (${diffDaysText})`;
}

function formatStudentText(bookings: StudentViewData[], schoolName: string, timezone: string, dateLabel: string): string {
    if (!bookings.length) return "No bookings available.";

    const header = `📅 SCHEDULE FOR ${dateLabel.toUpperCase()}
🏢 ${schoolName.toUpperCase()} | 🌎 ${timezone}

========================================\n\n`;

    return (
        header +
        bookings
            .map((booking) => {
                const studentsList = booking.students
                    .map(
                        (s) =>
                            `- ${s.firstName} ${s.lastName} ${getCountryFlagEmoji(s.country)}${s.passport ? ` [${s.passport}]` : ""}`,
                    )
                    .join("\n");

                const dateRangeParts = booking.dateRange.split(" to ");
                const datesFormatted =
                    dateRangeParts.length === 2 ? formatDateRange(dateRangeParts[0], dateRangeParts[1]) : booking.dateRange;

                const capacityStr = booking.packageInfo.capacityEquipment > 1 ? ` (x${booking.packageInfo.capacityEquipment})` : "";

                return `CONFIRMATION #${booking.iteration}
----------------------------------------
Dates: ${datesFormatted}
Package: ${capitalize(booking.packageInfo.categoryEquipment)}${capacityStr} > ${booking.packageInfo.durationFormatted}

Students:
${studentsList}`;
            })
            .join("\n\n========================================\n\n")
    );
}

function formatTeacherText(teachers: TeacherViewData[], dateLabel: string, schoolName: string, timezone: string): string {
    if (!teachers.length) return "No classes scheduled.";

    return `📅 SCHEDULE FOR ${dateLabel.toUpperCase()}
🏢 ${schoolName.toUpperCase()} | 🌎 ${timezone}

${teachers
    .map((teacher) => {
        const eventsList = teacher.events
            .map((e) => {
                const studentsFormatted = e.studentNames.map((name, i) => `  ${i + 1}. ${name}`).join("\n");
                return `- ${getTimeAMPM(e.time)} 📍 ${e.location} 🕒 ${e.durationFormatted}\n${studentsFormatted}`;
            })
            .join("\n\n");

        return `${teacher.teacherUsername.toUpperCase()}
${eventsList}`;
    })
    .join("\n\n----------------------------------------\n\n")}`;
}

// Helper for emojis (since we can't use the React component in text)
function getCountryFlagEmoji(countryCodeOrName: string): string {
    const code = getCountryCode(countryCodeOrName);
    return code.toUpperCase().replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Sub-components: Views ---

function AdminView({ events }: { events: TransactionEventData[] }) {
    return (
        <TablesProvider>
            <TransactionEventsTable events={events} groupBy="all" enableTableLogic={false} />
        </TablesProvider>
    );
}

function StudentView({
    bookings,
    schoolName,
    timezone,
    dateLabel,
}: {
    bookings: StudentViewData[];
    schoolName: string;
    timezone: string;
    dateLabel: string;
}) {
    if (bookings.length === 0) return <EmptyState role="student" />;

    const textToCopy = formatStudentText(bookings, schoolName, timezone, dateLabel);

    return (
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 p-8 sm:p-12 shadow-lg rounded-lg font-serif text-zinc-800 dark:text-zinc-200">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 pb-4 mb-8">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Student Confirmation</h2>
                <CopyButton text={textToCopy} schoolName={schoolName} dateLabel={dateLabel} />
            </div>

            <div className="mb-8 text-sm">
                <p className="font-semibold">📅 SCHEDULE FOR {dateLabel.toUpperCase()}</p>
                <p className="text-zinc-600 dark:text-zinc-400">
                    🏢 {schoolName.toUpperCase()} | 🌎 {timezone}
                </p>
            </div>

            {bookings.map((booking, index) => {
                const dateRangeParts = booking.dateRange.split(" to ");
                const datesFormatted =
                    dateRangeParts.length === 2 ? formatDateRange(dateRangeParts[0], dateRangeParts[1]) : booking.dateRange;

                const capacityStr = booking.packageInfo.capacityEquipment > 1 ? ` (x${booking.packageInfo.capacityEquipment})` : "";

                return (
                    <div key={booking.bookingId} className="mb-6">
                        <h3 className="font-bold mb-4 text-zinc-900 dark:text-zinc-100">CONFIRMATION #{booking.iteration}</h3>
                        <div className="pl-4 border-l-2 border-zinc-200 dark:border-zinc-700 space-y-3">
                            <div className="flex justify-between py-1">
                                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Dates:</span>
                                <span className="text-sm text-right">{datesFormatted}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Package:</span>
                                <span className="text-sm text-right">{`${capitalize(booking.packageInfo.categoryEquipment)}${capacityStr} > ${booking.packageInfo.durationFormatted}`}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Students:</span>
                                <div className="text-right">
                                    {booking.students.map((s) => (
                                        <p key={s.id} className="text-sm">
                                            {s.firstName} {s.lastName} {getCountryFlagEmoji(s.country)}{" "}
                                            {s.passport ? `[${s.passport}]` : ""}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {index < bookings.length - 1 && <hr className="my-8 border-dashed border-zinc-300 dark:border-zinc-600" />}
                    </div>
                );
            })}
        </div>
    );
}

function TeacherView({
    teachers,
    dateLabel,
    schoolName,
    timezone,
}: {
    teachers: TeacherViewData[];
    dateLabel: string;
    schoolName: string;
    timezone: string;
}) {
    if (teachers.length === 0) return <EmptyState role="teacher" />;

    const textToCopy = formatTeacherText(teachers, dateLabel, schoolName, timezone);

    return (
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 p-8 sm:p-12 shadow-lg rounded-lg font-serif text-zinc-800 dark:text-zinc-200">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 pb-4 mb-8">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Teacher Schedule</h2>
                <CopyButton text={textToCopy} schoolName={schoolName} dateLabel={dateLabel} />
            </div>

            <div className="mb-8 text-sm">
                <p className="font-semibold">📅 SCHEDULE FOR {dateLabel.toUpperCase()}</p>
                <p className="text-zinc-600 dark:text-zinc-400">
                    🏢 {schoolName.toUpperCase()} | 🌎 {timezone}
                </p>
            </div>

            {teachers.map((teacher, index) => (
                <div key={teacher.teacherId} className="mb-6">
                    <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-zinc-100">
                        {teacher.teacherUsername.toUpperCase()}
                    </h3>

                    <div className="space-y-4">
                        {teacher.events.map((event) => (
                            <div key={event.id} className="pl-4">
                                <p className="text-sm">
                                    - {getTimeAMPM(event.time)} 📍 {event.location} 🕒 {event.durationFormatted}
                                </p>
                                <div className="pl-6 pt-1">
                                    {event.studentNames.map((name, i) => (
                                        <p key={i} className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {i + 1}. {name}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {index < teachers.length - 1 && <hr className="my-8 border-dashed border-zinc-300 dark:border-zinc-600" />}
                </div>
            ))}
        </div>
    );
}

// --- Common UI ---

function EmptyState({ role }: { role: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <p className="font-bold uppercase tracking-widest text-xs opacity-50">No Data Available</p>
            <p className="text-sm italic">No {role} data found for the selected date.</p>
        </div>
    );
}

// --- Main Component ---

interface ShareContentBoardProps {
    mode: "admin" | "student" | "teacher";
    adminData: TransactionEventData[];
    studentData: StudentViewData[];
    teacherData: TeacherViewData[];
    selectedDate: string;
}

export function ShareContentBoard({ mode, adminData, studentData, teacherData, selectedDate }: ShareContentBoardProps) {
    const credentials = useSchoolCredentials();
    const dateLabel = new Date(selectedDate).toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    switch (mode) {
        case "admin":
            return <AdminView events={adminData} />;
        case "student":
            return (
                <StudentView
                    bookings={studentData}
                    schoolName={credentials.name}
                    timezone={credentials.timezone || "UTC"}
                    dateLabel={dateLabel}
                />
            );
        case "teacher":
            return (
                <TeacherView
                    teachers={teacherData}
                    dateLabel={dateLabel}
                    schoolName={credentials.name}
                    timezone={credentials.timezone || "UTC"}
                />
            );
        default:
            return null;
    }
}
