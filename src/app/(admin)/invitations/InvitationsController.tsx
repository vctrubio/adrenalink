"use client";

import { useState, useMemo } from "react";
import type { StudentPackageRequest } from "@/supabase/server/student-package";
import { InvitationsTable } from "./InvitationsTable";
import { SearchInput } from "@/src/components/SearchInput";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";

interface InvitationsControllerProps {
    invitations: StudentPackageRequest[];
}

const STATUS_OPTIONS = ["All", "requested", "accepted", "rejected"] as const;

export function InvitationsController({ invitations }: InvitationsControllerProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");

    const filteredInvitations = useMemo(() => {
        return invitations.filter((invitation) => {
            const matchesSearch = invitation.wallet_id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || invitation.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [invitations, searchQuery, statusFilter]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="w-full sm:w-96">
                    <SearchInput 
                        placeholder="Search wallet ID..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        variant="background"
                        className="bg-white"
                    />
                </div>
                
                <FilterDropdown 
                    label="Status"
                    value={statusFilter}
                    options={STATUS_OPTIONS}
                    onChange={setStatusFilter}
                    entityColor="#3b82f6" 
                />
            </div>

            <InvitationsTable invitations={filteredInvitations} />
        </div>
    );
}