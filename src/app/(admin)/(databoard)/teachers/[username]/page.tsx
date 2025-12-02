import { getEntityId } from "@/actions/id-actions";
import { getSchoolIdFromHeader } from "@/types/headers";
import { MasterAdminLayout } from "@/src/components/layouts/MasterAdminLayout";
import { getTeacherLessonStats } from "@/getters/teacher-lesson-stats-getter";
import type { TeacherModel } from "@/backend/models";
import { createBookingModel } from "@/backend/models";
import { TeacherLeftColumn } from "./TeacherLeftColumn";
import { TeacherLessonStats } from "./TeacherLessonStats";
import { TeacherStatsColumns } from "./TeacherStatsColumns";
import { BookingContainer } from "@/src/components/ids/BookingContainer";

export default async function TeacherDetailPage({ params }: { params: { username: string } }) {
    const schoolId = await getSchoolIdFromHeader();

    if (!schoolId) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: School context not found</div>
            </div>
        );
    }

    const result = await getEntityId("teacher", params.username);

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: {result.error}</div>
            </div>
        );
    }

    const teacher = result.data as TeacherModel;

    // Verify teacher belongs to the school
    if (teacher.updateForm.schoolId !== schoolId) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: You do not have permission to view this teacher</div>
            </div>
        );
    }

    // Extract unique bookings from lessons
    const bookingMap = new Map();
    const lessons = teacher.relations?.lessons || [];
    for (const lesson of lessons) {
        if (lesson.booking && !bookingMap.has(lesson.booking.id)) {
            bookingMap.set(lesson.booking.id, lesson.booking);
        }
    }
    const bookings = Array.from(bookingMap.values());

    return (
        <MasterAdminLayout
            controller={<TeacherLeftColumn teacher={teacher} />}
            form={
                <>
                    <TeacherStatsColumns teacher={teacher} />

                    {/* Teacher Bookings*/}
                    {bookings.length > 0 && (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <BookingContainer key={booking.id} booking={createBookingModel(booking)} />
                            ))}
                        </div>
                    )}
                </>
            }
        />
    );
}
