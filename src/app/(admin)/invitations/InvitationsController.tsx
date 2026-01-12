"use client";

import { useState, useMemo } from "react";
import type { StudentPackageRequest } from "@/supabase/server/student-package";
import { InvitationsTable } from "./InvitationsTable";
import { SearchInput } from "@/src/components/SearchInput";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { SortDropdown } from "@/src/components/ui/SortDropdown";
import type { SortConfig, SortOption } from "@/types/sort";

interface InvitationsControllerProps {
    invitations: StudentPackageRequest[];
}

const STATUS_OPTIONS = ["All", "requested", "accepted", "rejected"] as const;
const SORT_OPTIONS: SortOption[] = [
    { field: "created_at", direction: "desc", label: "Newest" },
    { field: "created_at", direction: "asc", label: "Oldest" },
];

export function InvitationsController({ invitations }: InvitationsControllerProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "created_at", direction: "desc" });

    const filteredAndSortedInvitations = useMemo(() => {
        const currentInvitations = invitations.filter((invitation) => {
            const matchesSearch = invitation.wallet_id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || invitation.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        // Apply sorting
        currentInvitations.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();

            if (sortConfig.direction === "asc") {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });

        return currentInvitations;
    }, [invitations, searchQuery, statusFilter, sortConfig]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="w-full sm:w-96">
                    <SearchInput
                        placeholder="Search wallet ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        variant="background"
                        // Removed className="bg-white" to let variant="background" handle it
                    />
                </div>

                <div className="flex items-center gap-4">
                    <SortDropdown
                        value={sortConfig}
                        options={SORT_OPTIONS}
                        onChange={setSortConfig}
                        entityColor="#3b82f6"
                        toggleMode={true}
                    />
                    <FilterDropdown
                        label="Status"
                        value={statusFilter}
                        options={STATUS_OPTIONS}
                        onChange={setStatusFilter}
                        entityColor="#3b82f6"
                    />
                </div>
            </div>

            <InvitationsTable invitations={filteredAndSortedInvitations} />
        </div>
    );
}
