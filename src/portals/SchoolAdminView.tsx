"use client";

import type { SerializedAbstractModel } from "@/backend/models";
import type { SchoolType, SchoolPackageType, StudentPackageType } from "@/drizzle/schema";
import PackageCard from "@/src/components/cards/PackageCard";
import StudentPackages from "@/src/components/lists/StudentPackages";

interface SchoolAdminViewProps {
    school: SerializedAbstractModel<SchoolType>;
    schoolId: string;
    packages: SerializedAbstractModel<SchoolPackageType>[];
    studentPackageRequests: SerializedAbstractModel<StudentPackageType>[];
}

export default function SchoolAdminView({ school, schoolId, packages, studentPackageRequests }: SchoolAdminViewProps) {
    return (
        <div className="space-y-6">
            {/* Admin Header */}
            <div className="bg-card p-6 rounded-lg border border-border">
                <h1 className="text-2xl font-bold text-foreground mb-2">Hello Admin</h1>
                <p className="text-muted-foreground">Manage your school packages and student requests for {school.schema.name}</p>
            </div>

            {/* Your Packages Section */}
            <div className="bg-card p-6 rounded-lg border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-4">Your Packages</h2>

                {packages.length > 0 ? (
                    <div className="space-y-4">
                        {packages.map((pkg) => (
                            <PackageCard key={pkg.schema.id} package={pkg} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No packages created yet.</p>
                        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors">Create Your First Package</button>
                    </div>
                )}
            </div>

            {/* Student Package Requests Section */}
            <div className="bg-card p-6 rounded-lg border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-4">Student Package Requests</h2>
                <StudentPackages studentPackageRequests={studentPackageRequests} />
            </div>
        </div>
    );
}
