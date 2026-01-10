import { getStudentEvents } from "@/supabase/server/students";
import { EventStudentCard } from "@/src/components/events/EventStudentCard";
import { getSchoolHeader } from "@/types/headers";

export const dynamic = "force-dynamic";

interface StudentPageProps {
    params: Promise<{ id: string }>;
}

export default async function StudentPage({ params }: StudentPageProps) {
    const { id: studentId } = await params;

    // Get school from subdomain header
    const schoolHeader = await getSchoolHeader();
    const schoolId = schoolHeader?.id;

    const eventsResult = await getStudentEvents(studentId, schoolId);
    const events = eventsResult.success ? eventsResult.data : [];

    return (
        <div className="flex flex-col gap-4">
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
                        date={new Date(event.date).toISOString()}
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
