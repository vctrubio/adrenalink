"use client";

import type { SerializedAbstractModel } from "@/backend/models";
import type { StudentType } from "@/drizzle/schema";
import { ENTITY_DATA } from "@/config/entities";

// NOTE: This is tmp - packages and bookings should be part of each school membership display since they can't exist without the school

interface StudentBookingsPackagesStatsProps {
    student: SerializedAbstractModel<StudentType>;
}

export default function StudentBookingsPackagesStats({ student }: StudentBookingsPackagesStatsProps) {
    const packageConfig = ENTITY_DATA.find((entity) => entity.id === "School Package");
    const bookingConfig = ENTITY_DATA.find((entity) => entity.id === "Booking");

    // Get student packages from relations
    const studentPackages = student.relations?.studentPackages || [];

    // Calculate bookings from student packages
    const totalBookings = studentPackages.reduce((count: number, studentPackage: any) => {
        return count + (studentPackage.bookings?.length || 0);
    }, 0);

    const stats = [
        {
            title: "Student Packages",
            count: studentPackages.length,
            icon: packageConfig?.icon,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
            description: "Active package enrollments",
        },
        {
            title: "Total Bookings",
            count: totalBookings,
            icon: bookingConfig?.icon,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
            description: "Lessons booked across all packages",
        },
    ];

    return (
        <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-6">Activity Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-muted/20 p-4 rounded-lg border border-muted/30">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-full ${stat.bgColor}`}>{stat.icon && <stat.icon className={`w-5 h-5 ${stat.color}`} />}</div>
                            <h3 className="font-semibold text-foreground">{stat.title}</h3>
                        </div>
                        <div className="text-3xl font-bold text-foreground mb-1">{stat.count}</div>
                        <p className="text-sm text-muted-foreground">{stat.description}</p>
                    </div>
                ))}
            </div>

            {studentPackages.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Recent Package Activity</h3>
                    <div className="space-y-3">
                        {studentPackages.slice(0, 3).map((studentPackage: any) => (
                            <div key={studentPackage.id} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg border border-muted/20">
                                <div className="flex items-center gap-3">
                                    {packageConfig && <packageConfig.icon className="w-4 h-4 text-orange-600" />}
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{studentPackage.schoolPackage?.school?.name || "Unknown School"}</p>
                                        <p className="text-xs text-muted-foreground">Package: {studentPackage.schoolPackage?.categoryEquipment || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-foreground">{studentPackage.bookings?.length || 0} bookings</p>
                                    <p className="text-xs text-muted-foreground">{new Date(studentPackage.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
