import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table";
import { useState } from "react";

interface Referral {
    id: string;
    code: string;
    description: string | null;
    commissionType: string;
    commissionValue: string;
    active: boolean;
}

interface ReferralTableProps {
    referrals: Referral[];
    selectedReferral: Referral | null;
    onSelect: (referral: Referral | null) => void;
}

export function ReferralTable({ 
    referrals, 
    selectedReferral, 
    onSelect 
}: ReferralTableProps) {
    const [search, setSearch] = useState("");

    // Filter referrals by search term (code)
    const filteredReferrals = referrals.filter((referral) => {
        const searchLower = search.toLowerCase();
        return referral.code.toLowerCase().includes(searchLower);
    });

    if (referrals.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                No active referrals available
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search by code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                    type="button"
                    onClick={() => console.log("Filter referrals:", { search, filteredCount: filteredReferrals.length })}
                    className="px-4 py-2 text-sm font-medium border border-border rounded-lg bg-background hover:bg-accent transition-colors"
                >
                    Filter
                </button>
            </div>

            {/* Option to clear selection */}
            {selectedReferral && (
                <button
                    type="button"
                    onClick={() => onSelect(null)}
                    className="w-full p-2 text-sm text-left rounded-lg border border-border hover:border-destructive/50 bg-muted/30 transition-all"
                >
                    ✕ Clear referral selection
                </button>
            )}

            <Table>
                <TableHeader>
                    <tr>
                        <TableHead sortable>Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead sortable>Commission</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {filteredReferrals.map((referral) => {
                        const isSelected = selectedReferral?.id === referral.id;
                        
                        return (
                            <TableRow
                                key={referral.id}
                                onClick={() => onSelect(referral)}
                                isSelected={isSelected}
                            >
                                <TableCell className="font-medium text-foreground">
                                    {referral.code}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {referral.description || "-"}
                                </TableCell>
                                <TableCell className="capitalize">
                                    <span className="font-semibold text-primary">
                                        {referral.commissionValue}
                                        {referral.commissionType === "percentage" ? "%" : "€"}
                                    </span>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
