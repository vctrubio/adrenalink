"use client";

import { useState } from "react";
import type { SchoolModel } from "@/backend/models/SchoolModel";
import type { SchoolPackageModel } from "@/backend/models/SchoolPackageModel";
import SchoolSubdomain from "@/src/portals/schools/SchoolDebugSubdomain";
import SchoolHeader, { LiquidToggle } from "./SchoolHeader";
import { PackageFilterView } from "./PackageFilterView";

type PackageTypeFilter = "lessons" | "rental";

interface SubDomainHomePageProps {
    school: SchoolModel;
    packages: SchoolPackageModel[];
}

export function SubDomainHomePage({ school, packages }: SubDomainHomePageProps) {
    const [equipmentCategoryFilters, setEquipmentCategoryFilters] = useState<string[]>([]);
    const [packageTypeFilter, setPackageTypeFilter] = useState<PackageTypeFilter>("lessons");

    const handleEquipmentFilterToggle = (categoryId: string) => {
        setEquipmentCategoryFilters((prev) => (prev.includes(categoryId) ? prev.filter((f) => f !== categoryId) : [...prev, categoryId]));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
            <SchoolHeader school={school} equipmentCategoryFilters={equipmentCategoryFilters} onEquipmentFilterToggle={handleEquipmentFilterToggle} packageTypeFilter={packageTypeFilter} onPackageTypeFilterChange={setPackageTypeFilter} />
            <div className="container mx-auto px-6 py-12">
                {packages.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-lg border border-border">
                        <p className="text-muted-foreground text-lg">No packages available at this time</p>
                    </div>
                ) : (
                    <div className="w-full">
                        <div className="flex justify-center md:justify-end mb-0">
                            <LiquidToggle
                                options={[
                                    { id: "lessons" as PackageTypeFilter, label: "Lessons" },
                                    { id: "rental" as PackageTypeFilter, label: "Rentals" },
                                ]}
                                active={packageTypeFilter}
                                setActive={setPackageTypeFilter}
                            />
                        </div>
                        <PackageFilterView packages={packages} schoolName={school.schema.name} schoolUsername={school.schema.username} equipmentCategoryFilters={equipmentCategoryFilters} packageTypeFilter={packageTypeFilter} />
                    </div>
                )}
            </div>
            {/* <SchoolSubdomain school={school} /> */} {/* Debugging Component and Irrelñevant*/}
        </div>
    );
}
