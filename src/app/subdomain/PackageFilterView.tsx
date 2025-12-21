"use client";

import { useState, useMemo } from "react";
import type { SchoolPackageType } from "@/drizzle/schema";
import { getPrettyDuration } from "@/getters/duration-getter";
import { EQUIPMENT_CATEGORIES, type EquipmentCategoryConfig } from "@/config/equipment";
import { ENTITY_DATA } from "@/config/entities";
import { ChevronDownIcon, FireIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";

// --- PROPS ---
interface PackageFilterViewProps {
    packages: (SchoolPackageType & { bookingCount: number })[];
    schoolName: string;
    schoolUsername: string;
    equipmentCategoryFilters: string[];
    packageTypeFilter: PackageTypeFilter;
}

// --- TYPES ---
type PackageTypeFilter = "lessons" | "rental";
type SortByFilter = "equipment" | "duration" | "price" | "capacity" | "popularity";
type SortDirection = "asc" | "desc";

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

        // TODO: Replace with actual API call
        // POST /api/student-packages with studentPackageRequest payload

        await new Promise((resolve) => setTimeout(resolve, 1200));
        setIsSubmitting(false);
        setStep("confirm");
    };

    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking");
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");

    const STUDENT_COLOR = studentEntity?.color || "#eab308";
    const BOOKING_COLOR = bookingEntity?.color || "#3b82f6";
    const PACKAGE_COLOR = packageEntity?.color || "#fb923c";

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

// --- MAIN VIEW ---
export const PackageFilterView = ({ packages, schoolName, schoolUsername, equipmentCategoryFilters, packageTypeFilter }: PackageFilterViewProps) => {
    const [sortBy, setSortBy] = useState<SortByFilter>("popularity");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [selectedPackage, setSelectedPackage] = useState<(SchoolPackageType & { bookingCount: number }) | null>(null);

    const handleSort = (column: SortByFilter) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortDirection("desc");
        }
    };

    const filteredAndSortedPackages = useMemo(() => {
        const filtered = packages.filter((pkg) => {
            const matchesPackageType = pkg.packageType === packageTypeFilter;
            const matchesEquipmentCategory = equipmentCategoryFilters.length === 0 || equipmentCategoryFilters.includes(pkg.categoryEquipment!);
            return matchesPackageType && matchesEquipmentCategory;
        });

        const sorted = [...filtered].sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case "equipment":
                    comparison = (a.categoryEquipment || "").localeCompare(b.categoryEquipment || "");
                    break;
                case "popularity":
                    comparison = b.bookingCount - a.bookingCount;
                    break;
                case "price":
                    comparison = a.pricePerStudent - b.pricePerStudent;
                    break;
                case "duration":
                    comparison = a.durationMinutes - b.durationMinutes;
                    break;
                case "capacity":
                    comparison = a.capacityStudents - b.capacityStudents;
                    break;
                default:
                    return 0;
            }

            return sortDirection === "asc" ? comparison : -comparison;
        });

        return sorted;
    }, [packages, packageTypeFilter, equipmentCategoryFilters, sortBy, sortDirection]);

    return (
        <div className="relative isolate w-full">
            {/* Packages Table */}
            <AnimatePresence mode="wait">
                {filteredAndSortedPackages.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full overflow-hidden rounded-b-xl rounded-t-xl md:rounded-tr-none border-2 border-border/20 bg-card/60"
                    >
                        {/* Table Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="grid grid-cols-7 gap-4 bg-card/50 p-4 border-b border-border/30"
                        >
                            <button onClick={() => handleSort("equipment")} className="text-xs font-semibold text-muted-foreground uppercase text-left hover:text-foreground transition-colors flex items-center gap-1">
                                {packageTypeFilter === "lessons" ? "Lesson" : "Rental"}
                                {sortBy === "equipment" && (
                                    <ChevronDownIcon className={`w-3 h-3 transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                                )}
                            </button>
                            <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase">Description</div>
                            <button onClick={() => handleSort("capacity")} className="text-xs font-semibold text-muted-foreground uppercase text-center hover:text-foreground transition-colors flex items-center justify-center gap-1">
                                Capacity
                                {sortBy === "capacity" && (
                                    <ChevronDownIcon className={`w-3 h-3 transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                                )}
                            </button>
                            <button onClick={() => handleSort("duration")} className="text-xs font-semibold text-muted-foreground uppercase text-right hover:text-foreground transition-colors flex items-center justify-end gap-1">
                                Duration
                                {sortBy === "duration" && (
                                    <ChevronDownIcon className={`w-3 h-3 transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                                )}
                            </button>
                            <button onClick={() => handleSort("price")} className="text-xs font-semibold text-muted-foreground uppercase text-right hover:text-foreground transition-colors flex items-center justify-end gap-1">
                                Price/Person
                                {sortBy === "price" && (
                                    <ChevronDownIcon className={`w-3 h-3 transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                                )}
                            </button>
                            <button onClick={() => handleSort("popularity")} className="text-xs font-semibold text-muted-foreground uppercase text-center hover:text-foreground transition-colors flex items-center justify-center gap-1">
                                Requests
                                {sortBy === "popularity" && (
                                    <ChevronDownIcon className={`w-3 h-3 transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                                )}
                            </button>
                        </motion.div>

                        {/* Table Rows */}
                        <motion.div layout>
                            {filteredAndSortedPackages.map((pkg, index) => {
                                const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === pkg.categoryEquipment) || {
                                    id: "default",
                                    name: "Package",
                                    icon: FireIcon,
                                    color: "#fb923c",
                                };
                                const CategoryIcon = categoryConfig.icon;
                                const durationHours = pkg.durationMinutes / 60;
                                const pricePerHour = durationHours > 0 ? pkg.pricePerStudent / durationHours : 0;

                                const isRental = pkg.packageType === "rental";
                                const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
                                const rentalEntity = ENTITY_DATA.find((e) => e.id === "rental");
                                const helmetColor = isRental ? rentalEntity?.color : studentEntity?.color;

                                const schoolPackageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");
                                const packageColor = schoolPackageEntity?.color || "#fb923c";

                                return (
                                    <motion.div
                                        key={pkg.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{
                                            duration: 0.4,
                                            delay: 0.3 + (index * 0.08),
                                            layout: { duration: 0.3 }
                                        }}
                                        whileHover={{ scale: 1.005 }}
                                        whileTap={{ scale: 0.998 }}
                                        onClick={() => setSelectedPackage(pkg)}
                                        className={`grid grid-cols-7 gap-4 p-4 border-b border-border/20 hover:bg-accent/30 transition-colors cursor-pointer group ${
                                            index % 2 === 0 ? "bg-background/50" : "bg-card/50"
                                        }`}
                                    >
                                        {/* Equipment Icon */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                                                <div style={{ color: categoryConfig.color }} className="group-hover:hidden">
                                                    <CategoryIcon size={20} />
                                                </div>
                                                <div style={{ color: packageColor }} className="hidden group-hover:block">
                                                    <PackageIcon size={20} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-xs font-medium text-foreground group-hover:hidden">{categoryConfig.name}</p>
                                                <p
                                                    className="text-xs font-semibold hidden group-hover:block px-2 py-0.5 rounded-md"
                                                    style={{
                                                        backgroundColor: `${packageColor}20`,
                                                        color: packageColor
                                                    }}
                                                >
                                                    Request
                                                </p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="col-span-2 flex flex-col justify-center">
                                            <p className="text-sm font-semibold text-foreground">{pkg.description}</p>
                                        </div>

                                        {/* Capacity */}
                                        <div className="flex items-center justify-center">
                                            <div className="flex items-center gap-1">
                                                {pkg.capacityEquipment > 0 && (
                                                    <>
                                                        <div style={{ color: categoryConfig.color }}>
                                                            <CategoryIcon size={16} />
                                                        </div>
                                                        {pkg.capacityEquipment > 1 && (
                                                            <p className="text-sm font-medium text-foreground">{pkg.capacityEquipment}</p>
                                                        )}
                                                        <span className="text-sm text-muted-foreground mx-1">/</span>
                                                    </>
                                                )}
                                                <div style={{ color: helmetColor }}>
                                                    <HelmetIcon size={16} />
                                                </div>
                                                {pkg.capacityStudents > 1 && (
                                                    <p className="text-sm font-medium text-foreground">{pkg.capacityStudents}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Duration */}
                                        <div className="flex items-center justify-end">
                                            <p className="text-sm text-foreground">{getPrettyDuration(pkg.durationMinutes)}</p>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center justify-end">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-foreground">${pkg.pricePerStudent}</p>
                                                <p className="text-xs text-muted-foreground">${pricePerHour.toFixed(0)} PPH</p>
                                            </div>
                                        </div>

                                        {/* Requests Count */}
                                        <div className="flex items-center justify-center">
                                            <div className="px-3 py-1 rounded-full bg-orange-400/10 border border-orange-400/30">
                                                <p className="text-sm font-semibold text-orange-400">{pkg.bookingCount}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
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
                {selectedPackage && <BookingModal pkg={selectedPackage} schoolName={schoolName} schoolUsername={schoolUsername} onClose={() => setSelectedPackage(null)} />}
            </AnimatePresence>
        </div>
    );
};
