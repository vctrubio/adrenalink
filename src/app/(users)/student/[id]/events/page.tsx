import { getStudentEvents } from "@/supabase/server/students";
import { getSchoolHeader } from "@/types/headers";
import { EventStudentCard } from "@/src/components/events/EventStudentCard";

export const dynamic = "force-dynamic";

interface StudentEventsPageProps {
    params: Promise<{ id: string }>;
}

export default async function StudentEventsPage({ params }: StudentEventsPageProps) {
    const { id: studentId } = await params;

    // Get school from subdomain header
    const schoolHeader = await getSchoolHeader();
    const schoolId = schoolHeader?.id;

    const result = await getStudentEvents(studentId, schoolId);

    if (!result.success) {
        return (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">Error: {result.error}</div>
        );
    }

    const events = result.data || [];

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-foreground mb-4">My Events</h2>
            {events.map((event) => {
                const pkg = event.schoolPackage;
                const teacher = event.teacher;
                const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown";
                const pricePerHour = pkg ? pkg.pricePerStudent / (pkg.durationMinutes / 60) : 0;

                return (
                    <EventStudentCard
                        key={event.id}
                        teacherName={teacherName}
                        location={event.location || "TBD"}
                        date={event.date}
                        duration={event.duration}
                        categoryEquipment={pkg?.categoryEquipment}
                        capacityEquipment={pkg?.capacityEquipment}
                        packageDescription={pkg?.description}
                        pricePerHour={pricePerHour}
                        status={event.status}
                    />
                );
            })}
            {events.length === 0 && (
                <div className="text-center py-12 bg-card rounded-2xl border-2 border-dashed border-border text-muted-foreground">
                    No events scheduled yet.
                </div>
            )}
        </div>
    );
}
