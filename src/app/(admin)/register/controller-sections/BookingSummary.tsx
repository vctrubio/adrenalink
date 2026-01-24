import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { DateRangeBadge, TeacherCommissionBadge, ReferralCommissionBadge } from "@/src/components/ui/badge";
import { CardList } from "@/src/components/ui/card/card-list";
import { ENTITY_DATA } from "@/config/entities";
import { Check, ChevronDown } from "lucide-react";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import LinkIcon from "@/public/appSvgs/LinkIcon";

interface BookingSummaryProps {
    dateRange: { startDate: string; endDate: string };
    selectedPackage: any;
    selectedStudents: any[];
    selectedReferral: any;
    selectedTeacher: any;
    selectedCommission: any;
    hasReferrals?: boolean;
    leaderStudentId?: string;
    onLeaderStudentChange?: (id: string) => void;
}

export function BookingSummary({
    dateRange,
    selectedPackage,
    selectedStudents,
    selectedReferral,
    selectedTeacher,
    selectedCommission,
    hasReferrals = true,
    leaderStudentId,
    onLeaderStudentChange,
}: BookingSummaryProps) {
    const [isLeaderOpen, setIsLeaderOpen] = useState(false);
    const leaderRef = useRef<HTMLDivElement>(null);

    const hasDates = !!(dateRange.startDate && dateRange.endDate);
    const hasPackage = !!selectedPackage;
    const hasCorrectStudentCount = selectedPackage && selectedStudents.length === selectedPackage.capacityStudents;
    const exceedsCapacity = hasPackage && selectedStudents.length > selectedPackage.capacityStudents;

    // Calculate Progress
    let progress = 0;
    if (hasDates) progress += 33;
    if (hasPackage) progress += 33;
    if (hasCorrectStudentCount) progress += 34;

    const bookingColor = ENTITY_DATA.find((e) => e.id === "booking")?.color || "#3b82f6";
    const packageColor = ENTITY_DATA.find((e) => e.id === "schoolPackage")?.color || "#fb923c";
    const studentColor = ENTITY_DATA.find((e) => e.id === "student")?.color || "#eab308";
    const teacherColor = ENTITY_DATA.find((e) => e.id === "teacher")?.color || "#22c55e";
    const referralColor = ENTITY_DATA.find((e) => e.id === "referral")?.color || "#171717";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (leaderRef.current && !leaderRef.current.contains(event.target as Node)) {
                setIsLeaderOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const leaderStudent = selectedStudents.find((s) => s.id === leaderStudentId);

    const bookingFields = [
        {
            label: (
                <div className="flex items-center gap-2.5">
                    <div style={{ color: hasDates ? bookingColor : undefined }} className={hasDates ? "" : "text-muted-foreground"}>
                        <BookingIcon size={16} />
                    </div>
                    <span className={hasDates ? "text-foreground font-bold tracking-tight" : "text-muted-foreground font-medium"}>
                        DATES
                    </span>
                </div>
            ),
            value: hasDates ? (
                <DateRangeBadge startDate={dateRange.startDate} endDate={dateRange.endDate} />
            ) : (
                <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Select Dates</span>
            ),
        },
        {
            label: (
                <div className="flex items-center gap-2.5">
                    <div
                        style={{ color: hasPackage ? packageColor : undefined }}
                        className={hasPackage ? "" : "text-muted-foreground"}
                    >
                        <PackageIcon size={16} />
                    </div>
                    <span className={hasPackage ? "text-foreground font-bold tracking-tight" : "text-muted-foreground font-medium"}>
                        PACKAGE
                    </span>
                </div>
            ),
            value: hasPackage ? (
                <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-sm text-foreground leading-none">{selectedPackage.description}</span>
                    <EquipmentStudentPackagePriceBadge
                        categoryEquipment={selectedPackage.categoryEquipment}
                        equipmentCapacity={selectedPackage.capacityEquipment}
                        studentCapacity={selectedPackage.capacityStudents}
                        packageDurationHours={selectedPackage.durationMinutes / 60}
                        pricePerHour={selectedPackage.pricePerStudent / (selectedPackage.durationMinutes / 60)}
                    />
                </div>
            ) : (
                <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Select Package</span>
            ),
        },
        {
            label: (
                <div className="flex items-center gap-2.5">
                    <div
                        style={{ color: hasCorrectStudentCount ? studentColor : undefined }}
                        className={hasCorrectStudentCount ? "" : "text-muted-foreground"}
                    >
                        <HelmetIcon size={16} />
                    </div>
                    <span
                        className={
                            hasCorrectStudentCount ? "text-foreground font-bold tracking-tight" : "text-muted-foreground font-medium"
                        }
                    >
                        STUDENTS
                    </span>
                </div>
            ),
            value:
                selectedStudents.length > 0 ? (
                    <div className="flex flex-col items-end min-w-[200px]" ref={leaderRef}>
                        <div className="flex items-center justify-end gap-2">
                            {/* 1/1 Format and Leader Name */}
                            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                                {hasPackage && (
                                    <span
                                        className={
                                            exceedsCapacity
                                                ? "tabular-nums bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded font-bold text-[10px]"
                                                : "tabular-nums text-muted-foreground/60 font-medium"
                                        }
                                    >
                                        {selectedStudents.length}/{selectedPackage.capacityStudents}
                                    </span>
                                )}
                                {leaderStudent && <span className="capitalize">{leaderStudent.firstName}</span>}
                            </div>

                            {/* Standard Dropdown Toggle */}
                            {selectedStudents.length > 1 && (
                                <button
                                    onClick={() => setIsLeaderOpen(!isLeaderOpen)}
                                    className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                                >
                                    <ChevronDown
                                        size={14}
                                        className={`transition-transform duration-200 ${isLeaderOpen ? "rotate-180" : ""}`}
                                    />
                                </button>
                            )}
                        </div>

                        {/* Dropdown Pick */}
                        <AnimatePresence>
                            {isLeaderOpen && selectedStudents.length > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                    className="absolute right-0 mt-8 bg-popover border border-border rounded-xl shadow-2xl z-[100] py-1.5 min-w-[140px] overflow-hidden"
                                >
                                    {selectedStudents.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => {
                                                onLeaderStudentChange?.(s.id);
                                                setIsLeaderOpen(false);
                                            }}
                                            className={`w-full px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-between hover:bg-muted ${
                                                leaderStudentId === s.id ? "text-primary bg-primary/5" : "text-muted-foreground"
                                            }`}
                                        >
                                            {leaderStudentId === s.id && <Check size={12} strokeWidth={3} />}
                                            <span className="flex-1">{s.firstName}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Add Students</span>
                ),
        },
    ];

    const additionalFields = [
        {
            label: (
                <div className="flex items-center gap-2.5">
                    <div
                        style={{ color: !!selectedTeacher ? teacherColor : undefined }}
                        className={!!selectedTeacher ? "" : "text-muted-foreground"}
                    >
                        <HeadsetIcon size={16} />
                    </div>
                    <span
                        className={
                            !!selectedTeacher ? "text-foreground font-bold tracking-tight" : "text-muted-foreground font-medium"
                        }
                    >
                        TEACHER
                    </span>
                </div>
            ),
            value: selectedTeacher ? (
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                        {selectedTeacher.schema?.username || "No teacher selected"}
                    </span>
                    {selectedCommission && (
                        <TeacherCommissionBadge value={selectedCommission.cph} type={selectedCommission.commissionType} />
                    )}
                </div>
            ) : (
                <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest italic">Optional</span>
            ),
        },
    ];

    if (hasReferrals && selectedReferral) {
        additionalFields.push({
            label: (
                <div className="flex items-center gap-2.5">
                    <div style={{ color: referralColor }} className="">
                        <LinkIcon size={16} />
                    </div>
                    <span className="text-foreground font-bold tracking-tight">REFERRAL</span>
                </div>
            ),
            value: (
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{selectedReferral.code}</span>
                    <ReferralCommissionBadge value={selectedReferral.commissionValue} type={selectedReferral.commissionType} />
                </div>
            ),
        });
    }

    const allFields = [...bookingFields, ...additionalFields];
    const teacherEntityColor = ENTITY_DATA.find((e) => e.id === "teacher")?.color || "#22c55e";
    const progressBarColor = selectedTeacher ? teacherEntityColor : undefined;
    const progressClass = selectedTeacher ? "" : "bg-secondary";

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <BookingIcon size={14} className="text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Check-in Booking</h3>
                    </div>
                    <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full ${progressClass}`}
                            style={{ backgroundColor: progressBarColor }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                        />
                    </div>
                </div>
                <div className="bg-card border border-border/50 rounded-[2rem] p-5 shadow-sm">
                    <CardList fields={allFields} />
                </div>
            </div>
        </div>
    );
}
