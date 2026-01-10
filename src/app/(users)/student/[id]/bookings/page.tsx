import { getStudentId } from "@/supabase/server/student-id";
import { getSchoolHeader } from "@/types/headers";
import { BOOKING_STATUS_CONFIG, type BookingStatus } from "@/types/status";

export const dynamic = "force-dynamic";

interface BookingPageProps {
    params: Promise<{ id: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
    const { id: studentId } = await params;

    const result = await getStudentId(studentId);

    if (!result.success) {
        return (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">Error: {result.error}</div>
        );
    }

    const bookings = result.data?.relations.bookings || [];

    return (
        <div>
            <h2 className="text-xl font-bold text-foreground mb-4">My Bookings</h2>

            {bookings.length === 0 ? (
                <p className="text-muted-foreground">No bookings found</p>
            ) : (
                <div className="space-y-3">
                    {bookings.map((booking) => {
                        const schoolPackage = booking.school_package;
                        const lessonCount = booking.lessons.length;
                        const startDate = new Date(booking.date_start);
                        const endDate = new Date(booking.date_end);
                        const statusConfig = BOOKING_STATUS_CONFIG[booking.status as BookingStatus] || BOOKING_STATUS_CONFIG.active;

                        return (
                            <div
                                key={booking.id}
                                className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold text-foreground">{schoolPackage?.description || "Booking"}</h3>
                                            <span
                                                className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                                style={{
                                                    backgroundColor: `${statusConfig.color}20`,
                                                    color: statusConfig.color,
                                                }}
                                            >
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>
                                                Dates:{" "}
                                                {startDate.toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}{" "}
                                                -{" "}
                                                {endDate.toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </p>
                                            <p>Package Duration: {schoolPackage?.duration_minutes || 0} minutes</p>
                                            <p>Lessons: {lessonCount}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-foreground">
                                            ${schoolPackage?.price_per_student || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground">per student</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
