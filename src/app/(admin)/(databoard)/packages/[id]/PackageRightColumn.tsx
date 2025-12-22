import type { SchoolPackageModel } from "@/backend/models";
import { formatDate } from "@/getters/date-getter";

interface PackageRightColumnProps {
    schoolPackage: SchoolPackageModel;
}

export function PackageRightColumn({ schoolPackage }: PackageRightColumnProps) {
    const studentPackages = schoolPackage.relations?.studentPackages || [];

    if (studentPackages.length === 0) {
        return (
            <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground">No requests made yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {studentPackages.map((studentPackage) => {
                const students = studentPackage.studentPackageStudents || [];
                const studentNames = students
                    .map((sps) => {
                        const student = sps.student;
                        if (!student) return null;
                        return `${student.schema.firstName} ${student.schema.lastName}`;
                    })
                    .filter(Boolean)
                    .join(", ");

                return (
                    <div key={studentPackage.id} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        studentPackage.status === "requested" 
                                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                                            : studentPackage.status === "accepted"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                    }`}>
                                        {studentPackage.status || "unknown"}
                                    </span>
                                </div>
                                {studentNames && (
                                    <p className="text-sm font-medium text-foreground">
                                        {studentNames}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Start: {formatDate(studentPackage.requestedDateStart)}</span>
                                    <span>End: {formatDate(studentPackage.requestedDateEnd)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Created: {formatDate(studentPackage.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

