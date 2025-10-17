"use client";

import type { SerializedAbstractModel } from "@/backend/models";
import type { SchoolType, SchoolPackageType } from "@/drizzle/schema";
import PackageCard from "@/src/components/cards/PackageCard";

interface SchoolStudentViewProps {
    school: SerializedAbstractModel<SchoolType>;
    schoolId: string;
    packages: SerializedAbstractModel<SchoolPackageType>[];
}

export default function SchoolStudentView({ school, schoolId, packages }: SchoolStudentViewProps) {
    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-card p-6 rounded-lg border border-border">
                <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to {school.schema.name}</h1>
                <p className="text-muted-foreground">
                    Located in {school.schema.country} • Contact: {school.schema.phone}
                </p>
            </div>

            {/* Book Your First Class Section */}
            <div className="bg-card p-6 rounded-lg border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-4">Book Your First Class</h2>

                {packages.length > 0 ? (
                    <div className="space-y-4">
                        {packages.map((pkg) => (
                            <PackageCard key={pkg.schema.id} package={pkg} />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No packages available at this time. Please check back later.</p>
                )}
            </div>
        </div>
    );
}
