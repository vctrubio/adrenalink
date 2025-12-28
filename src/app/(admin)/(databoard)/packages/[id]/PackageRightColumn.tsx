"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { SchoolPackageModel } from "@/backend/models";
import { ENTITY_DATA } from "@/config/entities";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { StudentPackageCard, type StudentPackageData } from "@/src/components/ids";
import { TimelineHeader, type EventStatusFilter } from "@/src/components/timeline/TimelineHeader";
import type { SortConfig, SortOption } from "@/types/sort";

// Main Component
interface PackageRightColumnProps {
    schoolPackage: SchoolPackageModel;
}

const SORT_OPTIONS: SortOption[] = [
    { field: "createdAt", direction: "desc", label: "Newest" },
    { field: "createdAt", direction: "asc", label: "Oldest" },
    { field: "requestedDateStart", direction: "desc", label: "Start Date" },
];

const FILTER_OPTIONS = ["All", "Requested", "Accepted", "Rejected"];

export function PackageRightColumn({ schoolPackage }: PackageRightColumnProps) {
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortConfig>({ field: "createdAt", direction: "desc" });
    const [filter, setFilter] = useState<EventStatusFilter>("all");

    const formatCurrency = (num: number): string => {
        const rounded = Math.round(num * 100) / 100;
        return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
    };

    const studentPackages = (schoolPackage.relations?.studentPackages || []) as StudentPackageData[];

    // Filter and Sort Packages
    const filteredPackages = useMemo(() => {
        let result = [...studentPackages];

        // Filter by status
        if (filter !== "all") {
            result = result.filter((sp) => sp.status === filter);
        }

        // Search filter
        if (search) {
            const query = search.toLowerCase();
            result = result.filter((sp) => {
                const walletMatch = sp.walletId.toLowerCase().includes(query);
                const studentMatch = sp.studentPackageStudents?.some((sps) => sps.student?.firstName.toLowerCase().includes(query) || sps.student?.lastName.toLowerCase().includes(query));
                return walletMatch || studentMatch;
            });
        }

        // Sort
        result.sort((a, b) => {
            let valA: number, valB: number;

            if (sort.field === "requestedDateStart") {
                valA = new Date(a.requestedDateStart).getTime();
                valB = new Date(b.requestedDateStart).getTime();
            } else {
                valA = new Date(a.createdAt).getTime();
                valB = new Date(b.createdAt).getTime();
            }

            return sort.direction === "desc" ? valB - valA : valA - valB;
        });

        return result;
    }, [studentPackages, filter, sort, search]);

    if (studentPackages.length === 0) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">No package requests made yet</div>;
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
                searchPlaceholder="Search packages..."
                sortOptions={SORT_OPTIONS}
                filterOptions={FILTER_OPTIONS}
            />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {filteredPackages.map((studentPackage) => (
                    <StudentPackageCard key={studentPackage.id} studentPackage={studentPackage} schoolPackage={schoolPackage} formatCurrency={formatCurrency} currency={currency} />
                ))}
                {filteredPackages.length === 0 && <div className="text-center py-8 text-muted-foreground">No packages match your filters</div>}
            </motion.div>
        </div>
    );
}
