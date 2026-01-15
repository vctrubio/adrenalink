import { useMemo, useState } from "react";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge";
import { ENTITY_DATA } from "@/config/entities";
import { PPP } from "@/src/components/ui/PPP";
import { DDD } from "@/src/components/ui/DDD";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";

interface Package {
    id: string;
    description: string;
    durationMinutes: number;
    pricePerStudent: number;
    capacityStudents: number;
    capacityEquipment: number;
    categoryEquipment: string;
    isPublic: boolean;
    packageType?: "lesson" | "rental" | "package";
}

interface PackageTableProps {
    packages: Package[];
    selectedPackage: Package | null;
    onSelect: (pkg: Package) => void;
    selectedStudentCount?: number;
}

type SortColumn = "duration" | "ppp" | "access" | "ratio" | null;
type SortDirection = "asc" | "desc";
type CapacityFilter = "All" | "Single" | "Semi Group";

export function PackageTable({
    packages,
    selectedPackage,
    onSelect,
    selectedStudentCount = 0,
}: PackageTableProps) {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");
    const accentColor = packageEntity?.color || "rgb(var(--primary))";

    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [capacityFilter, setCapacityFilter] = useState<CapacityFilter>("All");
    const [search, setSearch] = useState("");

    // Filter packages by capacity
    const filteredPackages = useMemo(() => {
        let filtered = [...packages];

        // Filter by student capacity
        if (capacityFilter === "Single") {
            filtered = filtered.filter((pkg) => pkg.capacityStudents === 1);
        } else if (capacityFilter === "Semi Group") {
            filtered = filtered.filter((pkg) => pkg.capacityStudents >= 2);
        }

        // Search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            const searchNumber = parseInt(search.trim(), 10);
            const isNumber = !isNaN(searchNumber);

            filtered = filtered.filter((pkg) => {
                // Search by description
                if (pkg.description.toLowerCase().includes(searchLower)) {
                    return true;
                }
                // Search by duration if it's a number
                if (isNumber && pkg.durationMinutes === searchNumber) {
                    return true;
                }
                return false;
            });
        }

        return filtered;
    }, [packages, capacityFilter, search]);

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    // Sort packages
    const sortedPackages = useMemo(() => {
        const sorted = [...filteredPackages];

        if (sortColumn) {
            sorted.sort((a, b) => {
                let comparison = 0;

                switch (sortColumn) {
                    case "duration":
                        comparison = a.durationMinutes - b.durationMinutes;
                        break;
                    case "ppp":
                        const totalPriceA = a.pricePerStudent * a.capacityStudents;
                        const totalPriceB = b.pricePerStudent * b.capacityStudents;
                        comparison = totalPriceA - totalPriceB;
                        break;
                    case "access":
                        // Public (true) comes before Private (false)
                        comparison = (a.isPublic ? 1 : 0) - (b.isPublic ? 1 : 0);
                        break;
                    case "ratio":
                        // Sort by equipment capacity first, then by category name (same as old category sort)
                        comparison = a.capacityEquipment - b.capacityEquipment;
                        if (comparison === 0) {
                            comparison = a.categoryEquipment.localeCompare(b.categoryEquipment);
                        }
                        break;
                }

                return sortDirection === "asc" ? comparison : -comparison;
            });
        }

        return sorted;
    }, [filteredPackages, sortColumn, sortDirection]);

    if (packages.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                No packages available
            </div>
        );
    }

    return (
        <div className="w-full space-y-3">
            {/* Search and Filter Controls */}
            <div className="flex gap-3 items-center">
                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search by description or duration..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-2 py-2 text-sm bg-transparent border-0 border-b border-border rounded-none focus:outline-none focus:border-foreground transition-colors"
                />

                {/* Capacity Filter Toggle */}
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setCapacityFilter("All")}
                        className={`px-3 py-2 text-xs font-semibold transition-colors ${
                            capacityFilter === "All"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        onClick={() => setCapacityFilter("Single")}
                        className={`px-3 py-2 text-xs font-semibold transition-colors border-l border-border ${
                            capacityFilter === "Single"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                    >
                        Single
                    </button>
                    <button
                        type="button"
                        onClick={() => setCapacityFilter("Semi Group")}
                        className={`px-3 py-2 text-xs font-semibold transition-colors border-l border-border ${
                            capacityFilter === "Semi Group"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                    >
                        Semi Group
                    </button>
                </div>

                {/* Selected Students Count */}
                {selectedStudentCount > 0 && (
                    <div className="flex items-center gap-2">
                        <HelmetIcon className="text-muted-foreground" size={16} />
                        <span className="text-xs text-muted-foreground">
                            {selectedStudentCount > 5
                                ? `+${selectedStudentCount}`
                                : `${selectedStudentCount} student${selectedStudentCount !== 1 ? "s" : ""} selected`}
                        </span>
                    </div>
                )}
            </div>

            {/* Modern Header */}
            <div className="grid grid-cols-[1fr_120px_220px_80px_90px] gap-4 border-b border-border/30 bg-muted/30 py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 rounded-t-xl">
                <div className="flex items-center">
                    Description
                </div>
                <div
                    className="flex items-center cursor-pointer hover:text-foreground transition-colors gap-1.5"
                    onClick={() => handleSort("duration")}
                >
                    Duration
                    {sortColumn === "duration" && (
                        <ChevronDownIcon
                            className={`w-3 h-3 flex-shrink-0 transition-transform ${sortDirection === "asc" ? "" : "rotate-180"}`}
                        />
                    )}
                </div>
                <div
                    className="flex items-center cursor-pointer hover:text-foreground transition-colors gap-1.5"
                    onClick={() => handleSort("ppp")}
                >
                    Price
                    {sortColumn === "ppp" && (
                        <ChevronDownIcon
                            className={`w-3 h-3 flex-shrink-0 transition-transform ${sortDirection === "asc" ? "" : "rotate-180"}`}
                        />
                    )}
                </div>
                <div
                    className="flex items-center cursor-pointer hover:text-foreground transition-colors gap-1.5"
                    onClick={() => handleSort("ratio")}
                >
                    Ratio
                    {sortColumn === "ratio" && (
                        <ChevronDownIcon
                            className={`w-3 h-3 flex-shrink-0 transition-transform ${sortDirection === "asc" ? "" : "rotate-180"}`}
                        />
                    )}
                </div>
                <div
                    className="flex items-center cursor-pointer hover:text-foreground transition-colors gap-1.5"
                    onClick={() => handleSort("access")}
                >
                    Access
                    {sortColumn === "access" && (
                        <ChevronDownIcon
                            className={`w-3 h-3 flex-shrink-0 transition-transform ${sortDirection === "asc" ? "" : "rotate-180"}`}
                        />
                    )}
                </div>
            </div>

            {/* Modern Rows */}
            <div>
                {sortedPackages.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    const matchesCount = selectedStudentCount > 0 && pkg.capacityStudents === selectedStudentCount;

                    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === pkg.categoryEquipment);
                    const EquipmentIcon = equipmentConfig?.icon;

                    return (
                        <div
                            key={pkg.id}
                            onClick={() => onSelect(pkg)}
                            className={`
                                grid grid-cols-[1fr_120px_220px_80px_90px] gap-4 px-6 py-4
                                transition-all duration-200 cursor-pointer
                                relative group border-b border-border/40
                                ${
                                    isSelected
                                        ? "bg-primary/10"
                                        : matchesCount
                                          ? "bg-orange-50/50 dark:bg-orange-900/10"
                                          : "hover:bg-muted/30"
                                }
                            `}
                            style={
                                isSelected
                                    ? {
                                          backgroundColor: `${accentColor}15`,
                                      }
                                    : undefined
                            }
                        >
                            {/* Selection Indicator */}
                            {isSelected && (
                                <div
                                    className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-200"
                                    style={{ backgroundColor: accentColor }}
                                />
                            )}

                            {/* Description */}
                            <div
                                className={`flex items-center relative z-[1] ${matchesCount ? "border-l-2 border-orange-500 pl-4" : ""}`}
                            >
                                <span className="font-medium text-foreground">{pkg.description}</span>
                            </div>

                            {/* Duration */}
                            <div className="flex items-center relative z-[1]">
                                <DDD durationMinutes={pkg.durationMinutes} />
                            </div>

                            {/* Price */}
                            <div className="flex items-center relative z-[1]">
                                <PPP
                                    pricePerStudent={pkg.pricePerStudent}
                                    capacityStudents={pkg.capacityStudents}
                                    durationMinutes={pkg.durationMinutes}
                                    variant={pkg.durationMinutes === 60 ? "duration-match" : "default"}
                                />
                            </div>

                            {/* Category */}
                            <div className="flex items-center relative z-[1]">
                                {EquipmentIcon && (
                                    <EquipmentStudentCapacityBadge
                                        categoryIcon={EquipmentIcon}
                                        equipmentCapacity={pkg.capacityEquipment}
                                        studentCapacity={pkg.capacityStudents}
                                    />
                                )}
                            </div>

                            {/* Access */}
                            <div className="flex items-center relative z-[1]">
                                <span
                                    className={`
                                        text-xs font-semibold px-2.5 py-1 rounded-full
                                        ${
                                            pkg.isPublic
                                                ? "text-blue-700 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-900/30"
                                                : "text-orange-700 dark:text-orange-300 bg-orange-100/50 dark:bg-orange-900/30"
                                        }
                                    `}
                                >
                                    {pkg.isPublic ? "Public" : "Private"}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}