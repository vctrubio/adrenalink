import { getEntityId } from "@/actions/id-actions";
import { EntityDetailLayout } from "@/src/components/layouts/EntityDetailLayout";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { BookingModel } from "@/backend/models";
import { EntityInfoCard } from "@/src/components/cards/EntityInfoCard";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
    const result = await getEntityId("booking", params.id);

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: {result.error}</div>
            </div>
        );
    }

    const booking = result.data as BookingModel;
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;

    const bookingStudents = booking.relations?.bookingStudents || [];
    const schoolPackage = booking.relations?.studentPackage?.schoolPackage;
    const referral = booking.relations?.studentPackage?.referral;

    // Get equipment category icon and color
    const equipmentCategory = schoolPackage?.categoryEquipment;
    const equipmentConfig = equipmentCategory ? EQUIPMENT_CATEGORIES.find((cat) => cat.id === equipmentCategory) : null;
    const EquipmentIcon = equipmentConfig?.icon;
    const equipmentColor = equipmentConfig?.color || bookingEntity.color;

    // Format dates for status line
    const dateStart = formatDate(booking.schema.dateStart);
    const dateEnd = formatDate(booking.schema.dateEnd);

    return (
        <EntityDetailLayout
            leftColumn={
                <>
                    <EntityInfoCard
                        entity={{
                            id: bookingEntity.id,
                            name: `Booking ${booking.schema.id.slice(0, 8)}`,
                            icon: bookingEntity.icon,
                            color: bookingEntity.color,
                            bgColor: bookingEntity.bgColor,
                        }}
                        status={`${dateStart} - ${dateEnd}`}
                        stats={[
                            {
                                icon: DurationIcon,
                                label: "Duration",
                                value: getPrettyDuration(schoolPackage?.durationMinutes || 0),
                                color: "#f59e0b",
                            },
                            {
                                icon: HelmetIcon,
                                label: "Students",
                                value: schoolPackage?.capacityStudents || 0,
                                color: "#eab308",
                            },
                            {
                                icon: EquipmentIcon || bookingEntity.icon,
                                label: "Equipment",
                                value: schoolPackage?.capacityEquipment || 0,
                                color: equipmentColor,
                            },
                        ]}
                        fields={[
                            {
                                label: "Referral",
                                value: referral?.code || "Nobody",
                            },
                            {
                                label: "Status",
                                value: booking.schema.status || "Active",
                            },
                            {
                                label: "Created",
                                value: formatDate(booking.schema.createdAt),
                            },
                        ]}
                        accentColor={bookingEntity.color}
                    />

                    {/* Students */}
                    {bookingStudents.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">Students ({bookingStudents.length})</h2>
                            <div className="space-y-3">
                                {bookingStudents.map((bs) => (
                                    <div key={bs.id} className="border-l-2 border-primary pl-3">
                                        <p className="font-medium text-foreground text-sm">
                                            {bs.student ? `${bs.student.firstName} ${bs.student.lastName}` : "Unknown"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">{bs.student?.email || "No email"}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lessons */}
                    {booking.relations?.lessons && booking.relations.lessons.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">Lessons ({booking.relations.lessons.length})</h2>
                            <div className="space-y-3">
                                {booking.relations.lessons.slice(0, 5).map((lesson) => (
                                    <div key={lesson.id} className="border-l-2 border-blue-500 pl-3">
                                        <p className="text-sm font-medium text-foreground">Lesson {lesson.id.slice(0, 8)}...</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Teacher: {lesson.teacher?.firstName || "Unknown"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Events: {lesson.events?.length || 0}
                                        </p>
                                    </div>
                                ))}
                                {booking.relations.lessons.length > 5 && (
                                    <p className="text-sm text-muted-foreground">+{booking.relations.lessons.length - 5} more lessons</p>
                                )}
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
                                <p className="text-2xl font-bold text-foreground">{booking.stats?.events_count || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Duration</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {getPrettyDuration(booking.stats?.total_duration_minutes || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Info */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Financial</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Revenue</p>
                                <p className="text-xl font-bold text-green-600">${booking.stats?.money_in || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Costs</p>
                                <p className="text-xl font-bold text-red-600">${booking.stats?.money_out || 0}</p>
                            </div>
                            <div className="border-t border-border pt-4">
                                <p className="text-sm text-muted-foreground">Net Profit</p>
                                <p className="text-xl font-bold" style={{ color: (booking.stats?.money_in || 0) - (booking.stats?.money_out || 0) >= 0 ? "#10b981" : "#ef4444" }}>
                                    ${(booking.stats?.money_in || 0) - (booking.stats?.money_out || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Completion Status */}
                    {booking.popoverType === "booking_completion" && (
                        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-2">Completed</h2>
                            <p className="text-sm text-green-600 dark:text-green-400">
                                This booking has reached the required duration and is marked as complete.
                            </p>
                        </div>
                    )}
                </>
            }
        />
    );
}
