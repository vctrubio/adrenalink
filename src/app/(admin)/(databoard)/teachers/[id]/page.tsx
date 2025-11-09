import { getEntityId } from "@/actions/id-actions";
import { EntityDetailLayout } from "@/src/components/layouts/EntityDetailLayout";
import { ENTITY_DATA } from "@/config/entities";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { TeacherModel } from "@/backend/models";
import { EntityInfoCard } from "@/src/components/cards/EntityInfoCard";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";

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
                    <EntityInfoCard
                        entity={{
                            id: teacherEntity.id,
                            name: teacher.schema.username,
                            icon: teacherEntity.icon,
                            color: teacherEntity.color,
                            bgColor: teacherEntity.bgColor,
                        }}
                        status={`${teacherName} • ${teacher.schema.passport}`}
                        stats={[
                            {
                                icon: LessonIcon,
                                label: "Lessons",
                                value: teacher.stats?.lessons_count || 0,
                                color: "#7dd3fc",
                            },
                            {
                                icon: FlagIcon,
                                label: "Events",
                                value: teacher.stats?.events_count || 0,
                                color: "#10b981",
                            },
                            {
                                icon: DurationIcon,
                                label: "Hours",
                                value: getPrettyDuration(teacher.stats?.total_duration_minutes || 0),
                                color: "#f59e0b",
                            },
                        ]}
                        fields={[
                            {
                                label: "First Name",
                                value: teacher.schema.firstName,
                            },
                            {
                                label: "Last Name",
                                value: teacher.schema.lastName,
                            },
                            {
                                label: "Username",
                                value: teacher.schema.username,
                            },
                            {
                                label: "Passport",
                                value: teacher.schema.passport,
                            },
                            {
                                label: "Country",
                                value: teacher.schema.country,
                            },
                            {
                                label: "Phone",
                                value: teacher.schema.phone,
                            },
                            {
                                label: "Languages",
                                value: teacher.schema.languages.join(", "),
                            },
                            {
                                label: "Active",
                                value: teacher.schema.active ? "Yes" : "No",
                            },
                            {
                                label: "Created",
                                value: formatDate(teacher.schema.createdAt),
                            },
                            {
                                label: "Last Updated",
                                value: formatDate(teacher.schema.updatedAt),
                            },
                        ]}
                        accentColor={teacherEntity.color}
                    />

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
