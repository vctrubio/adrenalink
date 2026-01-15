"use client";

import { useMemo, useState } from "react";
import type { SchoolPackage } from "@/supabase/db/types";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { SPORTS_CONFIG } from "@/src/components/school/SportSelection";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getHMDuration } from "@/getters/duration-getter";

interface PackageCardProps {
    pkg: SchoolPackage;
    currencySymbol: string;
}

interface SchoolPackageContainerProps {
    packages: SchoolPackage[];
    currencySymbol: string;
    schoolId: string;
}

/**
 * Game-style Package Card for subdomain view
 * Layout: Header (Title) -> Body (Stats & Capacity) -> Footer (Price Table & Action)
 */
export function PackageCard({ pkg, currencySymbol }: PackageCardProps) {
    const {
        id,
        description,
        price_per_student,
        duration_minutes,
        package_type,
        capacity_students,
        capacity_equipment,
        category_equipment,
    } = pkg;
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();

    // Get sport config for image
    const sportConfig = SPORTS_CONFIG.find((s) => s.id === category_equipment);

    // Determine type and color theme
    const isRental = package_type?.toLowerCase().includes("rental");

    // Calculate PPH if duration != 1hr (60 mins)
    const durationHours = duration_minutes / 60;
    const pph = duration_minutes !== 60 ? Math.round(price_per_student / durationHours) : null;

    const handleCardClick = () => {
        router.push(`/register?add=package:${id}`);
    };

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCardClick}
            className={
                "group relative w-full overflow-hidden rounded-[2.5rem] bg-white shadow-lg cursor-pointer flex flex-col select-none"
            }
        >
            {/* 1. Header: Description */}
            <div className="px-8 pt-8 pb-6 border-b border-zinc-100 flex flex-col gap-4">
                <h4 className="text-xl font-black uppercase italic tracking-tighter leading-tight text-zinc-900 group-hover:text-black transition-colors line-clamp-2">
                    {description}
                </h4>
            </div>

            {/* 2. Middle: Equipment vs Students */}
            <div className="px-8 py-10 flex flex-col items-center justify-center gap-4 bg-zinc-50/30">
                <div className="flex items-center gap-4">
                    <span className="text-l font-black text-zinc-900 tracking-tighter uppercase">
                        {capacity_equipment} {category_equipment}
                    </span>
                    <span className="text-sm font-bold text-zinc-300 uppercase tracking-widest italic">vs</span>
                    <span className="text-2xl font-black text-zinc-900 tracking-tighter uppercase">
                        {capacity_students} {capacity_students === 1 ? "Student" : "Students"}
                    </span>
                </div>
                {sportConfig?.image && (
                    <div
                        className={`relative w-16 h-16 transition-all duration-500 mt-2 ${
                            isHovered ? "opacity-40 grayscale-0 brightness-0" : "opacity-20 grayscale"
                        }`}
                    >
                        <Image src={sportConfig.image} alt={sportConfig.id} fill className="object-contain" />
                    </div>
                )}
            </div>

            {/* 3. Footer: Prices & Book Now */}
            <div className="px-8 py-8 mt-auto border-t border-zinc-100 bg-white rounded-b-[2.5rem] flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-zinc-900 tracking-tighter">
                            {currencySymbol}
                            {price_per_student}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">per student</span>
                    </div>

                    {pph && (
                        <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-tight">
                            <span className="text-zinc-200">•</span>
                            <span>
                                {currencySymbol}
                                {pph}/hour
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-2">
                    {package_type && (
                        <span
                            className={`
                                shrink-0 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border
                                ${isRental ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"}
                            `}
                        >
                            <span className="font-black mr-2">{getHMDuration(duration_minutes)}</span>
                            <span className="font-medium opacity-60">{package_type}</span>
                        </span>
                    )}
                    <span
                        className={`
                            text-[10px] font-black uppercase transition-all duration-500 text-zinc-900
                            ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
                        `}
                    >
                        Book
                    </span>
                    <div
                        className="relative w-8 h-8 transition-all duration-500"
                        style={{
                            filter: isHovered
                                ? "brightness(0) saturate(100%) hue-rotate(30deg) drop-shadow(0 0 8px rgba(251, 146, 60, 0.4))"
                                : "brightness(0) opacity(0.3)",
                        }}
                    >
                        <Image src="/ADR.webp" alt="ADR" fill className="object-contain" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SchoolPackageContainer({ packages, currencySymbol, schoolId }: SchoolPackageContainerProps) {
    const [isSelectedArray, setIsSelectedArray] = useState<string[]>([]);
    const [packageTypeFilter, setPackageTypeFilter] = useState<"lessons" | "rental" | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);
    const router = useRouter();

    const toggleCategory = (cat: string) => {
        setIsSelectedArray((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
    };

    const togglePackageType = (type: "lessons" | "rental") => {
        setPackageTypeFilter((prev) => (prev === type ? null : type));
    };

    // Filter packages by type first
    const filteredPackages = useMemo(() => {
        if (!packageTypeFilter) return packages;
        return packages.filter((pkg) => {
            const pkgType = pkg.package_type?.toLowerCase() || "";
            if (packageTypeFilter === "rental") {
                return pkgType.includes("rental");
            }
            if (packageTypeFilter === "lessons") {
                return pkgType.includes("lesson") || (!pkgType.includes("rental") && pkgType);
            }
            return true;
        });
    }, [packages, packageTypeFilter]);

    // Group packages by category (using snake_case from Supabase)
    const groupedPackages = useMemo(() => {
        const groups: Record<string, SchoolPackage[]> = {};
        filteredPackages.forEach((pkg) => {
            const cat = pkg.category_equipment || "Other";
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(pkg);
        });
        return groups;
    }, [filteredPackages]);

    // Get sorted categories
    const categories = useMemo(() => {
        const groupKeys = Object.keys(groupedPackages);
        return groupKeys.sort((a, b) => {
            const configA = EQUIPMENT_CATEGORIES.find((c) => c.id === a);
            const configB = EQUIPMENT_CATEGORIES.find((c) => c.id === b);

            if (!configA && !configB) return a.localeCompare(b);
            if (!configA) return 1;
            if (!configB) return -1;
            return 0;
        });
    }, [groupedPackages]);

    const handleSeedPackages = async () => {
        setIsSeeding(true);
        try {
            // Call package, student, teacher, and equipment seeding in parallel
            const [packageResponse, studentResponse, teacherResponse, equipmentResponse] = await Promise.all([
                fetch("/api/beta", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ type: "package", schoolId }),
                }),
                fetch("/api/beta", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ type: "student", schoolId }),
                }),
                fetch("/api/beta", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ type: "teacher", schoolId }),
                }),
                fetch("/api/beta", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ type: "equipment", schoolId }),
                }),
            ]);

            // Check all responses
            if (!packageResponse.ok) {
                throw new Error("Failed to populate packages");
            }
            if (!studentResponse.ok) {
                throw new Error("Failed to populate students");
            }
            if (!teacherResponse.ok) {
                throw new Error("Failed to populate teachers");
            }
            if (!equipmentResponse.ok) {
                throw new Error("Failed to populate equipment");
            }

            // Revalidate the page to show new packages
            router.refresh();
        } catch (error) {
            console.error("Error populating data:", error);
            setIsSeeding(false);
        }
    };

    if (categories.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                <Image src="/ADR.webp" alt="Adrenalink" width={200} height={200} className="grayscale opacity-20" />
                <div className="flex flex-col items-center gap-4">
                    <div>
                        <span className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] block mb-2 text-zinc-400">
                            No Packages
                        </span>
                        <span className="text-sm font-bold uppercase tracking-[0.5em] text-zinc-300">Available right now</span>
                    </div>
                    <button
                        onClick={handleSeedPackages}
                        disabled={isSeeding}
                        className={`
                            px-8 py-4 rounded-2xl border transition-all duration-300 font-black uppercase tracking-tight
                            ${
                                isSeeding
                                    ? "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                                    : "bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800 hover:scale-105 shadow-xl"
                            }
                        `}
                    >
                        {isSeeding ? "Populating..." : "Populate My School"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-8">
            {/* Category Selector Bar */}
            <div className="flex flex-wrap items-center gap-4 justify-between px-2">
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    {categories.map((cat) => {
                    const config = EQUIPMENT_CATEGORIES.find((c) => c.id === cat);
                    const sportConfig = SPORTS_CONFIG.find((s) => s.id === cat);
                    const isSelected = isSelectedArray.includes(cat);

                    return (
                        <button
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`
                                flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300
                                ${
                                    isSelected
                                        ? "bg-zinc-900 border-zinc-900 text-white shadow-xl scale-105"
                                        : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600"
                                }
                            `}
                        >
                            <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isSelected ? "bg-white/20" : "bg-zinc-50"}`}
                            >
                                {sportConfig?.image ? (
                                    <Image
                                        src={sportConfig.image}
                                        alt={sportConfig.id}
                                        width={20}
                                        height={20}
                                        className={`object-contain ${isSelected ? "brightness-0 invert" : ""}`}
                                    />
                                ) : config?.icon ? (
                                    <config.icon className="w-5 h-5" />
                                ) : null}
                            </div>
                            <span className="text-lg font-black uppercase tracking-tight">{config?.name || cat}</span>
                            <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-md ${isSelected ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-400"}`}
                            >
                                {groupedPackages[cat].length}
                            </span>
                        </button>
                    );
                })}
                </div>
                {/* Package Type Filters */}
                <div className="flex gap-3">
                    {(["lessons", "rental"] as const).map((type) => {
                        const isSelected = packageTypeFilter === type;
                        return (
                            <button
                                key={type}
                                onClick={() => togglePackageType(type)}
                                className={`
                                    px-6 py-3 rounded-2xl border transition-all duration-300
                                    ${
                                        isSelected
                                            ? "bg-zinc-900 border-zinc-900 text-white shadow-xl scale-105"
                                            : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600"
                                    }
                                `}
                            >
                                <span className="text-lg font-black uppercase tracking-tight">{type === "lessons" ? "Lessons" : "Rental"}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Scrollable Cards Area */}
            <div className="flex-1 overflow-y-auto px-2 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {categories.map((cat) => {
                        const isSelected = isSelectedArray.includes(cat);
                        // If nothing is selected, show everything. If something is selected, show only selected categories.
                        if (isSelectedArray.length > 0 && !isSelected) return null;

                        return groupedPackages[cat].map((pkg) => (
                            <PackageCard key={pkg.id} pkg={pkg} currencySymbol={currencySymbol} />
                        ));
                    })}
                </div>
            </div>
        </div>
    );
}
