"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ENTITY_DATA } from "@/config/entities";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { StudentPackageCard } from "@/src/components/ids/PackageRequestBookingContainer";
import { FullBookingCard } from "@/src/components/ids/FullBookingContainer";
import { TimelineHeader, type EventStatusFilter } from "@/src/components/timeline/TimelineHeader";
import { ToggleBar } from "@/src/components/ui/ToggleBar";
import { Inbox, Calendar } from "lucide-react";
import type { SortConfig, SortOption } from "@/types/sort";
import type { PackageData } from "@/backend/data/PackageData";

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

const FILTER_OPTIONS = ["All", "Requested", "Accepted", "Rejected"];

export function PackageRightColumn({ packageData }: PackageRightColumnProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("requests");
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortConfig>({ field: "created_at", direction: "desc" });
    const [filter, setFilter] = useState<EventStatusFilter>("all");

    const formatCurrency = (num: number): string => {
        const rounded = Math.round(num * 100) / 100;
        return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
    };

    const requests = packageData.relations?.requests || [];
    const bookings = packageData.relations?.bookings || [];

    // Filter and Sort data
    const processedData = useMemo(() => {
        if (viewMode === "requests") {
            let result = [...requests];
            if (filter !== "all") result = result.filter((r) => r.status === filter);
            if (search) {
                const query = search.toLowerCase();
                result = result.filter((r) => r.wallet_id.toLowerCase().includes(query) || r.referral?.code.toLowerCase().includes(query));
            }
            result.sort((a, b) => {
                const valA = new Date(a[sort.field as keyof typeof a] as string || 0).getTime();
                const valB = new Date(b[sort.field as keyof typeof b] as string || 0).getTime();
                return sort.direction === "desc" ? valB - valA : valA - valB;
            });
            return result;
        } else {
            let result = [...bookings];
            if (search) {
                const query = search.toLowerCase();
                result = result.filter((b) => b.leader_student_name.toLowerCase().includes(query) || b.id.toLowerCase().includes(query));
            }
            result.sort((a, b) => {
                const valA = new Date(a[sort.field as keyof typeof a] as string || 0).getTime();
                const valB = new Date(b[sort.field as keyof typeof b] as string || 0).getTime();
                return sort.direction === "desc" ? valB - valA : valA - valB;
            });
            return result;
        }
    }, [viewMode, requests, bookings, filter, sort, search]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <ToggleBar
                    value={viewMode}
                    onChange={(v) => {
                        setViewMode(v as ViewMode);
                        setSort({ field: "created_at", direction: "desc" });
                    }}
                    options={[
                        { id: "requests", label: `Requests (${requests.length})`, icon: Inbox },
                        { id: "bookings", label: `Bookings (${bookings.length})`, icon: Calendar },
                    ]}
                />

                <TimelineHeader
                    search={search}
                    onSearchChange={setSearch}
                    sort={sort}
                    onSortChange={setSort}
                    filter={viewMode === "requests" ? filter : undefined}
                    onFilterChange={viewMode === "requests" ? (v) => setFilter(v as EventStatusFilter) : undefined}
                    searchPlaceholder={viewMode === "requests" ? "Search requests..." : "Search bookings..."}
                    sortOptions={viewMode === "requests" ? REQUEST_SORT_OPTIONS : BOOKING_SORT_OPTIONS}
                    filterOptions={viewMode === "requests" ? FILTER_OPTIONS : []}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                >
                    {viewMode === "requests" ? (
                        processedData.length > 0 ? (
                            processedData.map((req: any) => (
                                <StudentPackageCard 
                                    key={req.id} 
                                    studentPackage={req} 
                                    schoolPackage={packageData as any} 
                                    formatCurrency={formatCurrency} 
                                    currency={currency} 
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground bg-muted/5 rounded-2xl border-2 border-dashed border-border/50">
                                No requests found
                            </div>
                        )
                    ) : (
                        processedData.length > 0 ? (
                            processedData.map((booking: any) => (
                                <FullBookingCard 
                                    key={booking.id} 
                                    bookingData={{
                                        ...booking,
                                        school_package: packageData.schema // Provide package context
                                    }} 
                                    currency={currency} 
                                    formatCurrency={formatCurrency} 
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground bg-muted/5 rounded-2xl border-2 border-dashed border-border/50">
                                No bookings found
                            </div>
                        )
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}