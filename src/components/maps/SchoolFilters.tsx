"use client";

import { useState } from "react";

interface SchoolFiltersProps {
    filters: {
        search: string;
        city: string;
        country: string;
        equipment: string[];
    };
    onFilterChange: (filters: any) => void;
    schoolCount: number;
}

const equipmentOptions = ["kite", "wing", "windsurf", "surf", "snowboard"];

export function SchoolFilters({ filters, onFilterChange, schoolCount }: SchoolFiltersProps) {
    const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);

    const handleSearchChange = (value: string) => {
        onFilterChange({ ...filters, search: value });
    };

    const handleCityChange = (value: string) => {
        onFilterChange({ ...filters, city: value });
    };

    const handleCountryChange = (value: string) => {
        onFilterChange({ ...filters, country: value });
    };

    const handleEquipmentToggle = (equipment: string) => {
        const newEquipment = filters.equipment.includes(equipment)
            ? filters.equipment.filter(e => e !== equipment)
            : [...filters.equipment, equipment];
        onFilterChange({ ...filters, equipment: newEquipment });
    };

    const clearAllFilters = () => {
        onFilterChange({
            search: "",
            city: "",
            country: "",
            equipment: [],
        });
    };

    const hasActiveFilters = filters.search || filters.city || filters.country || filters.equipment.length > 0;

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search schools..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full sm:w-64 h-10 px-3 pr-8 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {filters.search && (
                    <button
                        onClick={() => handleSearchChange("")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Location filters */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="City"
                    value={filters.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-24 sm:w-32 h-10 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <input
                    type="text"
                    placeholder="Country"
                    value={filters.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-24 sm:w-32 h-10 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            {/* Equipment filter */}
            <div className="relative">
                <button
                    onClick={() => setShowEquipmentDropdown(!showEquipmentDropdown)}
                    className="h-10 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex items-center gap-2"
                >
                    Equipment
                    {filters.equipment.length > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                            {filters.equipment.length}
                        </span>
                    )}
                    <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showEquipmentDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-10">
                        <div className="p-2">
                            {equipmentOptions.map((equipment) => (
                                <label
                                    key={equipment}
                                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.equipment.includes(equipment)}
                                        onChange={() => handleEquipmentToggle(equipment)}
                                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                                    />
                                    <span className="text-sm capitalize">{equipment}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Results count and clear */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{schoolCount} schools</span>
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="text-primary hover:text-primary/80 underline"
                    >
                        Clear filters
                    </button>
                )}
            </div>
        </div>
    );
}