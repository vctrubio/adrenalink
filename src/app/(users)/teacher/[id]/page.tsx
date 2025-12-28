import { getTeachers, getTeacherEvents } from "@/actions/teacher-action";
import { getSchoolHeader } from "@/types/headers";
import { EventTeacherCard } from "@/src/portals/EventTeacherCard";
import { calculateLessonRevenue, calculateCommission } from "@/getters/commission-calculator";

interface TeacherPageProps {
    params: Promise<{ id: string }>;
}

export default async function TeacherPage({ params }: TeacherPageProps) {
    const { id: teacherId } = await params;

    // Get school from subdomain header
    const schoolHeader = await getSchoolHeader();

    // Fetch teacher data
    const teacherResult = await getTeachers();
    const eventsResult = await getTeacherEvents(teacherId);

    if (!teacherResult.success) {
        return <div className="p-4 text-destructive">Error loading teacher data</div>;
    }

    const teacher = teacherResult.data.find((t) => t.schema.id === teacherId);

    if (!teacher) {
        return <div className="p-4 text-destructive">Teacher not found</div>;
    }

    const events = eventsResult.success ? eventsResult.data : [];

    return (
        <div className="space-y-12 max-w-2xl mx-auto">
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 border-b border-border/50">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                    Hello {teacher.schema.firstName} {teacher.schema.lastName}
                </h2>
                {schoolHeader && (
                    <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                        Welcome to {schoolHeader.name}
                    </p>
                )}
            </div>

            <div className="space-y-6">
                <div className="flex items-baseline justify-between px-2">
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">Assigned Lessons</h3>
                    <span className="text-sm font-bold bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                        {events.length}
                    </span>
                </div>

                <div className="flex flex-col gap-4">
                    {events.map((event) => {
                        const pkg = event.schoolPackage;
                        const studentNames = event.students.map((s: any) => `${s.firstName} ${s.lastName}`);
                        const studentCount = event.students.length;
                        
                        let teacherPricePerHour = 0;
                        let commissionValue = 0;
                        let commissionType: "fixed" | "percentage" = "fixed";

                        if (pkg && event.commission) {
                            commissionType = event.commission.commissionType;
                            commissionValue = parseFloat(event.commission.cph);
                            
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
            </div>
        </div>
    );
}
