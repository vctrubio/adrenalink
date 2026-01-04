"use client";

import Modal from "./Modal";
import type { TeacherQueue } from "@/backend/classboard/TeacherQueue";
import { getPrettyDuration } from "@/getters/duration-getter";
import { calculateLessonRevenue, calculateCommission, calculateSchoolProfit } from "@/getters/commission-calculator";

interface PricingDailyClassScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string;
    teacherQueues: TeacherQueue[];
}

export default function PricingDailyClassScheduleModal({
    isOpen,
    onClose,
    selectedDate,
    teacherQueues,
}: PricingDailyClassScheduleModalProps) {
    const formatCurrency = (num: number): string => {
        const rounded = Math.round(num * 100) / 100;
        return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
    };

    const formatEquipment = (category: string, capacity: number): string => {
        return capacity > 1 ? `${category} (x${capacity})` : category;
    };

    const allEvents = teacherQueues
        .flatMap((queue) => {
            const events = queue.getAllEvents();
            return events.map((eventNode) => {
                const studentCount = eventNode.studentData.length;
                const lessonRevenue = calculateLessonRevenue(
                    eventNode.packageData.pricePerStudent,
                    studentCount,
                    eventNode.eventData.duration,
                    eventNode.packageData.durationMinutes
                );
                const commissionCalc = calculateCommission(
                    eventNode.eventData.duration,
                    eventNode.commission,
                    lessonRevenue,
                    eventNode.packageData.durationMinutes
                );
                const schoolRevenue = calculateSchoolProfit(lessonRevenue, commissionCalc.earned);

                return {
                    time: new Date(eventNode.eventData.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    }),
                    timestamp: new Date(eventNode.eventData.date).getTime(),
                    duration: getPrettyDuration(eventNode.eventData.duration),
                    durationMinutes: eventNode.eventData.duration,
                    location: eventNode.eventData.location,
                    teacherName: queue.teacher.name,
                    studentNames: eventNode.studentData.map((s) => `${s.firstName} ${s.lastName}`).join(" & "),
                    packageDescription: eventNode.packageData.description,
                    equipment: formatEquipment(eventNode.packageData.categoryEquipment, eventNode.packageData.capacityEquipment),
                    studentCount,
                    teacherEarning: commissionCalc.earned,
                    schoolRevenue,
                    totalRevenue: lessonRevenue,
                };
            });
        })
        .sort((a, b) => a.timestamp - b.timestamp);

    const totals = allEvents.reduce(
        (acc, event) => ({
            duration: acc.duration + event.durationMinutes,
            teacherEarnings: acc.teacherEarnings + event.teacherEarning,
            schoolRevenue: acc.schoolRevenue + event.schoolRevenue,
            totalRevenue: acc.totalRevenue + event.totalRevenue,
        }),
        { duration: 0, teacherEarnings: 0, schoolRevenue: 0, totalRevenue: 0 }
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pricing Daily Class Schedule" maxWidth="5xl">
            <div className="space-y-4">
                <div className="text-sm text-muted-foreground pb-4 border-b border-border">
                    Pricing breakdown for <strong>{selectedDate}</strong>
                </div>

                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                            <tr className="border-b border-border">
                                <th className="p-3 text-left font-semibold">Time</th>
                                <th className="p-3 text-left font-semibold">Location</th>
                                <th className="p-3 text-left font-semibold">Package</th>
                                <th className="p-3 text-left font-semibold">Equipment</th>
                                <th className="p-3 text-left font-semibold">Students</th>
                                <th className="p-3 text-left font-semibold">Teacher</th>
                                <th className="p-3 text-left font-semibold">Duration</th>
                                <th className="p-3 text-right font-semibold">Teacher €</th>
                                <th className="p-3 text-right font-semibold">School €</th>
                                <th className="p-3 text-right font-semibold">Total €</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allEvents.map((event, idx) => (
                                <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                                    <td className="p-3 font-mono">{event.time}</td>
                                    <td className="p-3">{event.location}</td>
                                    <td className="p-3 text-muted-foreground">{event.packageDescription}</td>
                                    <td className="p-3">{event.equipment}</td>
                                    <td className="p-3">{event.studentNames}</td>
                                    <td className="p-3 font-medium">{event.teacherName}</td>
                                    <td className="p-3">{event.duration}</td>
                                    <td className="p-3 text-right font-mono text-green-600 dark:text-green-400">
                                        €{formatCurrency(event.teacherEarning)}
                                    </td>
                                    <td className="p-3 text-right font-mono text-orange-600 dark:text-orange-400">
                                        €{formatCurrency(event.schoolRevenue)}
                                    </td>
                                    <td className="p-3 text-right font-mono font-semibold">
                                        €{formatCurrency(event.totalRevenue)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="sticky bottom-0 bg-muted/90 backdrop-blur">
                            <tr className="border-t-2 border-border font-semibold">
                                <td colSpan={6} className="p-3 text-right">
                                    ** TOTAL **
                                </td>
                                <td className="p-3">
                                    {getPrettyDuration(totals.duration)}
                                </td>
                                <td className="p-3 text-right font-mono text-green-600 dark:text-green-400">
                                    €{formatCurrency(totals.teacherEarnings)}
                                </td>
                                <td className="p-3 text-right font-mono text-orange-600 dark:text-orange-400">
                                    €{formatCurrency(totals.schoolRevenue)}
                                </td>
                                <td className="p-3 text-right font-mono font-bold text-lg">
                                    €{formatCurrency(totals.totalRevenue)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border text-sm">
                    <div className="text-muted-foreground">
                        Total Events: <strong>{allEvents.length}</strong>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-green-600 dark:text-green-400">
                            Teacher: <strong>€{formatCurrency(totals.teacherEarnings)}</strong>
                        </div>
                        <div className="text-orange-600 dark:text-orange-400">
                            School: <strong>€{formatCurrency(totals.schoolRevenue)}</strong>
                        </div>
                        <div className="font-semibold">
                            Total: <strong>€{formatCurrency(totals.totalRevenue)}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
