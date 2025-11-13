import type { TeacherFormData } from "@/src/components/forms/Teacher4SchoolForm";

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
                />
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
