import type { StudentFormData } from "@/src/components/forms/Student4SchoolForm";
import { FORM_SUMMARY_COLORS } from "@/types/form-summary";

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
                    isRequired={true}
                />

                <SummaryItem
                    label="Passport"
                    value={studentFormData.passport || null}
                    placeholder="Enter passport number"
                    isRequired={true}
                />

                <SummaryItem
                    label="Country"
                    value={studentFormData.country || null}
                    placeholder="Enter country"
                    isRequired={true}
                />

                <SummaryItem
                    label="Phone"
                    value={studentFormData.phone || null}
                    placeholder="Enter phone number"
                    isRequired={true}
                />

                <SummaryItem
                    label="Languages"
                    value={studentFormData.languages.length > 0
                        ? studentFormData.languages.join(", ")
                        : null}
                    placeholder="Select at least one language"
                    isRequired={true}
                />

                <SummaryItem
                    label="Description"
                    value={studentFormData.description || null}
                    placeholder="Add any additional notes (optional)"
                    isRequired={false}
                />

                <div className={`p-3 rounded-lg border ${FORM_SUMMARY_COLORS.optional.bg} ${FORM_SUMMARY_COLORS.optional.border}`}>
                    <div className="text-xs text-muted-foreground mb-1">Can Rent Equipment</div>
                    <div className="text-sm">{studentFormData.canRent ? "Yes" : "No"}</div>
                </div>
            </div>
        </div>
    );
}

function SummaryItem({
    label,
    value,
    placeholder,
    isRequired = true,
}: {
    label: string;
    value: string | null;
    placeholder: string;
    isRequired?: boolean;
}) {
    const isComplete = !!value;

    // Use required colors only when data exists, otherwise use muted
    const colors = isComplete
        ? FORM_SUMMARY_COLORS.required
        : FORM_SUMMARY_COLORS.muted;

    return (
        <div className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
            <div className="text-xs text-muted-foreground mb-1">
                {isComplete
                    ? `✓ ${label}`
                    : isRequired
                        ? `⚠ ${label} Required`
                        : `${label}`}
            </div>
            {isComplete ? (
                <div className="text-sm">{value}</div>
            ) : (
                <div className="text-xs text-muted-foreground">{placeholder}</div>
            )}
        </div>
    );
}
