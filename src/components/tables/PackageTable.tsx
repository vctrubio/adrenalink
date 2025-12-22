import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table";
import { getPrettyDuration } from "@/getters/duration-getter";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge";
import { useState, useMemo } from "react";

interface Package {
    id: string;
    description: string;
    durationMinutes: number;
    pricePerStudent: number;
    capacityStudents: number;
    capacityEquipment: number;
    categoryEquipment: string;
}

interface PackageTableProps {
    packages: Package[];
    selectedPackage: Package | null;
    onSelect: (pkg: Package) => void;
    selectedStudentCount?: number;
}

type SortColumn = "duration" | "capacity" | "price" | null;
type SortDirection = "asc" | "desc";

export function PackageTable({
    packages,
    selectedPackage,
    onSelect,
    selectedStudentCount = 0
}: PackageTableProps) {
    const [search, setSearch] = useState("");
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    if (packages.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                No packages available
            </div>
        );
    }

    // Add match indicator for packages that match student count
    const packagesWithMatch = packages.map(pkg => ({
        ...pkg,
        matchesStudentCount: selectedStudentCount > 0 && pkg.capacityStudents === selectedStudentCount
    }));

    // Filter and sort packages
    const processedPackages = useMemo(() => {
        let filtered = packagesWithMatch.filter((pkg) => {
            const searchLower = search.toLowerCase();
            return pkg.description?.toLowerCase().includes(searchLower) || false;
        });

        if (sortColumn) {
            filtered.sort((a, b) => {
                let comparison = 0;
                switch (sortColumn) {
                    case "duration":
                        comparison = a.durationMinutes - b.durationMinutes;
                        break;
                    case "capacity":
                        comparison = a.capacityStudents - b.capacityStudents;
                        break;
                    case "price":
                        comparison = a.pricePerStudent - b.pricePerStudent;
                        break;
                }
                return sortDirection === "asc" ? comparison : -comparison;
            });
        }

        return filtered;
    }, [packagesWithMatch, search, sortColumn, sortDirection]);

    const filteredPackages = processedPackages;

    return (
        <div className="space-y-2">
            {selectedStudentCount > 0 && (
                <div className="text-xs text-muted-foreground px-1">
                    💡 Packages matching {selectedStudentCount} student{selectedStudentCount !== 1 ? "s" : ""} are highlighted
                </div>
            )}
            
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search by description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                    type="button"
                    onClick={() => console.log("Filter packages:", { search, filteredCount: filteredPackages.length })}
                    className="px-4 py-2 text-sm font-medium border border-border rounded-lg bg-background hover:bg-accent transition-colors"
                >
                    Filter
                </button>
            </div>
            
            <Table>
                <TableHeader>
                    <tr>
                        <TableHead
                            sortable
                            sortActive={sortColumn === "capacity"}
                            sortDirection={sortDirection}
                            onSort={() => handleSort("capacity")}
                        >
                            Category
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead
                            sortable
                            sortActive={sortColumn === "duration"}
                            sortDirection={sortDirection}
                            onSort={() => handleSort("duration")}
                        >
                            Duration
                        </TableHead>
                        <TableHead
                            sortable
                            sortActive={sortColumn === "price"}
                            sortDirection={sortDirection}
                            onSort={() => handleSort("price")}
                            align="right"
                        >
                            Price
                        </TableHead>
                        <TableHead align="right">Per Hour</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {filteredPackages.map((pkg) => {
                        const isSelected = selectedPackage?.id === pkg.id;
                        const matchesCount = pkg.matchesStudentCount;
                        const pricePerHour = (pkg.pricePerStudent * pkg.capacityStudents) / (pkg.durationMinutes / 60);
                        
                        const equipmentConfig = EQUIPMENT_CATEGORIES.find(
                            (cat) => cat.id === pkg.categoryEquipment
                        );
                        const EquipmentIcon = equipmentConfig?.icon;

                        return (
                            <TableRow
                                key={pkg.id}
                                onClick={() => onSelect(pkg)}
                                isSelected={isSelected}
                                className={matchesCount && !isSelected ? "bg-green-50 dark:bg-green-900/10" : ""}
                            >
                                <TableCell>
                                    {EquipmentIcon && (
                                        <EquipmentStudentCapacityBadge
                                            categoryIcon={EquipmentIcon}
                                            equipmentCapacity={pkg.capacityEquipment}
                                            studentCapacity={pkg.capacityStudents}
                                        />
                                    )}
                                </TableCell>
                                <TableCell className="font-medium text-foreground">
                                    <div className="flex items-center gap-2">
                                        {pkg.description}
                                        {matchesCount && (
                                            <span className="text-xs text-green-600 dark:text-green-400">
                                                ✓ Match
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{getPrettyDuration(pkg.durationMinutes)}</TableCell>
                                <TableCell className="font-semibold text-primary text-right">
                                    €{pkg.pricePerStudent * pkg.capacityStudents}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-right">
                                    €{pricePerHour.toFixed(2)}/h
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
