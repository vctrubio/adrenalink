import { getExampleEventData } from "@/supabase/server/example";
import { EventTeacherCard } from "@/src/portals/EventTeacherCard";
import { EventStudentCard } from "@/src/portals/EventStudentCard";
import { calculateLessonRevenue, calculateCommission } from "@/getters/commission-calculator";
import { ENTITY_DATA } from "@/config/entities";

interface ExamplePageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ExamplePage({ searchParams }: ExamplePageProps) {
    const params = await searchParams;
    const eventId = params.id as string;

    if (!eventId) {
        return (
            <div className="p-10 flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Example Showcase</h1>
                    <p className="text-muted-foreground">Please provide an event ID in the URL query: ?id=...</p>
                </div>
            </div>
        );
    }

    const result = await getExampleEventData(eventId);

    if (!result.success || !result.data) {
        return (
            <div className="p-10 flex items-center justify-center min-h-screen">
                <div className="text-destructive font-medium">Error: {result.error || "Data not found"}</div>
            </div>
        );
    }

    const eventData = result.data;
    const lesson = eventData.lesson;
    const booking = lesson.booking;
    const pkg = booking.studentPackage.schoolPackage;
    const teacher = lesson.teacher;
    const students = booking.bookingStudents.map((bs: any) => bs.student);
    
    // --- Teacher Calculations ---
    const studentCount = students.length;
    let teacherPricePerHour = 0;
    let commissionValue = 0;
    let commissionType: "fixed" | "percentage" = "fixed";
    const commission = lesson.commission;

    if (pkg && commission) {
        commissionType = commission.commissionType;
        commissionValue = parseFloat(commission.cph || "0");

        const lessonRevenue = calculateLessonRevenue(
            pkg.pricePerStudent,
            studentCount,
            eventData.duration,
            pkg.durationMinutes
        );
        const commCalc = calculateCommission(
            eventData.duration,
            { type: commissionType, cph: commissionValue },
            lessonRevenue,
            pkg.durationMinutes
        );
        teacherPricePerHour = commCalc.earned / (eventData.duration / 60);
    }

    const studentNames = students.map((s: any) => `${s.firstName} ${s.lastName}`);

    // --- Student Calculations ---
    const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown";
    const studentPricePerHour = pkg ? pkg.pricePerStudent / (pkg.durationMinutes / 60) : 0;

    // --- Entities ---
    const teacherEntity = ENTITY_DATA.find(e => e.id === "teacher")!;
    const studentEntity = ENTITY_DATA.find(e => e.id === "student")!;
    const bookingEntity = ENTITY_DATA.find(e => e.id === "booking")!;
    const packageEntity = ENTITY_DATA.find(e => e.id === "schoolPackage")!;
    const eventEntity = ENTITY_DATA.find(e => e.id === "event")!;

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8 space-y-12">
            <header className="max-w-7xl mx-auto border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">The Adrenalink Connection</h1>
                    <p className="text-muted-foreground">
                        Transparent tracking for both teachers and students.
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-xs font-mono text-muted-foreground">
                    Event ID: {eventId}
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative">
                {/* Visual Connector (Desktop only) */}
                <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-10">
                    <div className="w-[200px] h-[200px] border-2 border-dashed border-primary rounded-full animate-[spin_20s_linear_infinite]" />
                </div>

                {/* 1. Teacher Perspective */}
                <section className="space-y-6 flex flex-col z-10">
                    <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: teacherEntity.bgColor }}>
                            <teacherEntity.icon className="w-6 h-6" style={{ color: teacherEntity.color }} />
                        </div>
                        <div>
                            <div className="block">
                                <h2 className="text-xl font-semibold">Teacher Perspective</h2>
                            </div>
                            <p className="text-xs text-muted-foreground">Schedule and earnings</p>
                        </div>
                    </div>
                    
                    <div className="relative flex-1 bg-muted/5 rounded-3xl border border-border/50 p-6 flex flex-col justify-center">
                        <EventTeacherCard
                            students={studentNames}
                            location={eventData.location || "TBD"}
                            date={new Date(eventData.date).toISOString()}
                            duration={eventData.duration}
                            capacity={pkg?.capacityStudents || 0}
                            packageDescription={pkg?.description || "No description"}
                            pricePerHour={teacherPricePerHour}
                            status={eventData.status}
                            categoryEquipment={pkg?.categoryEquipment}
                            capacityEquipment={pkg?.capacityEquipment}
                            commissionType={commissionType}
                            commissionValue={commissionValue}
                        />
                         <div className="mt-6 p-4 rounded-xl bg-card border border-border text-sm text-muted-foreground">
                            Teachers track their <span className="font-medium text-foreground">Earned Commission</span> in real-time. Every minute on the water is accounted for.
                        </div>
                    </div>
                </section>

                {/* 2. Student Perspective */}
                <section className="space-y-6 flex flex-col z-10">
                    <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: studentEntity.bgColor }}>
                            <studentEntity.icon className="w-6 h-6" style={{ color: studentEntity.color }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">The Student</h2>
                            <p className="text-xs text-muted-foreground">Learning and progression</p>
                        </div>
                    </div>

                    <div className="relative flex-1 bg-muted/5 rounded-3xl border border-border/50 p-6 space-y-6 flex flex-col justify-center">
                        <div className="space-y-6">
                                                    {students.map((student: any) => (
                                                        <div key={student.id} className="space-y-2">
                                                            <div className="inline-block">
                                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">
                                                                    Viewing as: <span className="text-foreground">{student.firstName}</span>
                                                                </p>
                                                            </div>
                                                            <EventStudentCard                                        teacherName={teacherName}
                                        location={eventData.location || "TBD"}
                                        date={new Date(eventData.date).toISOString()}
                                        duration={eventData.duration}
                                        categoryEquipment={pkg?.categoryEquipment}
                                        capacityEquipment={pkg?.capacityEquipment}
                                        packageDescription={pkg?.description}
                                        pricePerHour={studentPricePerHour}
                                        status={eventData.status}
                                    />
                                </div>
                            ))}
                        </div>
                         <div className="mt-6 p-4 rounded-xl bg-card border border-border text-sm text-muted-foreground">
                            Students have <span className="font-medium text-foreground">One Source of Truth</span> for pricing, duration, and equipment usage.
                        </div>
                    </div>
                </section>
            </main>

            {/* Event Data Resume */}
            <section className="max-w-7xl mx-auto space-y-6 pb-20">
                <div className="flex items-center gap-3 pb-2 border-b border-border">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: eventEntity.bgColor }}>
                        <eventEntity.icon className="w-6 h-6" style={{ color: eventEntity.color }} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Event Data Resume</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1 */}
                    <div className="space-y-6">
                        {/* Booking & Package */}
                        <ResumeCard 
                            entity={bookingEntity} 
                            title="Booking & Package"
                            data={[
                                { label: "Booking ID", value: booking.id, isMono: true },
                                { label: "Booking Start", value: booking.dateStart },
                                { label: "Booking End", value: booking.dateEnd },
                                { label: "Package", value: pkg.description, isEntityLink: { entity: packageEntity, id: pkg.id } },
                                { label: "Base Price", value: `${pkg.pricePerStudent} €` },
                                { label: "Duration", value: `${pkg.durationMinutes} mins` },
                            ]}
                        />

                        {/* Teacher & Commission */}
                        <ResumeCard 
                            entity={teacherEntity} 
                            title="Teacher & Financials"
                            data={[
                                { label: "Teacher", value: `${teacher.firstName} ${teacher.lastName}`, isEntityLink: { entity: teacherEntity, id: teacher.id } },
                                { label: "Username", value: `@${teacher.username}` },
                                { label: "Commission Type", value: commission.commissionType, isCapitalize: true },
                                { label: "Commission Rate", value: commission.commissionType === "fixed" ? `${commission.cph} €/h` : `${commission.cph}%` },
                                { label: "Teacher Earning (Event)", value: `${(teacherPricePerHour * (eventData.duration / 60)).toFixed(2)} €` },
                            ]}
                        />
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6">
                        {/* Event Details */}
                        <ResumeCard 
                            entity={eventEntity} 
                            title="Event Specifics"
                            data={[
                                { label: "Event ID", value: eventData.id, isMono: true },
                                { label: "Date & Time", value: new Date(eventData.date).toLocaleString() },
                                { label: "Actual Duration", value: `${eventData.duration} mins` },
                                { label: "Location", value: eventData.location || "TBD" },
                                { label: "Status", value: eventData.status, isStatusBadge: true },
                            ]}
                        />

                        {/* Involved Students */}
                        <ResumeCard 
                            entity={studentEntity} 
                            title="Involved Students"
                            data={students.map((s: any) => ({
                                label: "Student",
                                value: `${s.firstName} ${s.lastName}`,
                                isEntityLink: { entity: studentEntity, id: s.id }
                            }))}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function ResumeCard({ entity, title, data }: { entity: any, title: string, data: { label: string, value: string | null | undefined, isMono?: boolean, isCapitalize?: boolean, isStatusBadge?: boolean, isEntityLink?: { entity: any, id: string } }[] }) {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2" style={{ backgroundColor: `${entity.bgColor}10` }}>
                <entity.icon size={16} style={{ color: entity.color }} />
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: entity.color }}>{title}</h3>
            </div>
            <div className="divide-y divide-border">
                {data.map((item, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">{item.label}</span>
                        <div className="text-foreground font-semibold">
                            {item.isEntityLink ? (
                                <span className="px-2 py-1 -mx-2 -my-1 rounded transition-colors cursor-default" style={{ color: "inherit" }}>
                                    {item.value}
                                </span>
                            ) : item.isStatusBadge ? (
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-tight">
                                    {item.value}
                                </span>
                            ) : (
                                <span className={`${item.isMono ? "font-mono text-xs" : ""} ${item.isCapitalize ? "capitalize" : ""}`}>
                                    {item.value}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
