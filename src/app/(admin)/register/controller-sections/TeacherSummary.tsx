import type { TeacherFormData } from "@/src/components/forms/Teacher4SchoolForm";
import { FORM_SUMMARY_COLORS } from "@/types/form-summary";

interface TeacherSummaryProps {
    teacherFormData: TeacherFormData;
}

export function TeacherSummary({ teacherFormData }: TeacherSummaryProps) {
    return (
        <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Teacher Summary</h3>

            <div className="space-y-2">
                <SummaryItem
                    label="Name"
                    value={teacherFormData.firstName && teacherFormData.lastName 
                        ? `${teacherFormData.firstName} ${teacherFormData.lastName}` 
                        : null}
                    placeholder="Enter first and last name"
                />

                <SummaryItem
                    label="Username"
                    value={teacherFormData.username || null}
                    placeholder="Enter username"
                />

                <SummaryItem
                    label="Passport"
                    value={teacherFormData.passport || null}
                    placeholder="Enter passport number"
                />

                <SummaryItem
                    label="Country"
                    value={teacherFormData.country || null}
                    placeholder="Enter country"
                />

                <SummaryItem
                    label="Phone"
                    value={teacherFormData.phone || null}
                    placeholder="Enter phone number"
                />

                <SummaryItem
                    label="Languages"
                    value={teacherFormData.languages.length > 0 
                        ? teacherFormData.languages.join(", ") 
                        : null}
                    placeholder="Select at least one language"
                />

                <SummaryItem
                    label="Commissions"
                    value={teacherFormData.commissions.length > 0
                        ? `${teacherFormData.commissions.length} commission${teacherFormData.commissions.length > 1 ? "s" : ""} set`
                        : null}
                    placeholder="Add commission rates (optional)"
                    isRequired={false}
                />
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
