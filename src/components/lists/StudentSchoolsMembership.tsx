"use client";

import type { SerializedAbstractModel } from "@/backend/models";
import type { StudentType } from "@/drizzle/schema";
import { ENTITY_DATA } from "@/config/entities";

interface StudentSchoolsMembershipProps {
    student: SerializedAbstractModel<StudentType>;
}

export default function StudentSchoolsMembership({ student }: StudentSchoolsMembershipProps) {
    const schoolConfig = ENTITY_DATA.find((entity) => entity.id === "School");
    const schoolStudents = student.relations?.schoolStudents || [];

    return (
        <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
                {schoolConfig && <schoolConfig.icon className="w-6 h-6 text-indigo-600" />}
                <h2 className="text-xl font-semibold text-foreground">School Memberships</h2>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{schoolStudents.length}</span>
            </div>

            {schoolStudents.length > 0 ? (
                <div className="space-y-4">
                    {schoolStudents.map((relationship: any) => {
                        // Get student packages for this school
                        const schoolPackages = student.relations?.studentPackages?.filter((sp: any) => sp.schoolPackage?.schoolId === relationship.school?.id) || [];

                        // Calculate total bookings for this school
                        const totalBookings = schoolPackages.reduce((count: number, studentPackage: any) => {
                            return count + (studentPackage.bookings?.length || 0);
                        }, 0);

                        return (
                            <div key={relationship.id} className="border border-border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-foreground">{relationship.school?.name}</h3>
                                            <span className="text-sm text-muted-foreground">@{relationship.school?.username}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{relationship.school?.country}</p>
                                        {relationship.description && <p className="text-sm text-muted-foreground mt-2 italic">{relationship.description}</p>}
                                    </div>
                                </div>

                                {/* Packages and Bookings Stats */}
                                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-muted/30">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-foreground">{schoolPackages.length}</div>
                                        <div className="text-xs text-muted-foreground">Packages</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-foreground">{totalBookings}</div>
                                        <div className="text-xs text-muted-foreground">Bookings</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="flex justify-center mb-4">{schoolConfig && <schoolConfig.icon className="w-12 h-12 text-muted-foreground/50" />}</div>
                    <p className="text-muted-foreground">No school memberships found</p>
                    <p className="text-sm text-muted-foreground mt-1">Link to a school to start your learning journey</p>
                </div>
            )}
        </div>
    );
}
