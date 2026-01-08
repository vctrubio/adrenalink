import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table";
import { getHMDuration } from "@/getters/duration-getter";
import { getPricePerHour } from "@/getters/package-getter";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { MultiSelectFilterDropdown } from "@/src/components/ui/MultiSelectFilterDropdown";
import { SearchInput } from "@/src/components/SearchInput";
import { useState, useMemo } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { useTableSort } from "@/hooks/useTableSort";
import { filterBySearch } from "@/types/searching-entities";

interface Package {
    id: string;
    description: string;
    durationMinutes: number;
    pricePerStudent: number;
    capacityStudents: number;
    capacityEquipment: number;
    categoryEquipment: string;
    isPublic: boolean;
}

interface PackageTableProps {
    packages: Package[];
    selectedPackage: Package | null;
    onSelect: (pkg: Package) => void;
    selectedStudentCount?: number;
}

type SortColumn = "duration" | "capacity" | "price" | "pricePerHour" | null;

const PUBLIC_PRIVATE_OPTIONS = ["All", "Public", "Private"] as const;
type PublicPrivateFilter = (typeof PUBLIC_PRIVATE_OPTIONS)[number];

const CAPACITY_OPTIONS = ["All", "Single", "Double", "More"] as const;
type CapacityFilter = (typeof CAPACITY_OPTIONS)[number];

export function PackageTable({ packages, selectedPackage, onSelect, selectedStudentCount = 0 }: PackageTableProps) {
    const [search, setSearch] = useState("");
    const [publicPrivateFilter, setPublicPrivateFilter] = useState<PublicPrivateFilter>("All");
    const [capacityFilter, setCapacityFilter] = useState<CapacityFilter>("All");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const { sortColumn, sortDirection, handleSort } = useTableSort<SortColumn>(null);
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");

    // Get unique categories from packages
    const availableCategories = useMemo(() => {
        const categories = new Set(packages.map((pkg) => pkg.categoryEquipment));
        return Array.from(categories);
    }, [packages]);

    if (packages.length === 0) {
        return <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">No packages available</div>;
    }

    // Add match indicator for packages that match student count
    const packagesWithMatch = packages.map((pkg) => ({
        ...pkg,
        matchesStudentCount: selectedStudentCount > 0 && pkg.capacityStudents === selectedStudentCount,
    }));

    // Filter and sort packages
    const processedPackages = useMemo(() => {
        let filtered = filterBySearch(packagesWithMatch, search, (pkg) => pkg.description);
        
        filtered = filtered.filter((pkg) => {
            // Public/Private filter
            if (publicPrivateFilter === "Public" && !pkg.isPublic) {
                return false;
            }
            if (publicPrivateFilter === "Private" && pkg.isPublic) {
                return false;
            }

            // Capacity filter
            if (capacityFilter === "Single" && pkg.capacityStudents !== 1) {
                return false;
            }
            if (capacityFilter === "Double" && pkg.capacityStudents !== 2) {
                return false;
            }
            if (capacityFilter === "More" && pkg.capacityStudents <= 2) {
                return false;
            }

            // Category filter (multi-select)
            if (selectedCategories.length > 0 && !selectedCategories.includes(pkg.categoryEquipment)) {
                return false;
            }

            return true;
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
                    case "pricePerHour":
                        const pricePerHourA = getPricePerHour(a.pricePerStudent, a.capacityStudents, a.durationMinutes);
                        const pricePerHourB = getPricePerHour(b.pricePerStudent, b.capacityStudents, b.durationMinutes);
                        comparison = pricePerHourA - pricePerHourB;
                        break;
                }
                return sortDirection === "asc" ? comparison : -comparison;
            });
        }

        return filtered;
    }, [packagesWithMatch, search, sortColumn, sortDirection, publicPrivateFilter, capacityFilter, selectedCategories]);

    const filteredPackages = processedPackages;

    return (
        <div className="space-y-2">
            {selectedStudentCount > 0 && (
                <div className="text-xs text-muted-foreground px-1">
                    💡 Packages matching {selectedStudentCount} student{selectedStudentCount !== 1 ? "s" : ""} are highlighted
                </div>
            )}

            <div className="flex gap-2 items-center flex-wrap">
                <SearchInput
                    placeholder="Search by description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    variant="background"
                    entityColor={packageEntity?.color}
                    className="flex-1 min-w-[200px]"
                />
                {packageEntity && (
                    <>
                        <FilterDropdown label="Access" value={publicPrivateFilter} options={PUBLIC_PRIVATE_OPTIONS} onChange={(v) => setPublicPrivateFilter(v as PublicPrivateFilter)} entityColor={packageEntity.color} />
                        <FilterDropdown label="Capacity" value={capacityFilter} options={CAPACITY_OPTIONS} onChange={(v) => setCapacityFilter(v as CapacityFilter)} entityColor={packageEntity.color} />
                        <MultiSelectFilterDropdown label="Category" selectedValues={selectedCategories} options={availableCategories} onChange={setSelectedCategories} entityColor={packageEntity.color} />
                    </>
                )}
            </div>

            <Table>
                <TableHeader>
                    <tr>
                        <TableHead sortable sortActive={sortColumn === "capacity"} sortDirection={sortDirection} onSort={() => handleSort("capacity")}>
                            Category
                        </TableHead>
                        <TableHead sortable sortActive={sortColumn === "duration"} sortDirection={sortDirection} onSort={() => handleSort("duration")}>
                            Duration
                        </TableHead>
                        <TableHead sortable sortActive={sortColumn === "price"} sortDirection={sortDirection} onSort={() => handleSort("price")} align="right">
                            Price
                        </TableHead>
                        <TableHead sortable sortActive={sortColumn === "pricePerHour"} sortDirection={sortDirection} onSort={() => handleSort("pricePerHour")} align="right">
                            Per Hour
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Access</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {filteredPackages.map((pkg) => {
                        const isSelected = selectedPackage?.id === pkg.id;
                        const matchesCount = pkg.matchesStudentCount;
                        const pricePerHour = getPricePerHour(pkg.pricePerStudent, pkg.capacityStudents, pkg.durationMinutes);

                        const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === pkg.categoryEquipment);
                        const EquipmentIcon = equipmentConfig?.icon;

                        return (
                            <TableRow key={pkg.id} onClick={() => onSelect(pkg)} isSelected={isSelected} selectedColor={packageEntity?.color} className={matchesCount && !isSelected ? "bg-green-50 dark:bg-green-900/10" : ""}>
                                <TableCell className="w-20">{EquipmentIcon && <EquipmentStudentCapacityBadge categoryIcon={EquipmentIcon} equipmentCapacity={pkg.capacityEquipment} studentCapacity={pkg.capacityStudents} />}</TableCell>
                                <TableCell className="w-24">{getHMDuration(pkg.durationMinutes)}</TableCell>
                                <TableCell className="w-20 text-muted-foreground text-right">{pkg.pricePerStudent.toFixed(2)}</TableCell>
                                <TableCell className="w-20 text-muted-foreground text-right">{pricePerHour.toFixed(2)}</TableCell>
                                <TableCell className="font-medium text-foreground flex-1">
                                    <div className="flex items-center gap-2">
                                        {pkg.description}
                                        {matchesCount && <span className="text-xs text-green-600 dark:text-green-400">✓ Match ({pkg.capacityStudents})</span>}
                                    </div>
                                </TableCell>
                                <TableCell className="w-16 text-xs font-medium">
                                    <span className={pkg.isPublic ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}>{pkg.isPublic ? "Public" : "Private"}</span>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
