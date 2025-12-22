import BookingIcon from "@/public/appSvgs/BookingIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import LinkIcon from "@/public/appSvgs/LinkIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { EquipmentStudentCapacityBadge, DateRangeBadge, TeacherCommissionBadge, ReferralCommissionBadge } from "@/src/components/ui/badge";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";

interface BookingSummaryProps {
    dateRange: { startDate: string; endDate: string };
    selectedPackage: any;
    selectedStudents: any[];
    selectedReferral: any;
    selectedTeacher: any;
    selectedCommission: any;
    onScrollToSection: (sectionId: string) => void;
}

export function BookingSummary({ dateRange, selectedPackage, selectedStudents, selectedReferral, selectedTeacher, selectedCommission, onScrollToSection }: BookingSummaryProps) {
    const hasDates = dateRange.startDate && dateRange.endDate;
    const hasPackage = !!selectedPackage;
    const hasStudents = selectedStudents.length > 0;
    const hasCorrectStudentCount = selectedPackage && selectedStudents.length === selectedPackage.capacityStudents;
    const hasReferral = !!selectedReferral;
    const hasTeacher = !!selectedTeacher;
    const hasCommission = !!selectedCommission;

    return (
        <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Booking Summary</h3>

            <div className="space-y-2">
                {/* Dates */}
                <button
                    onClick={() => onScrollToSection("dates-section")}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:opacity-80 ${hasDates ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-muted/30 border-border cursor-pointer"}`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <BookingIcon size={16} color={hasDates ? "#22c55e" : "#9ca3af"} />
                        <span className="text-xs font-medium" style={{ color: hasDates ? "#22c55e" : "#6b7280" }}>
                            Dates {hasDates ? "" : "Required"}
                        </span>
                    </div>
                    {hasDates ? (
                        <div className="flex items-center gap-2">
                            <DateRangeBadge startDate={dateRange.startDate} endDate={dateRange.endDate} />
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground">Select start and end dates</div>
                    )}
                </button>

                {/* Package */}
                <button
                    onClick={() => onScrollToSection("package-section")}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:opacity-80 ${hasPackage ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-muted/30 border-border cursor-pointer"}`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <PackageIcon size={16} color={hasPackage ? "#22c55e" : "#9ca3af"} />
                        <span className="text-xs font-medium" style={{ color: hasPackage ? "#22c55e" : "#6b7280" }}>
                            Package {hasPackage ? "" : "Required"}
                        </span>
                    </div>
                    {hasPackage ? (
                        <>
                            <div className="text-sm font-medium">{selectedPackage.description}</div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {(() => {
                                    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === selectedPackage.categoryEquipment);
                                    const EquipmentIcon = equipmentConfig?.icon;
                                    return EquipmentIcon ? <EquipmentStudentCapacityBadge categoryIcon={EquipmentIcon} equipmentCapacity={selectedPackage.capacityEquipment} studentCapacity={selectedPackage.capacityStudents} /> : null;
                                })()}
                                <span className="text-foreground font-medium">{parseFloat(selectedPackage.pricePerStudent).toFixed(2)}</span>
                                <span className="text-foreground">×</span>
                                {selectedPackage.capacityStudents > 1 && (
                                    <>
                                        <span className="text-foreground font-medium">{selectedPackage.capacityStudents}p</span>
                                        <span className="text-foreground">×</span>
                                    </>
                                )}
                                <span className="text-foreground font-medium">{(selectedPackage.durationMinutes / 60).toFixed(2)}h</span>
                                <span className="text-foreground">=</span>
                                <span className="text-foreground font-medium">{(selectedPackage.pricePerStudent * selectedPackage.capacityStudents * (selectedPackage.durationMinutes / 60)).toFixed(2)}</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-xs text-muted-foreground">Select a package</div>
                    )}
                </button>

                {/* Students */}
                <button
                    onClick={() => onScrollToSection("students-section")}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:opacity-80 ${hasCorrectStudentCount ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : hasStudents ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" : "bg-muted/30 border-border cursor-pointer"
                        }`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <HelmetIcon size={16} color={hasCorrectStudentCount ? "#22c55e" : hasStudents ? "#ca8a04" : "#9ca3af"} />
                        <span className="text-xs font-medium" style={{ color: hasCorrectStudentCount ? "#22c55e" : hasStudents ? "#b45309" : "#6b7280" }}>
                            Students {hasCorrectStudentCount ? "" : hasStudents ? `(${selectedStudents.length}/${selectedPackage?.capacityStudents || "?"})` : "Required"}
                        </span>
                    </div>
                    {hasStudents ? (
                        <div className="text-sm space-y-1">
                            {selectedStudents.map((student) => (
                                <div key={student.id}>
                                    {student.firstName} {student.lastName}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground">{hasPackage ? `Select ${selectedPackage.capacityStudents} student${selectedPackage.capacityStudents > 1 ? "s" : ""}` : "Select package first"}</div>
                    )}
                </button>

                {/* Teacher */}
                <button
                    onClick={() => onScrollToSection("teacher-section")}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:opacity-80 ${hasTeacher ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 cursor-pointer"
                        }`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <HeadsetIcon size={16} color={hasTeacher ? "#22c55e" : "#9ca3af"} />
                        <span className="text-xs font-medium" style={{ color: hasTeacher ? "#22c55e" : "#6b7280" }}>
                            Teacher {hasTeacher ? "(Lesson)" : "(Optional)"}
                        </span>
                    </div>
                    {hasTeacher ? (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                    {selectedTeacher.firstName} {selectedTeacher.lastName}
                                </span>
                                {hasCommission && <TeacherCommissionBadge value={selectedCommission.cph} type={selectedCommission.commissionType} />}
                            </div>
                        </>
                    ) : (
                        <div className="text-xs text-muted-foreground">Skip to create booking without lesson</div>
                    )}
                </button>

                {/* Referral */}
                <button
                    onClick={() => onScrollToSection("referral-section")}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:opacity-80 ${hasReferral ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 cursor-pointer"
                        }`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <LinkIcon size={16} color={hasReferral ? "#22c55e" : "#9ca3af"} />
                        <span className="text-xs font-medium" style={{ color: hasReferral ? "#22c55e" : "#6b7280" }}>
                            Referral {hasReferral ? "" : "(Optional)"}
                        </span>
                    </div>
                    {hasReferral ? (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{selectedReferral.code}</span>
                                <ReferralCommissionBadge value={selectedReferral.commissionValue} type={selectedReferral.commissionType} />
                            </div>
                            {selectedReferral.description && <div className="text-xs text-muted-foreground">{selectedReferral.description}</div>}
                        </>
                    ) : (
                        <div className="text-xs text-muted-foreground">Skip to book without referral</div>
                    )}
                </button>

                {/* Commission */}
                {hasTeacher && !hasCommission && (
                    <button onClick={() => onScrollToSection("teacher-section")} className="w-full text-left p-3 rounded-lg border bg-muted/30 border-border transition-all hover:opacity-80 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                            <HandshakeIcon size={16} color="#9ca3af" />
                            <span className="text-xs font-medium text-muted-foreground">Commission Required</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Select teacher commission</div>
                    </button>
                )}
            </div>
        </div>
    );
}
