"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ENTITY_DATA } from "@/config/entities";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { StudentBookingActivityCard } from "@/src/app/(admin)/(tables)/students/StudentBookingActivityCard";
import { calculateBookingStats } from "@/backend/data/BookingData";
import { safeArray } from "@/backend/error-handlers";
import { type EventStatusFilter } from "@/src/components/timeline/TimelineHeader";
import { ToggleBar } from "@/src/components/ui/ToggleBar";
import { SearchInput } from "@/src/components/SearchInput";
import { SortDropdown } from "@/src/components/ui/SortDropdown";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { Inbox, Calendar } from "lucide-react";
import type { SortConfig, SortOption } from "@/types/sort";
import type { PackageData } from "@/backend/data/PackageData";
import type { StudentPackageRequest } from "@/supabase/server/student-package";
import { StudentPackageConfirmation } from "@/src/components/modals/StudentPackageConfirmation";
import { StudentPackageRequestRow } from "@/src/components/tables/StudentPackageRequestRow";

interface PackageRightColumnProps {
    packageData: PackageData;
}

type ViewMode = "requests" | "bookings";

const REQUEST_SORT_OPTIONS: SortOption[] = [
    { field: "created_at", direction: "desc", label: "Newest" },
    { field: "created_at", direction: "asc", label: "Oldest" },
    { field: "requested_date_start", direction: "desc", label: "Start Date" },
];

const BOOKING_SORT_OPTIONS: SortOption[] = [
    { field: "created_at", direction: "desc", label: "Newest" },
    { field: "date_start", direction: "desc", label: "Start Date" },
];

const REQUEST_FILTER_OPTIONS = ["All", "Requested", "Accepted", "Rejected"] as const;

export function PackageRightColumn({ packageData }: PackageRightColumnProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("requests");
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";
    const [selectedInvitation, setSelectedInvitation] = useState<StudentPackageRequest | null>(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [sort, setSort] = useState<SortConfig>({ field: "created_at", direction: "desc" });
    const [filter, setFilter] = useState<EventStatusFilter>("all");

    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;

    const formatCurrency = (num: number): string => {
        const rounded = Math.round(num * 100) / 100;
        return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
    };

    const requests = ((packageData as any).relations?.requests || []) as StudentPackageRequest[];
    const rawBookings = (packageData as any).relations?.bookings || [];
    const packageSchema = (packageData as any).schema || packageData;

    // Transform bookings to StudentBookingActivityCard format
    const transformedBookings = useMemo(() => {
        return rawBookings.map((booking: any) => {
            const schoolPackage = booking.school_package || packageSchema;
            const studentCount = schoolPackage?.capacity_students || 1;
            const pricePerHourPerStudent = schoolPackage?.duration_minutes > 0 
                ? schoolPackage.price_per_student / (schoolPackage.duration_minutes / 60) 
                : 0;

            // Transform lessons
            const lessons = safeArray(booking.lesson).map((l: any) => {
                const totalDuration = safeArray(l.event).reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
                const totalCount = safeArray(l.event).length;
                const recordedPayments = safeArray(l.teacher_lesson_payment).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

                return {
                    id: l.id,
                    teacherId: l.teacher?.id || "",
                    teacherUsername: l.teacher?.username || "",
                    status: l.status,
                    commission: {
                        type: (l.teacher_commission?.commission_type || "fixed") as "fixed" | "percentage",
                        cph: l.teacher_commission?.cph || "0",
                    },
                    events: {
                        totalCount,
                        totalDuration,
                        details: safeArray(l.event).map((e: any) => ({ status: e.status, duration: e.duration || 0 })),
                    },
                    teacherPayments: recordedPayments,
                    dateCreated: l.created_at || "",
                    category: schoolPackage?.category_equipment || "",
                    lessonRevenue: pricePerHourPerStudent * (totalDuration / 60) * studentCount,
                    leaderStudentName: booking.leader_student_name || "",
                    capacityStudents: studentCount,
                    bookingId: booking.id,
                };
            });

            // Transform payments
            const payments = safeArray(booking.student_booking_payment).map((p: any) => ({
                student_id: p.student_id ?? 0,
                amount: p.amount || 0,
            }));

            // Create package details
            const packageDetails = {
                description: schoolPackage?.description || "",
                categoryEquipment: schoolPackage?.category_equipment || "",
                capacityEquipment: schoolPackage?.capacity_equipment || 0,
                capacityStudents: schoolPackage?.capacity_students || 1,
                durationMinutes: schoolPackage?.duration_minutes || 60,
                pricePerStudent: schoolPackage?.price_per_student || 0,
                pph: pricePerHourPerStudent,
            };

            // Calculate stats
            const bookingDataForStats = {
                booking: {
                    id: booking.id,
                    dateStart: booking.date_start,
                    dateEnd: booking.date_end,
                    leaderStudentName: booking.leader_student_name || "",
                    status: booking.status,
                },
                package: packageDetails,
                lessons,
                payments,
            };
            const stats = calculateBookingStats(bookingDataForStats);

            return {
                id: booking.id,
                status: booking.status,
                dateStart: booking.date_start,
                dateEnd: booking.date_end,
                packageName: schoolPackage?.description || "",
                packageDetails,
                lessons,
                stats,
            };
        });
    }, [rawBookings, packageSchema]);

    const handleOpenModal = (invitation: StudentPackageRequest) => {
        setSelectedInvitation(invitation);
        setIsConfirmationModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsConfirmationModalOpen(false);
        setSelectedInvitation(null);
    };

    const handleConfirmationSuccess = () => {
        setIsConfirmationModalOpen(false);
        setSelectedInvitation(null);
    };

    const handleViewModeChange = useCallback((newMode: string) => {
        setViewMode(newMode as ViewMode);
        // Reset sort and filter to appropriate defaults for the new view
        if (newMode === "requests") {
            setSort({ field: "created_at", direction: "desc" });
            setFilter("all");
        } else if (newMode === "bookings") {
            setSort({ field: "created_at", direction: "desc" });
            setFilter("all");
        }
    }, []);

    // Filter and Sort data
    const processedData = useMemo(() => {
        if (viewMode === "requests") {
            let result = [...requests];
            if (filter !== "all") result = result.filter((r) => r.status === filter);
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                result = result.filter(
                    (r) => r.requested_clerk_id.toLowerCase().includes(query) || r.referral?.code.toLowerCase().includes(query),
                );
            }
            result.sort((a, b) => {
                const valA = new Date((a[sort.field as keyof typeof a] as string) || 0).getTime();
                const valB = new Date((b[sort.field as keyof typeof b] as string) || 0).getTime();
                return sort.direction === "desc" ? valB - valA : valA - valB;
            });
            return result;
        } else {
            let result = [...transformedBookings];
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                result = result.filter(
                    (b) => b.packageName.toLowerCase().includes(query) || b.id.toLowerCase().includes(query),
                );
            }
            result.sort((a, b) => {
                const valA = new Date((a[sort.field as keyof typeof a] as string) || 0).getTime();
                const valB = new Date((b[sort.field as keyof typeof b] as string) || 0).getTime();
                return sort.direction === "desc" ? valB - valA : valA - valB;
            });
            return result;
        }
    }, [viewMode, requests, transformedBookings, filter, sort, searchQuery]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-64">
                    <SearchInput
                        placeholder={viewMode === "requests" ? "Search requests by wallet or referral..." : "Search bookings by leader or ID..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        entityColor={packageEntity.color}
                    />
                </div>
                <SortDropdown
                    value={sort}
                    options={viewMode === "requests" ? REQUEST_SORT_OPTIONS : BOOKING_SORT_OPTIONS}
                    onChange={setSort}
                    entityColor={packageEntity.color}
                    toggleMode={true}
                />
                {viewMode === "requests" && (
                    <FilterDropdown
                        label="Status"
                        value={filter === "all" ? "All" : filter}
                        options={[...REQUEST_FILTER_OPTIONS]}
                        onChange={(value) => setFilter(value === "All" ? "all" : (value as EventStatusFilter))}
                        entityColor={packageEntity.color}
                    />
                )}
            </div>

            <ToggleBar
                value={viewMode}
                onChange={handleViewModeChange}
                options={[
                    { id: "requests", label: `Requests (${requests.length})`, icon: Inbox },
                    { id: "bookings", label: `Bookings (${transformedBookings.length})`, icon: Calendar },
                ]}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {viewMode === "requests" ? (
                        processedData.length > 0 ? (
                            <div className="w-full">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-separate border-spacing-y-4">
                                        <thead className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 tracking-widest font-bold">
                                            <tr>
                                                <th className="px-8 py-2 w-[48%]">Package Details</th>
                                                <th className="px-6 py-2 w-[32%]">Booking Dates</th>
                                                <th className="px-6 py-2 text-right w-[30%]">Request From</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(processedData as StudentPackageRequest[]).map((req) => (
                                                <StudentPackageRequestRow key={req.id} invitation={req} onAccept={() => handleOpenModal(req)} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                <p className="font-bold text-zinc-400 uppercase tracking-widest">No requests found</p>
                            </div>
                        )
                    ) : processedData.length > 0 ? (
                        <div className="space-y-4">
                            {processedData.map((booking: any) => (
                                <StudentBookingActivityCard key={booking.id} booking={booking} stats={booking.stats} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground bg-muted/5 rounded-2xl border-2 border-dashed border-border/50">
                            No bookings found
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Confirmation Modal */}
            {selectedInvitation && (
                <StudentPackageConfirmation
                    isOpen={isConfirmationModalOpen}
                    onClose={handleCloseModal}
                    invitation={selectedInvitation}
                    allInvitations={requests}
                    onSuccess={handleConfirmationSuccess}
                />
            )}
        </div>
    );
}
