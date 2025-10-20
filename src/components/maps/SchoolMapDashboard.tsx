"use client";

import { useState, useEffect } from "react";
import { SchoolMap } from "./SchoolMap";
import { SchoolFilters } from "./SchoolFilters";
import { SchoolListView } from "./SchoolListView";
import type { SchoolType } from "@/drizzle/schema";
import type { AbstractModel } from "@/backend/models";

interface SchoolMapDashboardProps {
    schools: AbstractModel<SchoolType>[];
}

export function SchoolMapDashboard({ schools }: SchoolMapDashboardProps) {
    const [viewMode, setViewMode] = useState<"map" | "list">("map");
    const [filteredSchools, setFilteredSchools] = useState<AbstractModel<SchoolType>[]>(schools);
    const [filters, setFilters] = useState({
        search: "",
        city: "",
        country: "",
        equipment: [] as string[],
    });

    // Filter schools based on current filters
    useEffect(() => {
        let filtered = schools;

        // Search filter (name)
        if (filters.search) {
            filtered = filtered.filter(school =>
                school.schema.name.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        // City filter
        if (filters.city) {
            filtered = filtered.filter(school =>
                school.schema.city?.toLowerCase().includes(filters.city.toLowerCase())
            );
        }

        // Country filter
        if (filters.country) {
            filtered = filtered.filter(school =>
                school.schema.country.toLowerCase().includes(filters.country.toLowerCase())
            );
        }

        // Equipment filter
        if (filters.equipment.length > 0) {
            filtered = filtered.filter(school => {
                if (!school.schema.equipmentCategories) return false;
                try {
                    const schoolEquipment = JSON.parse(school.schema.equipmentCategories);
                    return filters.equipment.some(equipment => schoolEquipment.includes(equipment));
                } catch {
                    return false;
                }
            });
        }

        setFilteredSchools(filtered);
    }, [schools, filters]);

    const handleFilterChange = (newFilters: typeof filters) => {
        setFilters(newFilters);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header with filters and view toggle */}
            <div className="bg-card border-border border-b p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <SchoolFilters 
                        filters={filters} 
                        onFilterChange={handleFilterChange}
                        schoolCount={filteredSchools.length}
                    />
                    
                    <div className="flex items-center bg-muted rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("map")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                viewMode === "map"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Map View
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                viewMode === "list"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            List View
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 relative">
                {viewMode === "map" ? (
                    <SchoolMap schools={filteredSchools} />
                ) : (
                    <SchoolListView schools={filteredSchools} />
                )}
            </div>
        </div>
    );
}