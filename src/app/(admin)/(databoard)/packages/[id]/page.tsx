import { getEntityId } from "@/actions/id-actions";
import { getSchoolIdFromHeader } from "@/types/headers";
import { MasterAdminLayout } from "@/src/components/layouts/MasterAdminLayout";
import type { SchoolPackageModel } from "@/backend/models";
import { PackageLeftColumn } from "./PackageLeftColumn";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";

export default async function PackageDetailPage({ params }: { params: { id: string } }) {
    const schoolId = await getSchoolIdFromHeader();

    if (!schoolId) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: School context not found</div>
            </div>
        );
    }

    const result = await getEntityId("schoolPackage", params.id);

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: {result.error}</div>
            </div>
        );
    }

    const schoolPackage = result.data as SchoolPackageModel;

    // Verify package belongs to the school
    if (schoolPackage.schema.schoolId !== schoolId) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: You do not have permission to view this package</div>
            </div>
        );
    }

    // Calculate stats
    const hours = schoolPackage.schema.durationMinutes / 60;
    const pricePerHour = schoolPackage.schema.pricePerStudent / hours;
    const studentPackageCount = schoolPackage.relations?.studentPackages?.length || 0;

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
    const revenue = (totalEventMinutes / 60) * pricePerHour;

    return (
        <MasterAdminLayout
            controller={<PackageLeftColumn schoolPackage={schoolPackage} />}
            form={
                <>
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Package Stats</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Student Packages</p>
                                <p className="text-2xl font-bold text-foreground">{studentPackageCount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Hours</p>
                                <p className="text-2xl font-bold text-foreground">{totalEventHours}h</p>
                            </div>
                            <div className="border-t border-border pt-4">
                                <p className="text-sm text-muted-foreground">Revenue</p>
                                <p className="text-2xl font-bold text-foreground">${revenue.toFixed(0)}</p>
                            </div>
                        </div>
                    </div>
                </>
            }
        />
    );
}
