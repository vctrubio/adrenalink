"use client";

import { useState, useMemo } from "react";
import type { SchoolPackageType } from "@/drizzle/schema";
import { getPrettyDuration } from "@/getters/duration-getter";
import { EQUIPMENT_CATEGORIES, EquipmentCategoryConfig } from "@/config/equipment";
import {
    ChevronDownIcon,
    UsersIcon,
    ClockIcon,
    FireIcon,
    WrenchScrewdriverIcon,
    ArrowTrendingDownIcon,
    ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

// --- PROPS ---
interface PackageFilterViewProps {
    packages: Array<SchoolPackageType & { bookingCount: number }>;
}

// --- TYPES ---
type PackageTypeFilter = "lessons" | "rental";
type SortByFilter = "popular" | "price-low" | "price-high" | "duration-short" | "duration-long";

// --- PACKAGE CARD (no changes) ---
const PackageCard = ({
    pkg,
}: {
    pkg: SchoolPackageType & { bookingCount: number };
}) => {
    const categoryConfig = EQUIPMENT_CATEGORIES.find(c => c.id === pkg.categoryEquipment) || {
        id: "default", name: "Package", icon: FireIcon, color: "#fb923c"
    } as EquipmentCategoryConfig;
    const CategoryIcon = categoryConfig.icon;

    const isPopular = pkg.bookingCount > 10;
    const durationHours = pkg.durationMinutes / 60;
    const pricePerHour = durationHours > 0 ? pkg.pricePerStudent / durationHours : 0;

    const stats = [
        { icon: UsersIcon, label: `Up to ${pkg.capacityStudents} students` },
        { icon: WrenchScrewdriverIcon, label: `${pkg.capacityEquipment} equipment sets` },
        { icon: ClockIcon, label: getPrettyDuration(pkg.durationMinutes) },
        { icon: () => <span className="font-bold text-sm" style={{ color: categoryConfig.color }}>$/h</span>, label: `$${pricePerHour.toFixed(2)} per hour` },
    ];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="group relative bg-card/60 border border-border/20 rounded-xl overflow-hidden transition-all duration-300 hover:border-orange-400/40 hover:shadow-2xl hover:shadow-orange-500/10"
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="text-lg font-bold text-foreground">
                        {pkg.description}
                    </h3>
                    <CategoryIcon className="w-8 h-8 flex-shrink-0" style={{ color: categoryConfig.color }} />
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mb-4">
                    {stats.map((stat, index) => {
                        const StatIcon = stat.icon;
                        return (
                            <div key={index} className="flex items-center gap-2">
                                <StatIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs text-muted-foreground">{stat.label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="border-t border-border/20 pt-4 flex items-center justify-between">
                    <div className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                        {pkg.packageType}
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-foreground">${pkg.pricePerStudent}</span>
                        <span className="text-sm font-medium text-muted-foreground">/person</span>
                    </div>
                </div>

                {isPopular && (
                    <div className="absolute top-0 right-0 px-2 py-1 bg-orange-400/10 text-orange-400 text-xs font-bold tracking-wider" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 8% 100%)' }}>
                        Most Popular
                    </div>
                )}
            </div>
        </motion.div>
    );
};


// --- FILTERS & STATS ---

const LiquidToggle = ({
    options,
    active,
    setActive
}: {
    options: { id: PackageTypeFilter, label: string }[],
    active: PackageTypeFilter,
    setActive: (opt: PackageTypeFilter) => void
}) => {
    return (
        <div className="relative flex w-full max-w-xs mx-auto p-1 bg-card rounded-full border-2 border-border/20" style={{ filter: "url(#goo)" }}>
            <AnimatePresence>
                <motion.div
                    layoutId="liquid-pill-tab"
                    transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
                    className="absolute inset-0 bg-orange-400 rounded-full z-0"
                    style={{
                        width: `calc((100% - 0.5rem) / ${options.length})`,
                        left: `${options.findIndex(o => o.id === active) * (100 / options.length)}%`,
                        margin: "0.25rem",
                    }}
                />
            </AnimatePresence>
            {options.map(opt => (
                <button
                    key={opt.id}
                    onClick={() => setActive(opt.id)}
                    className="relative flex-1 py-2.5 text-sm font-semibold text-center transition-colors z-10"
                >
                    <span className={active === opt.id ? 'text-white' : 'text-muted-foreground'}>{opt.label}</span>
                </button>
            ))}
        </div>
    );
};

const StatCard = ({ icon: Icon, title, value, prefix, suffix, className }: any) => (
    <div className={`bg-card/80 backdrop-blur-sm border border-border/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-2">
            <Icon className="w-5 h-5 text-orange-400" />
            <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
        </div>
        <AnimatePresence mode="wait">
            <motion.div
                key={value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-bold text-foreground"
            >
                {prefix}{value}{suffix}
            </motion.div>
        </AnimatePresence>
    </div>
);

const EquipmentFilterCell = ({ label, count, isActive, onClick, isDisabled }: any) => (
    <button
        onClick={onClick}
        disabled={isDisabled}
        className={`relative text-center p-3 border-border/30 transition-all duration-200
            ${isActive ? "bg-orange-400/10" : "bg-card hover:bg-muted"}
            ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
            flex-1 border-y border-r first:border-l first:rounded-l-lg last:rounded-r-lg`}
    >
        <div className="flex flex-col items-center justify-center gap-1">
            <span className={`font-semibold text-sm ${isActive ? "text-orange-400" : "text-foreground"}`}>{label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? "bg-orange-400/20 text-orange-200" : "bg-muted text-muted-foreground"}`}>
                {count}
            </span>
        </div>
    </button>
);

const SortByDropdown = ({ sortBy, setSortBy, options }: { sortBy: string, setSortBy: (val: any) => void, options: any[] }) => (
    <div className="relative">
        <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortByFilter)}
            className="appearance-none bg-card border border-border/30 rounded-full py-1.5 pl-4 pr-8 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <ChevronDownIcon className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
);


// --- MAIN VIEW ---
export const PackageFilterView = ({ packages }: PackageFilterViewProps) => {
    const [packageTypeFilter, setPackageTypeFilter] = useState<PackageTypeFilter>("lessons");
    const [equipmentCategoryFilters, setEquipmentCategoryFilters] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortByFilter>("popular");

    const { filteredAndSortedPackages, counts, dynamicStats } = useMemo(() => {
        const newCounts = {
            lessons: packages.filter((p) => p.packageType === "lessons").length,
            rental: packages.filter((p) => p.packageType === "rental").length,
            kite: packages.filter((p) => p.categoryEquipment === "kite").length,
            wing: packages.filter((p) => p.categoryEquipment === "wing").length,
            windsurf: packages.filter((p) => p.categoryEquipment === "windsurf").length,
        };

        const packagesForStats = packages.filter(p => p.packageType === packageTypeFilter);
        const newDynamicStats = {
            lowestPricePerHour: 0,
            longestDuration: 0,
        };

        if (packagesForStats.length > 0) {
            newDynamicStats.lowestPricePerHour = Math.min(...packagesForStats.map(p => p.pricePerStudent / (p.durationMinutes / 60)).filter(p => p > 0));
            newDynamicStats.longestDuration = Math.max(...packagesForStats.map(p => p.durationMinutes));
        }

        const filtered = packages.filter((pkg) => {
            const matchesPackageType = pkg.packageType === packageTypeFilter;
            const matchesEquipmentCategory = equipmentCategoryFilters.length === 0 || equipmentCategoryFilters.includes(pkg.categoryEquipment!);
            return matchesPackageType && matchesEquipmentCategory;
        });

        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "popular": return b.bookingCount - a.bookingCount;
                case "price-low": return a.pricePerStudent - b.pricePerStudent;
                case "price-high": return b.pricePerStudent - a.pricePerStudent;
                case "duration-short": return a.durationMinutes - b.durationMinutes;
                case "duration-long": return b.durationMinutes - a.durationMinutes;
                default: return 0;
            }
        });

        return { filteredAndSortedPackages: sorted, counts: newCounts, dynamicStats: newDynamicStats };
    }, [packages, packageTypeFilter, equipmentCategoryFilters, sortBy]);

    const handleEquipmentFilterToggle = (value: string) => {
        const newFilters = equipmentCategoryFilters.includes(value)
            ? equipmentCategoryFilters.filter(f => f !== value)
            : [...equipmentCategoryFilters, value];
        setEquipmentCategoryFilters(newFilters);
    };

    const packageTypeOptions = [{ id: 'lessons', label: 'Lessons' }, { id: 'rental', label: 'Rental' }] as const;
    const equipmentFilterOptions = [{ id: 'kite', label: 'Kite' }, { id: 'wing', label: 'Wing' }, { id: 'windsurf', label: 'Windsurf' }];
    const sortByOptions = [{ value: "popular", label: "Most Popular" }, { value: "price-low", label: "Price: Low to High" }, { value: "price-high", label: "Price: High to Low" }, { value: "duration-short", label: "Duration: Shortest" }, { value: "duration-long", label: "Duration: Longest" }];

    return (
        <div className="relative isolate w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <svg className="absolute -z-10 w-0 h-0"><defs><filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" /><feComposite in="SourceGraphic" in2="goo" operator="atop"/></filter></defs></svg>

            {/* Liquid Toggle */}
            <div className="mb-8">
                <LiquidToggle options={packageTypeOptions} active={packageTypeFilter} setActive={setPackageTypeFilter} />
            </div>

            {/* Dynamic Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto">
                <StatCard icon={ArrowTrendingDownIcon} title="Best Value" value={dynamicStats.lowestPricePerHour.toFixed(2)} prefix="$" suffix="/hr" />
                <StatCard icon={ArrowTrendingUpIcon} title="Longest Session" value={getPrettyDuration(dynamicStats.longestDuration)} />
                <StatCard icon={FireIcon} title="Popular Packages" value={filteredAndSortedPackages.filter(p => p.bookingCount > 10).length} />
            </div>

            {/* Equipment Filters */}
            <div className="flex justify-center mb-8">
                <div className="flex w-full max-w-md rounded-lg">
                    {equipmentFilterOptions.map(opt => (
                        <EquipmentFilterCell key={opt.id} label={opt.label} count={(counts as any)[opt.id]} isActive={equipmentCategoryFilters.includes(opt.id)} onClick={() => handleEquipmentFilterToggle(opt.id)} isDisabled={(counts as any)[opt.id] === 0} />
                    ))}
                </div>
            </div>

            {/* Sort & Count */}
            <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
                <p className="text-sm font-medium text-muted-foreground">
                    Showing <span className="font-bold text-foreground">{filteredAndSortedPackages.length}</span> of <span className="font-bold text-foreground">{packages.length}</span> packages
                </p>
                <SortByDropdown sortBy={sortBy} setSortBy={setSortBy} options={sortByOptions} />
            </div>

            {/* Packages Grid */}
            <AnimatePresence>
                {filteredAndSortedPackages.length > 0 ? (
                     <motion.div layout className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                        {filteredAndSortedPackages.map((pkg) => (
                            <PackageCard key={pkg.id} pkg={pkg} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 px-6 bg-card/50 border border-dashed border-border/30 rounded-xl max-w-7xl mx-auto">
                        <h3 className="text-xl font-semibold text-foreground">No Packages Found</h3>
                        <p className="mt-2 text-muted-foreground">Try adjusting your filters to find the perfect package for your adventure.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};