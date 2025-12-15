"use client";

import { useState, useMemo } from "react";
import type { SchoolPackageType } from "@/drizzle/schema";
import { getPrettyDuration } from "@/getters/duration-getter";
import { EQUIPMENT_CATEGORIES, EquipmentCategoryConfig } from "@/config/equipment";
import { ChevronDownIcon, UsersIcon, ClockIcon, FireIcon, WrenchScrewdriverIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";

// --- PROPS ---
interface PackageFilterViewProps {
    packages: Array<SchoolPackageType & { bookingCount: number }>;
    schoolName: string;
    schoolUsername: string;
}

// --- TYPES ---
type PackageTypeFilter = "lessons" | "rental";
type SortByFilter = "popular" | "price-low" | "price-high" | "duration-short" | "duration-long";

// --- BOOKING MODAL ---
interface BookingModalProps {
    pkg: SchoolPackageType & { bookingCount: number };
    schoolName: string;
    schoolUsername: string;
    onClose: () => void;
}

const BookingModal = ({ pkg, schoolName, schoolUsername, onClose }: BookingModalProps) => {
    const [studentName, setStudentName] = useState("");
    const [studentEmail, setStudentEmail] = useState("");
    const [studentPhone, setStudentPhone] = useState("");
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<"form" | "confirm">("form");

    const categoryConfig =
        EQUIPMENT_CATEGORIES.find((c) => c.id === pkg.categoryEquipment) ||
        ({ id: "default", name: "Package", icon: FireIcon, color: "#fb923c" } as EquipmentCategoryConfig);
    const CategoryIcon = categoryConfig.icon;

    const durationHours = pkg.durationMinutes / 60;
    const pricePerHour = durationHours > 0 ? pkg.pricePerStudent / durationHours : 0;

    const isStudentInfoComplete = studentName && studentEmail;
    const isDatesComplete = dateStart && dateEnd;
    const canSubmit = isStudentInfoComplete && isDatesComplete;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setIsSubmitting(true);

        const studentPackageRequest = {
            schoolPackageId: pkg.id,
            walletId: "current-user-wallet-id",
            requestedDateStart: dateStart,
            requestedDateEnd: dateEnd,
            status: "requested" as const,
            studentInfo: { name: studentName, email: studentEmail, phone: studentPhone },
        };

        console.log("=".repeat(60));
        console.log("ADRENALINK - Student Package Request");
        console.log("=".repeat(60));
        console.log("\nSchool:", schoolName);
        console.log("API Endpoint: POST /api/student-packages");
        console.log("\nRequest Payload:");
        console.log(JSON.stringify(studentPackageRequest, null, 2));
        console.log("\nPackage Details:");
        console.log({
            school: schoolName,
            packageId: pkg.id,
            description: pkg.description,
            pricePerStudent: pkg.pricePerStudent,
            durationMinutes: pkg.durationMinutes,
            capacityStudents: pkg.capacityStudents,
            categoryEquipment: pkg.categoryEquipment,
            packageType: pkg.packageType,
        });
        console.log("=".repeat(60));

        await new Promise((resolve) => setTimeout(resolve, 1200));
        setIsSubmitting(false);
        setStep("confirm");
    };

    // Entity colors from config
    const STUDENT_COLOR = "#eab308";
    const BOOKING_COLOR = "#3b82f6";
    const PACKAGE_COLOR = "#fb923c";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md bg-background rounded-3xl overflow-hidden shadow-2xl"
            >
                <AnimatePresence mode="wait">
                    {step === "form" ? (
                        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Header */}
                            <div className="relative p-6 pb-4">
                                <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-muted/80 hover:bg-muted transition-colors" title="Esc">
                                    <XMarkIcon className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${categoryConfig.color}15` }}>
                                        <CategoryIcon className="w-7 h-7" style={{ color: categoryConfig.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold" style={{ color: categoryConfig.color }}>{schoolName} <span className="font-normal text-muted-foreground">@{schoolUsername}</span></p>
                                        <h2 className="text-lg font-semibold text-foreground">{pkg.description}</h2>
                                        <p className="text-xs text-muted-foreground mt-0.5">{getPrettyDuration(pkg.durationMinutes)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="px-6 pb-6 space-y-3">
                                {/* Step 1: Student Info */}
                                <Disclosure defaultOpen>
                                    {({ open }) => (
                                        <div className={`rounded-2xl transition-all ${open ? "bg-card" : "bg-transparent"}`}>
                                            <DisclosureButton className="w-full p-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50">
                                                    {isStudentInfoComplete ? (
                                                        <CheckIcon className="w-5 h-5" style={{ color: STUDENT_COLOR }} />
                                                    ) : (
                                                        <HelmetIcon className="w-5 h-5" style={{ color: STUDENT_COLOR }} />
                                                    )}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-medium text-foreground">Student Info</p>
                                                    {isStudentInfoComplete && <p className="text-xs text-muted-foreground">{studentName}</p>}
                                                </div>
                                                <ChevronDownIcon className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                                            </DisclosureButton>
                                            <DisclosurePanel className="px-4 pb-4 space-y-4">
                                                <input
                                                    type="text"
                                                    value={studentName}
                                                    onChange={(e) => setStudentName(e.target.value)}
                                                    placeholder="Full name"
                                                    className="w-full h-12 px-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card"
                                                    style={{ "--tw-ring-color": STUDENT_COLOR } as React.CSSProperties}
                                                />
                                                <input
                                                    type="email"
                                                    value={studentEmail}
                                                    onChange={(e) => setStudentEmail(e.target.value)}
                                                    placeholder="Email address"
                                                    className="w-full h-12 px-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card"
                                                    style={{ "--tw-ring-color": STUDENT_COLOR } as React.CSSProperties}
                                                />
                                                <input
                                                    type="tel"
                                                    value={studentPhone}
                                                    onChange={(e) => setStudentPhone(e.target.value)}
                                                    placeholder="Phone (optional)"
                                                    className="w-full h-12 px-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card"
                                                    style={{ "--tw-ring-color": STUDENT_COLOR } as React.CSSProperties}
                                                />
                                            </DisclosurePanel>
                                        </div>
                                    )}
                                </Disclosure>

                                {/* Step 2: Booking Dates */}
                                <Disclosure>
                                    {({ open }) => (
                                        <div className={`rounded-2xl transition-all ${open ? "bg-card" : "bg-transparent"}`}>
                                            <DisclosureButton className="w-full p-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50">
                                                    {isDatesComplete ? (
                                                        <CheckIcon className="w-5 h-5" style={{ color: BOOKING_COLOR }} />
                                                    ) : (
                                                        <BookingIcon className="w-5 h-5" style={{ color: BOOKING_COLOR }} />
                                                    )}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-medium text-foreground">Booking Dates</p>
                                                    {isDatesComplete && <p className="text-xs text-muted-foreground">{dateStart} → {dateEnd}</p>}
                                                </div>
                                                <ChevronDownIcon className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                                            </DisclosureButton>
                                            <DisclosurePanel className="px-4 pb-4">
                                                <div className="flex gap-3">
                                                    <input
                                                        type="date"
                                                        value={dateStart}
                                                        onChange={(e) => setDateStart(e.target.value)}
                                                        min={new Date().toISOString().split("T")[0]}
                                                        className="flex-1 h-12 px-4 bg-muted/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card"
                                                        style={{ "--tw-ring-color": BOOKING_COLOR } as React.CSSProperties}
                                                    />
                                                    <input
                                                        type="date"
                                                        value={dateEnd}
                                                        onChange={(e) => setDateEnd(e.target.value)}
                                                        min={dateStart || new Date().toISOString().split("T")[0]}
                                                        className="flex-1 h-12 px-4 bg-muted/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card"
                                                        style={{ "--tw-ring-color": BOOKING_COLOR } as React.CSSProperties}
                                                    />
                                                </div>
                                            </DisclosurePanel>
                                        </div>
                                    )}
                                </Disclosure>

                                {/* Step 3: Package Summary */}
                                <Disclosure>
                                    {({ open }) => (
                                        <div className={`rounded-2xl transition-all ${open ? "bg-card" : "bg-transparent"}`}>
                                            <DisclosureButton className="w-full p-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50">
                                                    <PackageIcon className="w-5 h-5" style={{ color: PACKAGE_COLOR }} />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-medium text-foreground">Package Summary</p>
                                                    <p className="text-xs text-muted-foreground">${pkg.pricePerStudent} per person</p>
                                                </div>
                                                <ChevronDownIcon className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                                            </DisclosureButton>
                                            <DisclosurePanel className="px-4 pb-4">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Duration</span>
                                                        <span className="text-foreground font-medium">{getPrettyDuration(pkg.durationMinutes)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Equipment</span>
                                                        <span className="text-foreground font-medium">{categoryConfig.name} × {pkg.capacityEquipment}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Group size</span>
                                                        <span className="text-foreground font-medium">Up to {pkg.capacityStudents}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Hourly rate</span>
                                                        <span className="text-foreground font-medium">${pricePerHour.toFixed(0)}/hr</span>
                                                    </div>
                                                    <div className="pt-3 mt-3 border-t border-muted/50 flex justify-between items-center">
                                                        <span className="text-sm text-muted-foreground">Total</span>
                                                        <span className="text-2xl font-bold" style={{ color: PACKAGE_COLOR }}>${pkg.pricePerStudent}</span>
                                                    </div>
                                                </div>
                                            </DisclosurePanel>
                                        </div>
                                    )}
                                </Disclosure>

                                {/* Request Button */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || isSubmitting}
                                    className="w-full h-14 mt-2 rounded-2xl font-semibold text-request-foreground bg-request disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-request/20"
                                >
                                    {isSubmitting ? "Sending..." : canSubmit ? "Request Booking" : "Complete all steps"}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-request/10 flex items-center justify-center">
                                <CheckIcon className="w-8 h-8 text-request" />
                            </div>
                            <h2 className="text-xl font-semibold text-foreground">Request Sent</h2>
                            <p className="text-sm text-muted-foreground mt-2 mb-8">{schoolName} will review and respond soon</p>

                            <div className="bg-card rounded-2xl p-4 mb-6 space-y-3 text-left">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Student</span>
                                    <span className="text-foreground font-medium">{studentName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Dates</span>
                                    <span className="text-foreground font-medium">{dateStart} → {dateEnd}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="font-medium" style={{ color: STUDENT_COLOR }}>Pending</span>
                                </div>
                            </div>

                            <button onClick={onClose} className="w-full h-12 rounded-2xl font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors">
                                Done
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

// --- PACKAGE CARD ---
const PackageCard = ({ pkg, onClick }: { pkg: SchoolPackageType & { bookingCount: number }; onClick: () => void }) => {
    const handleClick = () => {
        console.log("PackageCard handleClick fired for:", pkg.id);
        onClick();
    };

    const categoryConfig =
        EQUIPMENT_CATEGORIES.find((c) => c.id === pkg.categoryEquipment) ||
        ({
            id: "default",
            name: "Package",
            icon: FireIcon,
            color: "#fb923c",
        } as EquipmentCategoryConfig);
    const CategoryIcon = categoryConfig.icon;

    const isPopular = pkg.bookingCount > 10;
    const durationHours = pkg.durationMinutes / 60;
    const pricePerHour = durationHours > 0 ? pkg.pricePerStudent / durationHours : 0;

    const stats = [
        { icon: UsersIcon, label: `Up to ${pkg.capacityStudents} students` },
        { icon: WrenchScrewdriverIcon, label: `${pkg.capacityEquipment} equipment sets` },
        { icon: ClockIcon, label: getPrettyDuration(pkg.durationMinutes) },
        {
            icon: () => (
                <span className="font-bold text-sm" style={{ color: categoryConfig.color }}>
                    $/h
                </span>
            ),
            label: `$${pricePerHour.toFixed(2)} per hour`,
        },
    ];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={handleClick}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="group relative bg-card/60 border border-border/20 rounded-xl overflow-hidden transition-all duration-300 hover:border-orange-400/40 hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer"
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="text-lg font-bold text-foreground">{pkg.description}</h3>
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
                    <div className="text-xs uppercase font-bold tracking-widest text-muted-foreground">{pkg.packageType}</div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-foreground">${pkg.pricePerStudent}</span>
                        <span className="text-sm font-medium text-muted-foreground">/person</span>
                    </div>
                </div>

                {isPopular && (
                    <div className="absolute top-0 right-0 px-2 py-1 bg-orange-400/10 text-orange-400 text-xs font-bold tracking-wider" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 8% 100%)" }}>
                        Most Popular
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// --- FILTERS & STATS ---

const LiquidToggle = ({ options, active, setActive }: { options: { id: PackageTypeFilter; label: string }[]; active: PackageTypeFilter; setActive: (opt: PackageTypeFilter) => void }) => {
    return (
        <div className="relative flex w-full max-w-xs mx-auto p-1 bg-card rounded-full border-2 border-border/20" style={{ filter: "url(#goo)" }}>
            <AnimatePresence>
                <motion.div
                    layoutId="liquid-pill-tab"
                    transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
                    className="absolute inset-0 bg-orange-400 rounded-full z-0"
                    style={{
                        width: `calc((100% - 0.5rem) / ${options.length})`,
                        left: `${options.findIndex((o) => o.id === active) * (100 / options.length)}%`,
                        margin: "0.25rem",
                    }}
                />
            </AnimatePresence>
            {options.map((opt) => (
                <button key={opt.id} onClick={() => setActive(opt.id)} className="relative flex-1 py-2.5 text-sm font-semibold text-center transition-colors z-10">
                    <span className={active === opt.id ? "text-white" : "text-muted-foreground"}>{opt.label}</span>
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
            <motion.div key={value} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="text-2xl font-bold text-foreground">
                {prefix}
                {value}
                {suffix}
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
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? "bg-orange-400/20 text-orange-200" : "bg-muted text-muted-foreground"}`}>{count}</span>
        </div>
    </button>
);

const SortByDropdown = ({ sortBy, setSortBy, options }: { sortBy: string; setSortBy: (val: any) => void; options: any[] }) => (
    <div className="relative">
        <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortByFilter)}
            className="appearance-none bg-card border border-border/30 rounded-full py-1.5 pl-4 pr-8 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
        <ChevronDownIcon className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
);

// --- MAIN VIEW ---
export const PackageFilterView = ({ packages, schoolName }: PackageFilterViewProps) => {
    const [packageTypeFilter, setPackageTypeFilter] = useState<PackageTypeFilter>("lessons");
    const [equipmentCategoryFilters, setEquipmentCategoryFilters] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortByFilter>("popular");
    const [selectedPackage, setSelectedPackage] = useState<(SchoolPackageType & { bookingCount: number }) | null>(null);

    const { filteredAndSortedPackages, counts, dynamicStats } = useMemo(() => {
        const newCounts = {
            lessons: packages.filter((p) => p.packageType === "lessons").length,
            rental: packages.filter((p) => p.packageType === "rental").length,
            kite: packages.filter((p) => p.categoryEquipment === "kite").length,
            wing: packages.filter((p) => p.categoryEquipment === "wing").length,
            windsurf: packages.filter((p) => p.categoryEquipment === "windsurf").length,
        };

        const packagesForStats = packages.filter((p) => p.packageType === packageTypeFilter);
        const newDynamicStats = {
            lowestPricePerHour: 0,
            longestDuration: 0,
        };

        if (packagesForStats.length > 0) {
            newDynamicStats.lowestPricePerHour = Math.min(...packagesForStats.map((p) => p.pricePerStudent / (p.durationMinutes / 60)).filter((p) => p > 0));
            newDynamicStats.longestDuration = Math.max(...packagesForStats.map((p) => p.durationMinutes));
        }

        const filtered = packages.filter((pkg) => {
            const matchesPackageType = pkg.packageType === packageTypeFilter;
            const matchesEquipmentCategory = equipmentCategoryFilters.length === 0 || equipmentCategoryFilters.includes(pkg.categoryEquipment!);
            return matchesPackageType && matchesEquipmentCategory;
        });

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

        return { filteredAndSortedPackages: sorted, counts: newCounts, dynamicStats: newDynamicStats };
    }, [packages, packageTypeFilter, equipmentCategoryFilters, sortBy]);

    const handleEquipmentFilterToggle = (value: string) => {
        const newFilters = equipmentCategoryFilters.includes(value) ? equipmentCategoryFilters.filter((f) => f !== value) : [...equipmentCategoryFilters, value];
        setEquipmentCategoryFilters(newFilters);
    };

    const packageTypeOptions = [
        { id: "lessons", label: "Lessons" },
        { id: "rental", label: "Rental" },
    ] as const;
    const equipmentFilterOptions = [
        { id: "kite", label: "Kite" },
        { id: "wing", label: "Wing" },
        { id: "windsurf", label: "Windsurf" },
    ];
    const sortByOptions = [
        { value: "popular", label: "Most Popular" },
        { value: "price-low", label: "Price: Low to High" },
        { value: "price-high", label: "Price: High to Low" },
        { value: "duration-short", label: "Duration: Shortest" },
        { value: "duration-long", label: "Duration: Longest" },
    ];

    return (
        <div className="relative isolate w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <svg className="absolute -z-10 w-0 h-0">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>

            {/* Liquid Toggle */}
            <div className="mb-8">
                <LiquidToggle options={packageTypeOptions} active={packageTypeFilter} setActive={setPackageTypeFilter} />
            </div>

            {/* Dynamic Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto">
                <StatCard icon={ArrowTrendingDownIcon} title="Best Value" value={dynamicStats.lowestPricePerHour.toFixed(2)} prefix="$" suffix="/hr" />
                <StatCard icon={ArrowTrendingUpIcon} title="Longest Session" value={getPrettyDuration(dynamicStats.longestDuration)} />
                <StatCard icon={FireIcon} title="Popular Packages" value={filteredAndSortedPackages.filter((p) => p.bookingCount > 10).length} />
            </div>

            {/* Equipment Filters */}
            <div className="flex justify-center mb-8">
                <div className="flex w-full max-w-md rounded-lg">
                    {equipmentFilterOptions.map((opt) => (
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
                            <PackageCard key={pkg.id} pkg={pkg} onClick={() => { console.log("Package clicked:", pkg.id, pkg.description); setSelectedPackage(pkg); }} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 px-6 bg-card/50 border border-dashed border-border/30 rounded-xl max-w-7xl mx-auto">
                        <h3 className="text-xl font-semibold text-foreground">No Packages Found</h3>
                        <p className="mt-2 text-muted-foreground">Try adjusting your filters to find the perfect package for your adventure.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Booking Modal */}
            <AnimatePresence>
                {selectedPackage && <BookingModal pkg={selectedPackage} schoolName={schoolName} onClose={() => setSelectedPackage(null)} />}
            </AnimatePresence>
        </div>
    );
};
