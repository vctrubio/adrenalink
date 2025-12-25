"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { BookingModel } from "@/backend/models";
import { ENTITY_DATA } from "@/config/entities";
import { formatBookingReceiptText, formatBookingDate } from "@/getters/bookings-receipt-getter";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { Share2, Copy, Check } from "lucide-react";

export interface BookingReceiptEventRow {
    eventId: string;
    lessonId: string;
    date: Date;
    time: string;
    dateLabel: string;
    dayOfWeek: string;
    duration: number;
    durationLabel: string;
    location: string;
    teacherId: string;
    teacherName: string;
    teacherUsername: string;
    eventStatus: string;
    lessonStatus: string;
    teacherEarning: number;
    schoolRevenue: number;
    totalRevenue: number;
    commissionType: string;
    commissionCph: number;
}

interface BookingReceiptTotals {
    duration: number;
    teacherEarnings: number;
    schoolRevenue: number;
    totalRevenue: number;
}

interface BookingReceiptProps {
    booking: BookingModel;
    eventRows: BookingReceiptEventRow[];
    totals: BookingReceiptTotals;
    schoolPackage: any;
    formatCurrency: (num: number) => string;
    currency: string;
}

export function BookingReceipt({ booking, eventRows, totals, schoolPackage, formatCurrency, currency }: BookingReceiptProps) {
    const [copied, setCopied] = useState(false);
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;

    const packageDescription = schoolPackage?.description || "No Package";
    const packageHours = schoolPackage ? Math.round(schoolPackage.durationMinutes / 60) : 0;
    const packageCategory = schoolPackage?.categoryEquipment || "No Category";
    const equipmentCapacity = schoolPackage?.capacityEquipment || 0;
    const studentCapacity = schoolPackage?.capacityStudents || 0;
    const totalHours = totals.duration / 60;

    let packageTypeStr = packageCategory;
    if (equipmentCapacity > 1) {
        packageTypeStr += ` (x${equipmentCapacity})`;
    }

    const bookingStartDate = formatBookingDate(booking.schema.dateStart);
    const bookingEndDate = formatBookingDate(booking.schema.dateEnd);
    const pricePerStudent = studentCapacity > 1 ? totals.totalRevenue / studentCapacity : totals.totalRevenue;

    const bookingStudents = booking.relations?.bookingStudents || [];
    const students = bookingStudents.map((bs) => ({
        firstName: bs.student?.firstName || "Unknown",
        lastName: bs.student?.lastName || "",
        passport: bs.student?.passport || undefined,
    }));

    const receiptText = formatBookingReceiptText(bookingStartDate, bookingEndDate, students, packageDescription, packageHours, packageTypeStr, studentCapacity, totalHours, formatCurrency, totals.totalRevenue, pricePerStudent, eventRows);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(receiptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div key="receipt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="rounded-xl border border-border overflow-hidden bg-card">
                {/* Receipt Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Share2 size={20} className="text-primary" />
                        <span className="font-semibold">Receipt</span>
                    </div>
                    <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                        <span className={copied ? "text-green-600" : ""}>{copied ? "Copied!" : "Copy to clipboard"}</span>
                    </button>
                </div>
                <div className="p-5 bg-muted/20">
                    <pre className="font-mono text-sm whitespace-pre-wrap text-foreground leading-relaxed">{receiptText}</pre>
                </div>
            </div>
        </motion.div>
    );
}
