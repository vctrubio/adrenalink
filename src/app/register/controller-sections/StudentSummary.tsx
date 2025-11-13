import type { StudentFormData } from "@/src/components/forms/Student4SchoolForm";

interface StudentSummaryProps {
    studentFormData: StudentFormData;
}

export function StudentSummary({ studentFormData }: StudentSummaryProps) {
    return (
        <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Student Summary</h3>

            <div className="space-y-2">
                <SummaryItem
                    label="Name"
                    value={studentFormData.firstName && studentFormData.lastName 
                        ? `${studentFormData.firstName} ${studentFormData.lastName}` 
                        : null}
                    placeholder="Enter first and last name"
                />

                <SummaryItem
                    label="Passport"
                    value={studentFormData.passport || null}
                    placeholder="Enter passport number"
                />

                <SummaryItem
                    label="Country"
                    value={studentFormData.country || null}
                    placeholder="Enter country"
                />

                <SummaryItem
                    label="Phone"
                    value={studentFormData.phone || null}
                    placeholder="Enter phone number"
                />

                <SummaryItem
                    label="Languages"
                    value={studentFormData.languages.length > 0 
                        ? studentFormData.languages.join(", ") 
                        : null}
                    placeholder="Select at least one language"
                />

                <div className="p-3 rounded-lg border bg-muted/30 border-border">
                    <div className="text-xs text-muted-foreground mb-1">Can Rent Equipment</div>
                    <div className="text-sm">{studentFormData.canRent ? "Yes" : "No"}</div>
                </div>
            </div>
        </div>
    );
}

function SummaryItem({ label, value, placeholder }: { label: string; value: string | null; placeholder: string }) {
    const isComplete = !!value;

    return (
        <div className={`p-3 rounded-lg border ${
            isComplete 
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                : "bg-muted/30 border-border"
        }`}>
            <div className="text-xs text-muted-foreground mb-1">
                {isComplete ? `✓ ${label}` : `⚠ ${label} Required`}
            </div>
            {isComplete ? (
                <div className="text-sm">{value}</div>
            ) : (
                <div className="text-xs text-muted-foreground">{placeholder}</div>
            )}
        </div>
    );
}
