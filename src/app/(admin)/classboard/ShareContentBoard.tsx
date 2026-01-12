"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { TransactionEventsTable } from "@/src/app/(admin)/(tables)/TransactionEventsTable";
import { TablesProvider } from "@/src/app/(admin)/(tables)/layout";
import type { StudentViewData, TeacherViewData } from "@/src/hooks/useClassboardShareExportData";
import type { TransactionEventData } from "@/types/transaction-event";
import { COUNTRIES } from "@/config/countries";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";

// --- Helper Components ---

function getCountryCode(countryName: string): string {
    const country = COUNTRIES.find(
        (c) => c.name.toLowerCase() === countryName.toLowerCase() || c.code.toLowerCase() === countryName.toLowerCase()
    );
    return country ? country.code : "US";
}

function ShareTextAction({ text, label }: { text: string; label: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } else {
                // Fallback for non-secure contexts or older browsers
                const textArea = document.createElement("textarea");
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand("copy");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                    console.error("Fallback: Oops, unable to copy", err);
                }
                document.body.removeChild(textArea);
            }
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden mb-6 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/50">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
                >
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    <span className={copied ? "text-green-600" : ""}>{copied ? "Copied!" : "Copy Text"}</span>
                </button>
            </div>
            <div className="p-6 bg-card">
                <pre className="font-mono text-sm whitespace-pre-wrap text-foreground leading-relaxed">
                    {text}
                </pre>
            </div>
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

    return header + bookings
        .map((booking) => {
            const studentsList = booking.students
                .map((s) => `- ${s.firstName} ${s.lastName} ${getCountryFlagEmoji(s.country)}${s.passport ? ` [${s.passport}]` : ""}`)
                .join("\n");

            const dateRangeParts = booking.dateRange.split(" to ");
            const datesFormatted = dateRangeParts.length === 2 
                ? formatDateRange(dateRangeParts[0], dateRangeParts[1]) 
                : booking.dateRange;

            const capacityStr = booking.packageInfo.capacityEquipment > 1 
                ? ` (x${booking.packageInfo.capacityEquipment})` 
                : "";

            return `CONFIRMATION #${booking.iteration}
----------------------------------------
Dates: ${datesFormatted}
Package: ${capitalize(booking.packageInfo.categoryEquipment)}${capacityStr} > ${booking.packageInfo.durationFormatted}

Students:
${studentsList}`;
        })
        .join("\n\n========================================\n\n");
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
                return `- ${e.time} 📍 ${e.location} 🕒 ${e.durationFormatted}\n${studentsFormatted}`;
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
    return code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Sub-components: Views ---

function AdminView({ events }: { events: TransactionEventData[] }) {
    return (
        <TablesProvider>
            <TransactionEventsTable events={events} groupBy="all" />
        </TablesProvider>
    );
}

function StudentView({ bookings, schoolName, timezone, dateLabel }: { bookings: StudentViewData[]; schoolName: string; timezone: string; dateLabel: string }) {
    if (bookings.length === 0) return <EmptyState role="student" />;
    const text = formatStudentText(bookings, schoolName, timezone, dateLabel);
    return (
        <div className="max-w-3xl mx-auto p-4">
            <ShareTextAction text={text} label="Student Confirmation Text" />
        </div>
    );
}

function TeacherView({ 
    teachers, 
    dateLabel, 
    schoolName, 
    timezone 
}: { 
    teachers: TeacherViewData[]; 
    dateLabel: string;
    schoolName: string;
    timezone: string;
}) {
    if (teachers.length === 0) return <EmptyState role="teacher" />;
    const text = formatTeacherText(teachers, dateLabel, schoolName, timezone);
    return (
        <div className="max-w-3xl mx-auto p-4">
            <ShareTextAction text={text} label="Teacher Schedule Text" />
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
            return <StudentView bookings={studentData} schoolName={credentials.name} timezone={credentials.timezone || "UTC"} dateLabel={dateLabel} />;
        case "teacher":
            return <TeacherView teachers={teacherData} dateLabel={dateLabel} schoolName={credentials.name} timezone={credentials.timezone || "UTC"} />;
        default:
            return null;
    }
}