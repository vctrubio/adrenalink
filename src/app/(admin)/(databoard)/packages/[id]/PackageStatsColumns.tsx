"use client";

import { getPrettyDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import type { SchoolPackageModel } from "@/backend/models";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";

export function PackageStatsColumns({ schoolPackage }: { schoolPackage: SchoolPackageModel }) {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;

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

    const durationHours = schoolPackage.schema.durationMinutes / 60;
    const pricePerHour = schoolPackage.schema.pricePerStudent / durationHours;
    const revenue = (totalEventMinutes / 60) * pricePerHour;

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Package Statistics</h2>
            <div className="flex justify-around gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <PackageIcon className="w-4 h-4" style={{ color: packageEntity.color }} />
                        <p className="text-sm text-muted-foreground">Requests</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{studentPackageCount}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <DurationIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Duration</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{schoolPackage.schema.durationMinutes}m</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <DurationIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Total Hours</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{getPrettyDuration(totalEventMinutes)}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BankIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Price/Student</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">${schoolPackage.schema.pricePerStudent}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BankIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">${revenue.toFixed(0)}</p>
                </div>
            </div>
        </div>
    );
}
