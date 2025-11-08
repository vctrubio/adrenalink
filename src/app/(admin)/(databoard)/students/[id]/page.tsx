import { getEntityId } from "@/actions/id-actions";
import { EntityDetailLayout } from "@/src/components/layouts/EntityDetailLayout";
import { ENTITY_DATA } from "@/config/entities";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { StudentModel } from "@/backend/models";

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
    const result = await getEntityId("student", params.id);

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: {result.error}</div>
            </div>
        );
    }

    const student = result.data as StudentModel;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const StudentIcon = studentEntity.icon;

    const studentName = `${student.schema.firstName} ${student.schema.lastName}`;

    return (
        <EntityDetailLayout
            leftColumn={
                <>
                    {/* Header */}
                    <div className="border-b border-border pb-6">
                        <div className="flex items-start gap-4">
                            <div style={{ color: studentEntity.color }}>
                                <StudentIcon className="w-16 h-16" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-foreground">{studentName}</h1>
                                <p className="text-lg text-muted-foreground mt-2">{student.schema.email}</p>
                                {student.schema.phone && (
                                    <p className="text-sm text-muted-foreground mt-1">{student.schema.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Student Info Card */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Student Information</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <span className="font-medium text-foreground">{student.schema.status || "Active"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span className="font-medium text-foreground">{formatDate(student.schema.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Updated</span>
                                <span className="font-medium text-foreground">{formatDate(student.schema.updatedAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* School Relationships */}
                    {student.relations?.schoolStudents && student.relations.schoolStudents.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">Schools</h2>
                            <div className="space-y-2">
                                {student.relations.schoolStudents.map((schoolStudent) => (
                                    <div key={schoolStudent.id} className="text-sm text-muted-foreground">
                                        School ID: {schoolStudent.schoolId.slice(0, 8)}...
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Student Packages */}
                    {student.relations?.studentPackageStudents && student.relations.studentPackageStudents.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">Packages</h2>
                            <div className="space-y-3">
                                {student.relations.studentPackageStudents.map((sps) => (
                                    <div key={sps.id} className="border-l-2 border-primary pl-3">
                                        <p className="font-medium text-foreground text-sm">
                                            {sps.studentPackage?.schoolPackage?.description || "Package"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Status: {sps.studentPackage?.status || "Unknown"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            }
            rightColumn={
                <>
                    {/* Stats Card */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Statistics</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Events</p>
                                <p className="text-2xl font-bold text-foreground">{student.stats?.events_count || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Duration</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {getPrettyDuration(student.stats?.total_duration_minutes || 0)}
                                </p>
                            </div>
                            <div className="border-t border-border pt-4">
                                <p className="text-sm text-muted-foreground">Bookings</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {student.stats?.bookings_count || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Info */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Financial</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Income</p>
                                <p className="text-xl font-bold text-green-600">${student.stats?.money_in || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Expenses</p>
                                <p className="text-xl font-bold text-red-600">${student.stats?.money_out || 0}</p>
                            </div>
                            <div className="border-t border-border pt-4">
                                <p className="text-sm text-muted-foreground">Net Revenue</p>
                                <p className="text-xl font-bold" style={{ color: (student.stats?.money_in || 0) - (student.stats?.money_out || 0) >= 0 ? "#10b981" : "#ef4444" }}>
                                    ${(student.stats?.money_in || 0) - (student.stats?.money_out || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Requested Packages */}
                    {(student.stats?.requested_packages_count || 0) > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-2">Pending Requests</h2>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {student.stats?.requested_packages_count}
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Package request(s) awaiting approval</p>
                        </div>
                    )}
                </>
            }
        />
    );
}
