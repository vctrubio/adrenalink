"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { StudentPackageRequest } from "@/supabase/server/student-package";
import { InvitationsTable } from "./InvitationsTable";
import { SearchInput } from "@/src/components/SearchInput";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { SortDropdown } from "@/src/components/ui/SortDropdown";
import type { SortConfig, SortOption } from "@/types/sort";
import { useAdminReservationPackageListener } from "@/supabase/subscribe";

interface InvitationsControllerProps {
    invitations: StudentPackageRequest[];
}

const STATUS_OPTIONS = ["All", "requested", "accepted", "rejected"] as const;
const SORT_OPTIONS: SortOption[] = [
    { field: "created_at", direction: "desc", label: "Newest" },
    { field: "created_at", direction: "asc", label: "Oldest" },
];

export function InvitationsController({ invitations: initialInvitations }: InvitationsControllerProps) {
    const [invitations, setInvitations] = useState<StudentPackageRequest[]>(initialInvitations);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "created_at", direction: "desc" });

    // Memoized handler for when packages are detected (refetched from listener)
    const handlePackageDetected = useCallback(
        (data: StudentPackageRequest[]) => {
            console.log(`🔔 [InvitationsController] Packages detected -> Updating invitations (${data.length} items)`);
            setInvitations(data);
        },
        [],
    );

    // Memoized handler for direct package updates (zero-fetch path)
    const handlePackageUpdate = useCallback(
        (payload: {
            eventType: "INSERT" | "UPDATE" | "DELETE";
            packageId: string;
            status?: string;
            requestedClerkId?: string;
        }) => {
            console.log(`🔔 [InvitationsController] Package ${payload.eventType} - Zero-fetch update`, payload);
            // The listener will refetch and call onPackageDetected, so we don't need to update here
            // But we log it for debugging
        },
        [],
    );

    // Set up real-time listener for student package changes
    useAdminReservationPackageListener({
        onPackageDetected: handlePackageDetected,
        onPackageUpdate: handlePackageUpdate,
    });

    // Update local state when initial invitations change (e.g., from server revalidation)
    useEffect(() => {
        setInvitations(initialInvitations);
    }, [initialInvitations]);

    const filteredAndSortedInvitations = useMemo(() => {
        const filtered = invitations.filter((invitation) => {
            const matchesSearch = invitation.requested_clerk_id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || invitation.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        // Apply sorting
        return [...filtered].sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();

            if (sortConfig.direction === "asc") {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });
    }, [invitations, searchQuery, statusFilter, sortConfig]);

    return (
        <div className="flex flex-col gap-6">
            {/* <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
            </div> */}

            <InvitationsTable invitations={filteredAndSortedInvitations} />
        </div>
    );
}
