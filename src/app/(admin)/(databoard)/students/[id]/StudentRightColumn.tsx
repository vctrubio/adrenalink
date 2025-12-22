import type { StudentModel } from "@/backend/models";
import { createBookingModel } from "@/backend/models";
import { BookingContainer } from "@/src/components/ids/BookingContainer";

interface StudentRightColumnProps {
    student: StudentModel;
}

export function StudentRightColumn({ student }: StudentRightColumnProps) {
    return (
        <>
            {/* Bookings*/}
            {student.relations?.bookingStudents && student.relations.bookingStudents.length > 0 && (
                <div className="space-y-4">
                    {student.relations.bookingStudents.map((bs) => (
                        <BookingContainer key={bs.bookingId} booking={createBookingModel(bs.booking)} />
                    ))}
                </div>
            )}

            {/* Requested Packages */}
            {(student.stats?.requested_packages_count || 0) > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-2">Pending Requests</h2>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{student.stats?.requested_packages_count}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Package request(s) awaiting approval</p>
                </div>
            )}

            {/* Student Packages */}
            {student.relations?.studentPackageStudents && student.relations.studentPackageStudents.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Packages</h2>
                    <div className="space-y-3">
                        {student.relations.studentPackageStudents.map((sps) => (
                            <div key={sps.id} className="border-l-2 border-primary pl-3">
                                <p className="font-medium text-foreground text-sm">{sps.studentPackage?.schoolPackage?.description || "Package"}</p>
                                <p className="text-xs text-muted-foreground mt-1">Status: {sps.studentPackage?.status || "Unknown"}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

