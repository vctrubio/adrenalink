import { getEntityId } from "@/actions/id-actions";
import { getSchoolIdFromHeader } from "@/types/headers";
import { MasterAdminLayout } from "@/src/components/layouts/MasterAdminLayout";
import type { BookingModel } from "@/backend/models";
import { BookingLeftColumn } from "./BookingLeftColumn";
import { BookingStatsColumns } from "./BookingStatsColumns";

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
    const schoolId = await getSchoolIdFromHeader();

    if (!schoolId) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: School context not found</div>
            </div>
        );
    }

    const result = await getEntityId("booking", params.id);

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: {result.error}</div>
            </div>
        );
    }

    const booking = result.data as BookingModel;

    // Verify booking belongs to the school
    if (booking.schema.schoolId !== schoolId) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: You do not have permission to view this booking</div>
            </div>
        );
    }

    const bookingStudents = booking.relations?.bookingStudents || [];

    return (
        <MasterAdminLayout
            controller={<BookingLeftColumn booking={booking} />}
            form={
                <>
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

                    {/* Booking Stats */}
                    <BookingStatsColumns booking={booking} />

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
