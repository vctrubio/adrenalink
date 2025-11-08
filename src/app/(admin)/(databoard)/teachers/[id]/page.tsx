import { getEntityId } from "@/actions/id-actions";
import { EntityDetailLayout } from "@/src/components/layouts/EntityDetailLayout";
import { ENTITY_DATA } from "@/config/entities";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { TeacherModel } from "@/backend/models";

export default async function TeacherDetailPage({ params }: { params: { id: string } }) {
    const result = await getEntityId("teacher", params.id);

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: {result.error}</div>
            </div>
        );
    }

    const teacher = result.data as TeacherModel;
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const TeacherIcon = teacherEntity.icon;

    const teacherName = `${teacher.schema.firstName} ${teacher.schema.lastName}`;

    return (
        <EntityDetailLayout
            leftColumn={
                <>
                    {/* Header */}
                    <div className="border-b border-border pb-6">
                        <div className="flex items-start gap-4">
                            <div style={{ color: teacherEntity.color }}>
                                <TeacherIcon className="w-16 h-16" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-foreground">{teacherName}</h1>
                                <p className="text-lg text-muted-foreground mt-2">{teacher.schema.email}</p>
                                {teacher.schema.phone && (
                                    <p className="text-sm text-muted-foreground mt-1">{teacher.schema.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Teacher Info Card */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Teacher Information</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <span className="font-medium text-foreground">{teacher.schema.status || "Active"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span className="font-medium text-foreground">{formatDate(teacher.schema.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Updated</span>
                                <span className="font-medium text-foreground">{formatDate(teacher.schema.updatedAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Lessons */}
                    {teacher.relations?.lessons && teacher.relations.lessons.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">Lessons</h2>
                            <div className="space-y-3">
                                {teacher.relations.lessons.slice(0, 10).map((lesson) => (
                                    <div key={lesson.id} className="border-l-2 border-primary pl-3">
                                        <p className="text-sm font-medium text-foreground">Lesson {lesson.id.slice(0, 8)}...</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Events: {lesson.events?.length || 0}
                                        </p>
                                    </div>
                                ))}
                                {teacher.relations.lessons.length > 10 && (
                                    <p className="text-sm text-muted-foreground">+{teacher.relations.lessons.length - 10} more lessons</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Commissions */}
                    {teacher.relations?.commissions && teacher.relations.commissions.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">Commissions</h2>
                            <div className="space-y-3">
                                {teacher.relations.commissions.map((commission) => (
                                    <div key={commission.id} className="border-l-2 border-blue-500 pl-3">
                                        <p className="text-sm font-medium text-foreground">
                                            {commission.cph ? `$${commission.cph}/hour` : "Flat rate"}
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
                                <p className="text-2xl font-bold text-foreground">{teacher.stats?.events_count || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Duration</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {getPrettyDuration(teacher.stats?.total_duration_minutes || 0)}
                                </p>
                            </div>
                            <div className="border-t border-border pt-4">
                                <p className="text-sm text-muted-foreground">Lessons</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {teacher.stats?.lessons_count || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Info */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Financial</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Earnings</p>
                                <p className="text-xl font-bold text-green-600">${teacher.stats?.money_in || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Payouts</p>
                                <p className="text-xl font-bold text-red-600">${teacher.stats?.money_out || 0}</p>
                            </div>
                            <div className="border-t border-border pt-4">
                                <p className="text-sm text-muted-foreground">Balance</p>
                                <p className="text-xl font-bold" style={{ color: (teacher.stats?.money_in || 0) - (teacher.stats?.money_out || 0) >= 0 ? "#10b981" : "#ef4444" }}>
                                    ${(teacher.stats?.money_in || 0) - (teacher.stats?.money_out || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            }
        />
    );
}
