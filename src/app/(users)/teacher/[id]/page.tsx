import { getTeacherEvents } from "@/actions/teacher-action";
import { EventTeacherCard } from "@/src/components/events/EventTeacherCard";
import { calculateLessonRevenue, calculateCommission } from "@/getters/commission-calculator";

interface TeacherPageProps {
    params: Promise<{ id: string }>;
}

export default async function TeacherPage({ params }: TeacherPageProps) {
    const { id: teacherId } = await params;

    const eventsResult = await getTeacherEvents(teacherId);
    const events = eventsResult.success ? eventsResult.data : [];

    return (
        <div className="flex flex-col gap-4">
            {events.map((event) => {
                const pkg = event.schoolPackage;
                const studentNames = event.students.map((s: any) => `${s.firstName} ${s.lastName}`);
                const studentCount = event.students.length;

                let teacherPricePerHour = 0;
                let commissionValue = 0;
                let commissionType: "fixed" | "percentage" = "fixed";

                const commission = event.lesson?.commission;

                if (pkg && commission) {
                    commissionType = commission.commissionType;
                    commissionValue = parseFloat(commission.cph || "0");

                    const lessonRevenue = calculateLessonRevenue(
                        pkg.pricePerStudent,
                        studentCount,
                        event.duration,
                        pkg.durationMinutes
                    );
                    const commCalc = calculateCommission(
                        event.duration,
                        { type: commissionType, cph: commissionValue },
                        lessonRevenue,
                        pkg.durationMinutes
                    );
                    teacherPricePerHour = commCalc.earned / (event.duration / 60);
                }

                return (
                    <EventTeacherCard
                        key={event.id}
                        students={studentNames}
                        location={event.location || "TBD"}
                        date={new Date(event.date).toISOString()}
                        duration={event.duration}
                        capacity={pkg?.capacityStudents || 0}
                        packageDescription={pkg?.description || "No description"}
                        pricePerHour={teacherPricePerHour}
                        status={event.status}
                        categoryEquipment={pkg?.categoryEquipment}
                        capacityEquipment={pkg?.capacityEquipment}
                        commissionType={commissionType}
                        commissionValue={commissionValue}
                    />
                );
            })}
            {events.length === 0 && (
                <div className="text-center py-12 bg-card rounded-2xl border-2 border-dashed border-border text-muted-foreground">
                    No lessons assigned yet.
                </div>
            )}
        </div>
    );
}
