"use client";

import SchoolCard from "@/src/components/cards/SchoolCard";
import type { SchoolType } from "@/drizzle/schema";
import type { AbstractModel } from "@/backend/models";

interface SchoolListViewProps {
    schools: AbstractModel<SchoolType>[];
}

export function SchoolListView({ schools }: SchoolListViewProps) {
    if (schools.length === 0) {
        return (
            <div className="flex items-center justify-center h-full bg-muted/30">
                <div className="text-center p-6">
                    <p className="text-muted-foreground mb-2">No schools found</p>
                    <p className="text-sm text-muted-foreground">
                        Try adjusting your filters or search criteria
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-auto">
            <div className="p-6">
                <div className="space-y-4">
                    {schools.map((school) => (
                        <SchoolCard
                            key={school.schema.id}
                            school={school.serialize()}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}