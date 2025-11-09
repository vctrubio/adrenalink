import { getEntityId } from "@/actions/id-actions";
import { EntityDetailLayout } from "@/src/components/layouts/EntityDetailLayout";
import { ENTITY_DATA } from "@/config/entities";
import { formatDate } from "@/getters/date-getter";
import type { SchoolPackageModel } from "@/backend/models";
import { EntityInfoCard } from "@/src/components/cards/EntityInfoCard";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";

export default async function PackageDetailPage({ params }: { params: { id: string } }) {
    const result = await getEntityId("schoolPackage", params.id);

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: {result.error}</div>
            </div>
        );
    }

    const schoolPackage = result.data as SchoolPackageModel;
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;

    // Calculate hours from durationMinutes
    const hours = schoolPackage.schema.durationMinutes / 60;
    const pricePerHour = schoolPackage.schema.pricePerStudent / hours;

    // Header: "2h - $60/h"
    const packageName = `${hours}h - $${pricePerHour.toFixed(0)}/h`;

    // Status: Public/Private
    const statusText = schoolPackage.schema.isPublic ? "Public" : "Private";

    // Stats
    // 1. Number of student packages with this package_id
    const studentPackageCount = schoolPackage.relations?.studentPackages?.length || 0;

    // 2. Total hours from all booking lesson events
    let totalEventMinutes = 0;
    if (schoolPackage.relations?.studentPackages) {
        for (const studentPkg of schoolPackage.relations.studentPackages) {
            if (studentPkg.bookings) {
                for (const booking of studentPkg.bookings) {
                    if (booking.lessons) {
                        for (const lesson of booking.lessons) {
                            if (lesson.events) {
                                for (const event of lesson.events) {
                                    totalEventMinutes += event.duration || 0;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    const totalEventHours = (totalEventMinutes / 60).toFixed(1);

    // 3. Revenue: hours * price per hour per student
    const revenue = (totalEventMinutes / 60) * pricePerHour;

    return (
        <EntityDetailLayout
            leftColumn={
                <>
                    <EntityInfoCard
                        entity={{
                            id: packageEntity.id,
                            name: packageName,
                            icon: packageEntity.icon,
                            color: packageEntity.color,
                            bgColor: packageEntity.bgColor,
                        }}
                        status={statusText}
                        stats={[
                            {
                                icon: BookingIcon,
                                label: "Requests",
                                value: studentPackageCount,
                                color: "#3b82f6",
                            },
                            {
                                icon: DurationIcon,
                                label: "Hours",
                                value: totalEventHours,
                                color: "#f59e0b",
                            },
                            {
                                icon: BankIcon,
                                label: "Revenue",
                                value: `$${revenue.toFixed(0)}`,
                                color: "#10b981",
                            },
                        ]}
                        fields={[
                            {
                                label: "Description",
                                value: schoolPackage.schema.description || "No description",
                            },
                            {
                                label: "Duration (minutes)",
                                value: schoolPackage.schema.durationMinutes,
                            },
                            {
                                label: "Price Per Student",
                                value: `$${schoolPackage.schema.pricePerStudent}`,
                            },
                            {
                                label: "Capacity Students",
                                value: schoolPackage.schema.capacityStudents,
                            },
                            {
                                label: "Capacity Equipment",
                                value: schoolPackage.schema.capacityEquipment,
                            },
                            {
                                label: "Category Equipment",
                                value: schoolPackage.schema.categoryEquipment,
                            },
                            {
                                label: "Package Type",
                                value: schoolPackage.schema.packageType,
                            },
                            {
                                label: "Public",
                                value: schoolPackage.schema.isPublic ? "Yes" : "No",
                            },
                            {
                                label: "Active",
                                value: schoolPackage.schema.active ? "Yes" : "No",
                            },
                            {
                                label: "Created",
                                value: formatDate(schoolPackage.schema.createdAt),
                            },
                            {
                                label: "Last Updated",
                                value: formatDate(schoolPackage.schema.updatedAt),
                            },
                        ]}
                        accentColor={packageEntity.color}
                    />
                </>
            }
            rightColumn={<></>}
        />
    );
}
