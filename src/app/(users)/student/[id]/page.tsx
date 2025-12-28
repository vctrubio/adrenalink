import { getStudents, getStudentEvents } from "@/actions/student-action";
import { getSchoolHeader } from "@/types/headers";
import { EventStudentCard } from "@/src/portals/EventStudentCard";

interface StudentPageProps {
    params: Promise<{ id: string }>;
}

export default async function StudentPage({ params }: StudentPageProps) {
    const { id: studentId } = await params;

    // Get school from subdomain header
    const schoolHeader = await getSchoolHeader();

    // Fetch student data
    const studentResult = await getStudents();
    const eventsResult = await getStudentEvents(studentId);

    if (!studentResult.success) {
        return <div className="p-4 text-destructive">Error loading student data</div>;
    }

    const student = studentResult.data.find((s) => s.schema.id === studentId);

    if (!student) {
        return <div className="p-4 text-destructive">Student not found</div>;
    }

    const events = eventsResult.success ? eventsResult.data : [];

    return (
        <div className="space-y-12 max-w-2xl mx-auto">
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 border-b border-border/50">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                    Hello {student.schema.firstName} {student.schema.lastName}
                </h2>
                {schoolHeader && (
                    <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                        Welcome to {schoolHeader.name}
                    </p>
                )}
            </div>

            <div className="space-y-6">
                <div className="flex items-baseline justify-between px-2">
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">Your Events</h3>
                    <span className="text-sm font-bold bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                        {events.length}
                    </span>
                </div>

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
            </div>
        </div>
    );
}
