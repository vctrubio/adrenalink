"use client";

import { motion } from "framer-motion";
import type { SchoolPackageModel } from "@/backend/models";
import { ENTITY_DATA } from "@/config/entities";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { calculateCommission, calculateLessonRevenue, type CommissionInfo } from "@/getters/commission-calculator";
import { StudentPackageCard, type StudentPackageData } from "@/src/components/ids";

// Sub-component: Summary Header
function SummaryHeader({ studentPackages, totalNet, currency, formatCurrency }: { studentPackages: StudentPackageData[]; totalNet: number; currency: string; formatCurrency: (num: number) => string }) {
    const requestedCount = studentPackages.filter((sp) => sp.status === "requested").length;
    const acceptedCount = studentPackages.filter((sp) => sp.status === "accepted").length;
    const rejectedCount = studentPackages.filter((sp) => sp.status === "rejected").length;

    return (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{studentPackages.length}</span>
                    <span className="text-muted-foreground">requests</span>
                </div>
                {requestedCount > 0 && (
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-amber-600 dark:text-amber-400">{requestedCount} pending</span>
                    </div>
                )}
                {acceptedCount > 0 && (
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-green-600 dark:text-green-400">{acceptedCount} accepted</span>
                    </div>
                )}
                {rejectedCount > 0 && (
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-red-600 dark:text-red-400">{rejectedCount} rejected</span>
                    </div>
                )}
            </div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(totalNet)} {currency} <span className="text-sm font-normal text-muted-foreground">net</span>
            </div>
        </div>
    );
}

// Main Component
interface PackageRightColumnProps {
    schoolPackage: SchoolPackageModel;
}

export function PackageRightColumn({ schoolPackage }: PackageRightColumnProps) {
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "EUR";

    const formatCurrency = (num: number): string => {
        const rounded = Math.round(num * 100) / 100;
        return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
    };

    const studentPackages = (schoolPackage.relations?.studentPackages || []) as StudentPackageData[];

    if (studentPackages.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                No package requests made yet
            </div>
        );
    }

    // Calculate total net across all bookings
    let totalNet = 0;
    studentPackages.forEach((sp) => {
        const bookings = sp.bookings || [];
        bookings.forEach((booking) => {
            const lessons = booking.lessons || [];
            const studentCount = booking.bookingStudents?.length || 1;
            const packageDurationMinutes = schoolPackage.schema.durationMinutes;
            const pricePerStudent = schoolPackage.schema.pricePerStudent;

            let totalDuration = 0;
            let teacherCommission = 0;

            lessons.forEach((lesson) => {
                const events = lesson.events || [];
                const lessonDuration = events.reduce((sum, e) => sum + (e.duration || 0), 0);
                const lessonRevenue = calculateLessonRevenue(pricePerStudent, studentCount, lessonDuration, packageDurationMinutes);

                const commissionType = (lesson.commission?.commissionType as "fixed" | "percentage") || "fixed";
                const cph = parseFloat(lesson.commission?.cph || "0");
                const commissionInfo: CommissionInfo = { type: commissionType, cph };
                const commission = calculateCommission(lessonDuration, commissionInfo, lessonRevenue, packageDurationMinutes);

                totalDuration += lessonDuration;
                teacherCommission += commission.earned;
            });

            const totalHours = totalDuration / 60;
            const totalRevenue = calculateLessonRevenue(pricePerStudent, studentCount, totalDuration, packageDurationMinutes);

            let referralCommission = 0;
            if (sp.referral) {
                const referralValue = parseFloat(sp.referral.commissionValue || "0");
                if (sp.referral.commissionType === "percentage") {
                    referralCommission = (referralValue / 100) * totalRevenue;
                } else {
                    referralCommission = referralValue * totalHours;
                }
            }

            totalNet += totalRevenue - teacherCommission - referralCommission;
        });
    });

    // Sort: pending first, then by date
    const sortedPackages = [...studentPackages].sort((a, b) => {
        if (a.status === "requested" && b.status !== "requested") return -1;
        if (b.status === "requested" && a.status !== "requested") return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className="space-y-4">
            <SummaryHeader studentPackages={studentPackages} totalNet={totalNet} currency={currency} formatCurrency={formatCurrency} />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {sortedPackages.map((studentPackage) => (
                    <StudentPackageCard
                        key={studentPackage.id}
                        studentPackage={studentPackage}
                        schoolPackage={schoolPackage}
                        formatCurrency={formatCurrency}
                        currency={currency}
                    />
                ))}
            </motion.div>
        </div>
    );
}
