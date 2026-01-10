import { getTeacherEvents } from "@/supabase/server/teachers";
import { getSchoolHeader } from "@/types/headers";
import { EventTeacherCard } from "@/src/components/events/EventTeacherCard";

export const dynamic = "force-dynamic";

interface TeacherEventsPageProps {
    params: Promise<{ id: string }>;
}

export default async function TeacherEventsPage({ params }: TeacherEventsPageProps) {
    const { id: teacherId } = await params;

    // Get school from subdomain header
    const schoolHeader = await getSchoolHeader();
    const schoolId = schoolHeader?.id;

    const result = await getTeacherEvents(teacherId, schoolId);

    if (!result.success) {
        return (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">Error: {result.error}</div>
        );
    }

    const events = result.data || [];

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-foreground mb-4">My Schedule</h2>
            {events.map((event) => {
                const pkg = event.schoolPackage;
                const commission = event.lesson.commission;

                // Calculate teacher earnings per hour
                const cph = commission?.cph || 0;

                return (
                    <EventTeacherCard
                        key={event.id}
                        students={event.students || []}
                        location={event.location || "TBD"}
                        date={event.date}
                        duration={event.duration}
                        capacity={pkg?.capacityStudents || 1}
                        packageDescription={pkg?.description || "No description"}
                        pricePerHour={cph}
                        status={event.status}
                        categoryEquipment={pkg?.categoryEquipment}
                        capacityEquipment={pkg?.capacityEquipment}
                        commissionType={commission?.commissionType as "fixed" | "percentage"}
                        commissionValue={cph}
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
