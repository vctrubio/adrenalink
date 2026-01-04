"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import { ENTITY_DATA } from "@/config/entities";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { ClassboardData } from "@/backend/classboard/ClassboardModel";

interface BookingPaymentTabProps {
    data: ClassboardData;
    pricePerStudent: number;
    pricePerHour: number;
}

export const BookingPaymentTab = ({ data, pricePerStudent, pricePerHour }: BookingPaymentTabProps) => {
    const [copied, setCopied] = useState(false);

    const studentName = data.bookingStudents[0]?.student?.firstName || "Student";
    const packageHours = data.schoolPackage.durationMinutes / 60;
    const allEvents = data.lessons.flatMap((lesson) => lesson.events);
    const totalEventMinutes = allEvents.reduce((sum, e) => sum + e.duration, 0);
    const totalEventHours = totalEventMinutes / 60;
    const totalPrice = totalEventHours * pricePerHour;
    const startDate = new Date(data.booking.dateStart).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

    const receiptText = `Students: ${studentName}
Package Hours: ${packageHours}h
Total Kited Hours: ${totalEventHours}h
Price per Hour per Student: €${pricePerHour.toFixed(2)}
Total Price to Pay: €${totalPrice.toFixed(2)}
As of Date: ${startDate}

*** RECEIPT ***
${allEvents
            .map((event, i) => {
                const lesson = data.lessons.find((l) => l.events.some((e) => e.id === event.id));
                const teacherName = lesson?.teacher.firstName && lesson?.teacher.lastName ? `${lesson.teacher.firstName} ${lesson.teacher.lastName}` : lesson?.teacher.username || "Unknown";
                const eventDate = new Date(event.date).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" });
                const eventTime = new Date(event.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                const eventLocation = event.location || "No location";
                return `${i + 1}. ${teacherName}, ${eventDate}, ${eventTime}, ${getPrettyDuration(event.duration)}, ${eventLocation}`;
            })
            .join("\n")}`;

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(receiptText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");
    const packageColor = packageEntity?.color || "#fb923c";

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${packageColor}20`, color: packageColor }}>
                    <CreditIcon size={24} />
                </div>
                <div className="flex flex-col">
                    <div className="text-sm font-semibold text-foreground">Payment</div>
                    <div className="text-xs text-muted-foreground">Receipt</div>
                </div>
            </div>

            <div onClick={handleCopyToClipboard} className="flex items-start justify-between gap-4 cursor-pointer hover:bg-muted/10 transition-colors">
                <div className="flex-1 space-y-1 text-sm font-mono">
                    <div>
                        <span className="text-muted-foreground">Students:</span> <span className="text-foreground">{studentName}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Package Hours:</span> <span className="text-foreground">{packageHours}h</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Total Kited Hours:</span> <span className="text-foreground">{totalEventHours.toFixed(1)}h</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Price per Hour per Student:</span> <span className="text-foreground">€{pricePerHour.toFixed(2)}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Total Price to Pay:</span> <span className="text-foreground font-semibold">€{totalPrice.toFixed(2)}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">As of Date:</span> <span className="text-foreground">{startDate}</span>
                    </div>
                    <div className="pt-2 border-t border-border mt-2">
                        <span className="text-muted-foreground font-semibold">*** RECEIPT ***</span>
                    </div>
                    {allEvents.map((event, i) => {
                        const lesson = data.lessons.find((l) => l.events.some((e) => e.id === event.id));
                        const teacherName = lesson?.teacher.username || "Unknown";
                        const eventDate = new Date(event.date).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" });
                        const eventTime = new Date(event.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                        const eventLocation = event.location || "No location";
                        return (
                            <div key={event.id} className="text-xs text-muted-foreground">
                                {i + 1}. {teacherName}, {eventDate}, {eventTime}, {getPrettyDuration(event.duration)}, {eventLocation}
                            </div>
                        );
                    })}
                </div>
                <div className="flex-shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopyToClipboard();
                        }}
                        className="p-2 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={16} className="text-accent" /> : <Copy size={16} className="text-muted-foreground" />}
                    </button>
                </div>
            </div>
        </div>
    );
};
