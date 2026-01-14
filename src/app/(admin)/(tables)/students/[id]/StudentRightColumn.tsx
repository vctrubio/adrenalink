"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { StudentData } from "@/backend/data/StudentData";
import { TimelineHeader, type EventStatusFilter } from "@/src/components/timeline/TimelineHeader";
import type { SortConfig, SortOption } from "@/types/sort";
import { StudentBookingActivityCard } from "../StudentBookingActivityCard";
import { calculateBookingStats } from "@/backend/data/BookingData";
import type { LessonWithPayments, BookingStudentPayments } from "@/config/tables";

// Main Component
interface StudentRightColumnProps {
    student: StudentData;
}

const SORT_OPTIONS: SortOption[] = [
    { field: "created_at", direction: "desc", label: "Newest" },
    { field: "created_at", direction: "asc", label: "Oldest" },
    { field: "date_start", direction: "desc", label: "Start Date" },
];

const FILTER_OPTIONS = ["All", "Active", "Completed", "Uncompleted"];

export function StudentRightColumn({ student }: StudentRightColumnProps) {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortConfig>({ field: "date_start", direction: "desc" });
    const [filter, setFilter] = useState<EventStatusFilter>("all");

    const bookings = student.relations?.bookings || [];

    // Transform bookings to match StudentBookingActivityCard format (same as StudentsTable)
    const transformedBookings = useMemo(() => {
        return bookings.map((b: any) => {
            const pkg = b.school_package;
            if (!pkg) return null;

            // Transform lessons to LessonWithPayments format
            const lessons: LessonWithPayments[] = (b.lessons || []).map((l: any) => {
                const events = l.event || l.events || [];
                const totalDuration = events.reduce((sum: number, e: any) => sum + (e.duration || 0), 0);

                return {
                    id: l.id,
                    teacherId: l.teacher?.id || "",
                    teacherUsername: l.teacher?.username || "unknown",
                    status: l.status,
                    commission: {
                        type: (l.teacher_commission?.commission_type as "fixed" | "percentage") || "fixed",
                        cph: l.teacher_commission?.cph || "0",
                    },
                    events: {
                        totalCount: events.length,
                        totalDuration: totalDuration,
                        details: events.map((e: any) => ({ status: e.status, duration: e.duration || 0 })),
                    },
                    teacherPayments: 0, // Can be added if teacher_lesson_payment is available
                };
            });

            // Transform payments
            const payments: BookingStudentPayments[] = (b.student_booking_payment || []).map((p: any) => ({
                student_id: 0,
                amount: p.amount,
            }));

            // Calculate stats using the same function as StudentsTable
            const bookingData = {
                package: {
                    description: pkg.description,
                    categoryEquipment: pkg.category_equipment,
                    capacityEquipment: pkg.capacity_equipment,
                    capacityStudents: pkg.capacity_students,
                    durationMinutes: pkg.duration_minutes,
                    pricePerStudent: pkg.price_per_student,
                    pph: pkg.duration_minutes > 0 ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0,
                },
                lessons,
                payments,
            };

            const stats = calculateBookingStats(bookingData as any);

            return {
                id: b.id,
                status: b.status,
                dateStart: b.date_start,
                dateEnd: b.date_end,
                packageName: pkg.description,
                packageDetails: bookingData.package,
                lessons,
                stats,
            };
        }).filter((b: any) => b !== null);
    }, [bookings]);

    // Filter and Sort Bookings
    const filteredBookings = useMemo(() => {
        let result = [...transformedBookings];

        // Filter by status
        if (filter !== "all") {
            result = result.filter((b) => b.status === filter);
        }

        // Search filter
        if (search) {
            const query = search.toLowerCase();
            result = result.filter((b) => {
                const packageMatch = b.packageName?.toLowerCase().includes(query);
                return packageMatch;
            });
        }

        // Sort
        result.sort((a, b) => {
            let valA: number, valB: number;

            if (sort.field === "created_at") {
                // Note: created_at not available in transformed format, using dateStart as fallback
                valA = new Date(a.dateStart || 0).getTime();
                valB = new Date(b.dateStart || 0).getTime();
            } else {
                // Default to date_start
                valA = new Date(a.dateStart || 0).getTime();
                valB = new Date(b.dateStart || 0).getTime();
            }

            return sort.direction === "desc" ? valB - valA : valA - valB;
        });

        return result;
    }, [transformedBookings, filter, sort, search]);

    if (bookings.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground italic bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                No bookings found for this student
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <TimelineHeader
                search={search}
                onSearchChange={setSearch}
                sort={sort}
                onSortChange={setSort}
                filter={filter}
                onFilterChange={(v) => setFilter(v as EventStatusFilter)}
                searchPlaceholder="Search bookings..."
                sortOptions={SORT_OPTIONS}
                filterOptions={FILTER_OPTIONS}
            />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {filteredBookings.map((booking) => (
                    <StudentBookingActivityCard key={booking.id} booking={booking} stats={booking.stats} />
                ))}
                {filteredBookings.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground bg-muted/5 rounded-xl border border-border/50">
                        No bookings match your filters
                    </div>
                )}
            </motion.div>
        </div>
    );
}
