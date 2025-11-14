"use client";

import { useState, useMemo } from "react";
import { Listbox } from "@headlessui/react";
import type { SchoolPackageType } from "@/drizzle/schema";
import { SubDomainPackageRowView } from "./SubDomainPackageRowView";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";

interface PackageFilterViewProps {
    packages: Array<SchoolPackageType & { bookingCount: number }>;
}

type PackageTypeFilter = "all" | "lessons" | "rental";
type EquipmentCategoryFilter = "all" | "kite" | "wing" | "windsurf";
type SortByFilter = "popular" | "price-low" | "price-high" | "duration-short" | "duration-long";

interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

export const PackageFilterView = ({ packages }: PackageFilterViewProps) => {
    const [packageTypeFilter, setPackageTypeFilter] = useState<PackageTypeFilter>("all");
    const [equipmentCategoryFilter, setEquipmentCategoryFilter] = useState<EquipmentCategoryFilter>("all");
    const [sortBy, setSortBy] = useState<SortByFilter>("popular");

    // Calculate counts
    const lessonCount = packages.filter((p) => p.packageType === "lessons").length;
    const rentalCount = packages.filter((p) => p.packageType === "rental").length;
    const kiteCount = packages.filter((p) => p.categoryEquipment === "kite").length;
    const wingCount = packages.filter((p) => p.categoryEquipment === "wing").length;
    const windsurfCount = packages.filter((p) => p.categoryEquipment === "windsurf").length;

    const packageTypeOptions: FilterOption[] = [
        { value: "all", label: "All Packages", count: packages.length },
        { value: "lessons", label: "Lessons", count: lessonCount },
        { value: "rental", label: "Rental", count: rentalCount },
    ];

    const equipmentCategoryOptions: FilterOption[] = [
        { value: "all", label: "All Equipment", count: packages.length },
        { value: "kite", label: "Kite", count: kiteCount },
        { value: "wing", label: "Wing", count: wingCount },
        { value: "windsurf", label: "Windsurf", count: windsurfCount },
    ];

    const sortByOptions: FilterOption[] = [
        { value: "popular", label: "Most Popular" },
        { value: "price-low", label: "Price: Low to High" },
        { value: "price-high", label: "Price: High to Low" },
        { value: "duration-short", label: "Duration: Short to Long" },
        { value: "duration-long", label: "Duration: Long to Short" },
    ];

    const filteredAndSortedPackages = useMemo(() => {
        // Filter
        const filtered = packages.filter((pkg) => {
            const matchesPackageType = packageTypeFilter === "all" || pkg.packageType === packageTypeFilter;
            const matchesEquipmentCategory = equipmentCategoryFilter === "all" || pkg.categoryEquipment === equipmentCategoryFilter;
            return matchesPackageType && matchesEquipmentCategory;
        });

        // Sort
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "popular":
                    return b.bookingCount - a.bookingCount;
                case "price-low":
                    return a.pricePerStudent - b.pricePerStudent;
                case "price-high":
                    return b.pricePerStudent - a.pricePerStudent;
                case "duration-short":
                    return a.durationMinutes - b.durationMinutes;
                case "duration-long":
                    return b.durationMinutes - a.durationMinutes;
                default:
                    return 0;
            }
        });

        return sorted;
    }, [packages, packageTypeFilter, equipmentCategoryFilter, sortBy]);

    const selectedPackageType = packageTypeOptions.find((opt) => opt.value === packageTypeFilter)!;
    const selectedEquipmentCategory = equipmentCategoryOptions.find((opt) => opt.value === equipmentCategoryFilter)!;
    const selectedSortBy = sortByOptions.find((opt) => opt.value === sortBy)!;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-2 text-center">
                <p className="text-muted-foreground text-lg">
                    Choose the perfect package for your adventure
                </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                {/* Package Type Filter */}
                <div className="w-full sm:w-auto">
                    <Listbox value={packageTypeFilter} onChange={setPackageTypeFilter}>
                        <div className="relative">
                            <Listbox.Button className="relative w-full sm:w-56 cursor-pointer rounded-lg bg-card border border-border py-3 pl-4 pr-10 text-left shadow-sm hover:border-[#fb923c]/50 transition-colors">
                                <span className="block truncate font-medium text-sm">
                                    {selectedPackageType.label}
                                    <span className="ml-2 text-xs text-muted-foreground">({selectedPackageType.count})</span>
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronUpDownIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                </span>
                            </Listbox.Button>
                            <Listbox.Options className="absolute z-10 mt-2 w-full rounded-lg bg-card border border-border shadow-lg max-h-60 overflow-auto focus:outline-none">
                                {packageTypeOptions.map((option) => (
                                    <Listbox.Option
                                        key={option.value}
                                        value={option.value}
                                        className={({ active }) =>
                                            `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                                                active ? "bg-[#fb923c]/10 text-foreground" : "text-foreground"
                                            }`
                                        }
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate text-sm ${selected ? "font-semibold" : "font-normal"}`}>
                                                    {option.label}
                                                    <span className="ml-2 text-xs text-muted-foreground">({option.count})</span>
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#fb923c]">
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </div>
                    </Listbox>
                </div>

                {/* Equipment Category Filter */}
                <div className="w-full sm:w-auto">
                    <Listbox value={equipmentCategoryFilter} onChange={setEquipmentCategoryFilter}>
                        <div className="relative">
                            <Listbox.Button className="relative w-full sm:w-56 cursor-pointer rounded-lg bg-card border border-border py-3 pl-4 pr-10 text-left shadow-sm hover:border-[#fb923c]/50 transition-colors">
                                <span className="block truncate font-medium text-sm">
                                    {selectedEquipmentCategory.label}
                                    <span className="ml-2 text-xs text-muted-foreground">({selectedEquipmentCategory.count})</span>
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronUpDownIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                </span>
                            </Listbox.Button>
                            <Listbox.Options className="absolute z-10 mt-2 w-full rounded-lg bg-card border border-border shadow-lg max-h-60 overflow-auto focus:outline-none">
                                {equipmentCategoryOptions.map((option) => (
                                    <Listbox.Option
                                        key={option.value}
                                        value={option.value}
                                        className={({ active }) =>
                                            `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                                                active ? "bg-[#fb923c]/10 text-foreground" : "text-foreground"
                                            }`
                                        }
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate text-sm ${selected ? "font-semibold" : "font-normal"}`}>
                                                    {option.label}
                                                    <span className="ml-2 text-xs text-muted-foreground">({option.count})</span>
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#fb923c]">
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </div>
                    </Listbox>
                </div>

                {/* Sort By Filter */}
                <div className="w-full sm:w-auto">
                    <Listbox value={sortBy} onChange={setSortBy}>
                        <div className="relative">
                            <Listbox.Button className="relative w-full sm:w-56 cursor-pointer rounded-lg bg-card border border-border py-3 pl-4 pr-10 text-left shadow-sm hover:border-[#fb923c]/50 transition-colors">
                                <span className="block truncate font-medium text-sm">
                                    {selectedSortBy.label}
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronUpDownIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                </span>
                            </Listbox.Button>
                            <Listbox.Options className="absolute z-10 mt-2 w-full rounded-lg bg-card border border-border shadow-lg max-h-60 overflow-auto focus:outline-none">
                                {sortByOptions.map((option) => (
                                    <Listbox.Option
                                        key={option.value}
                                        value={option.value}
                                        className={({ active }) =>
                                            `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                                                active ? "bg-[#fb923c]/10 text-foreground" : "text-foreground"
                                            }`
                                        }
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate text-sm ${selected ? "font-semibold" : "font-normal"}`}>
                                                    {option.label}
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#fb923c]">
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </div>
                    </Listbox>
                </div>
            </div>

            {/* Packages List */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                {filteredAndSortedPackages.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-card rounded-lg border border-border">
                        <p className="text-muted-foreground">
                            No packages match the selected filters
                        </p>
                    </div>
                ) : (
                    filteredAndSortedPackages.map((pkg) => (
                        <SubDomainPackageRowView key={pkg.id} package={pkg} />
                    ))
                )}
            </div>
        </div>
    );
};
