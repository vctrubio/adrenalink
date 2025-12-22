interface BookingSummaryProps {
    dateRange: { startDate: string; endDate: string };
    selectedPackage: any;
    selectedStudents: any[];
    selectedReferral: any;
    selectedTeacher: any;
    selectedCommission: any;
    onScrollToSection: (sectionId: string) => void;
}

export function BookingSummary({
    dateRange,
    selectedPackage,
    selectedStudents,
    selectedReferral,
    selectedTeacher,
    selectedCommission,
    onScrollToSection,
}: BookingSummaryProps) {
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
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:opacity-80 ${
                        hasDates 
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                            : "bg-muted/30 border-border cursor-pointer"
                    }`}
                >
                    <div className="text-xs text-muted-foreground mb-1">
                        {hasDates ? "✓ Dates" : "⚠ Dates Required"}
                    </div>
                    {hasDates ? (
                        <div className="text-sm">
                            {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground">Select start and end dates</div>
                    )}
                </button>

                {/* Package */}
                <button
                    onClick={() => onScrollToSection("package-section")}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:opacity-80 ${
                        hasPackage 
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                            : "bg-muted/30 border-border cursor-pointer"
                    }`}
                >
                    <div className="text-xs text-muted-foreground mb-1">
                        {hasPackage ? "✓ Package" : "⚠ Package Required"}
                    </div>
                    {hasPackage ? (
                        <>
                            <div className="text-sm font-medium">{selectedPackage.description}</div>
                            <div className="text-xs text-muted-foreground">
                                €{selectedPackage.pricePerStudent} per student • Capacity: {selectedPackage.capacityStudents}
                            </div>
                        </>
                    ) : (
                        <div className="text-xs text-muted-foreground">Select a package</div>
                    )}
                </button>

                {/* Students */}
                <button
                    onClick={() => onScrollToSection("students-section")}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:opacity-80 ${
                        hasCorrectStudentCount 
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                            : hasStudents 
                            ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" 
                            : "bg-muted/30 border-border cursor-pointer"
                    }`}
                >
                    <div className="text-xs text-muted-foreground mb-1">
                        {hasCorrectStudentCount 
                            ? "✓ Students" 
                            : hasStudents 
                            ? `⚠ Students (${selectedStudents.length}/${selectedPackage?.capacityStudents || "?"})` 
                            : "⚠ Students Required"}
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
                        <div className="text-xs text-muted-foreground">
                            {hasPackage ? `Select ${selectedPackage.capacityStudents} student${selectedPackage.capacityStudents > 1 ? "s" : ""}` : "Select package first"}
                        </div>
                    )}
                </button>

                {/* Teacher */}
                <button
                    onClick={() => onScrollToSection("teacher-section")}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:opacity-80 ${
                        hasTeacher
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                            : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 cursor-pointer"
                    }`}
                >
                    <div className="text-xs text-muted-foreground mb-1">
                        {hasTeacher ? "✓ Teacher (Lesson)" : "Teacher (Optional)"}
                    </div>
                    {hasTeacher ? (
                        <>
                            <div className="text-sm font-medium">
                                {selectedTeacher.firstName} {selectedTeacher.lastName}
                            </div>
                            {hasCommission && (
                                <div className="text-xs text-muted-foreground capitalize">
                                    {selectedCommission.commissionType} - €{selectedCommission.cph}/h
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-xs text-muted-foreground">Skip to create booking without lesson</div>
                    )}
                </button>

                {/* Referral */}
                <button
                    onClick={() => onScrollToSection("referral-section")}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:opacity-80 ${
                        hasReferral
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                            : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 cursor-pointer"
                    }`}
                >
                    <div className="text-xs text-muted-foreground mb-1">
                        {hasReferral ? "✓ Referral" : "Referral (Optional)"}
                    </div>
                    {hasReferral ? (
                        <>
                            <div className="text-sm font-medium">
                                {selectedReferral.code}
                            </div>
                            {selectedReferral.description && (
                                <div className="text-xs text-muted-foreground">
                                    {selectedReferral.description}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-xs text-muted-foreground">Skip to book without referral</div>
                    )}
                </button>

                {/* Commission */}
                {hasTeacher && !hasCommission && (
                    <button
                        onClick={() => onScrollToSection("commission-section")}
                        className="w-full text-left p-3 rounded-lg border bg-muted/30 border-border transition-all hover:opacity-80 cursor-pointer"
                    >
                        <div className="text-xs text-muted-foreground mb-1">⚠ Commission Required</div>
                        <div className="text-xs text-muted-foreground">Select teacher commission</div>
                    </button>
                )}
            </div>
        </div>
    );
}
