import { getExampleEventData } from "@/supabase/server/example";
import { getSchoolCredentials } from "@/src/components/NavAdrBarIconsServer";
import { EventTeacherCard } from "@/src/portals/EventTeacherCard";
import { EventStudentCard } from "@/src/portals/EventStudentCard";
import { calculateLessonRevenue, calculateCommission } from "@/getters/commission-calculator";
import { ChangeTheWindFooter } from "@/src/components/ui/ChangeTheWindFooter";
import { SchoolHeaderContent } from "@/src/components/school/SchoolHeaderContent";
import { TransactionExampleTable } from "./TransactionExampleTable";
import { getHMDuration } from "@/getters/duration-getter";
import Image from "next/image";

// Icons
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";

interface ExamplePageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ExamplePage({ searchParams }: ExamplePageProps) {
    const params = await searchParams;
    const eventId = params.id as string;

    const credentials = await getSchoolCredentials();
    const currency = credentials?.currency || "YEN"; 

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
    const equipments = eventData.equipmentEvents?.map((ee: any) => ee.equipment) || [];
    
    // --- Calculations ---
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
    const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown";
    const studentPricePerHour = pkg ? pkg.pricePerStudent / (pkg.durationMinutes / 60) : 0;

    const studentRevenue = pkg ? calculateLessonRevenue(
        pkg.pricePerStudent,
        studentCount,
        eventData.duration,
        pkg.durationMinutes
    ) : 0;
    
    const teacherEarnings = teacherPricePerHour * (eventData.duration / 60);
    const profit = studentRevenue - teacherEarnings;

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8 space-y-12 pb-32">
            <header className="max-w-7xl mx-auto border-b border-border pb-10 flex flex-col sm:flex-row sm:items-start justify-between gap-8">
                <div className="space-y-8 w-full max-w-2xl">
                    <SchoolHeaderContent 
                        titleMain="The Adrenalink Connection"
                        titleSub="Transparent tracking for both teachers and students."
                        descriptionMain={credentials?.name || "School Name"}
                        descriptionSub={`${credentials?.country || "Location"} · ${credentials?.timezone || "Timezone"} · ${currency}`}
                    />
                    
                    <div className="relative h-16 w-full">
                        <ChangeTheWindFooter 
                            showFooter={true} 
                            isStarting={false} 
                            getStartedUrl="/register"
                            variant="primary"
                        />
                    </div>
                </div>
                
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-xs font-mono text-muted-foreground self-start sm:self-center shrink-0 border border-border/50">
                    Event ID: {eventId}
                </div>
            </header>

            {/* Transaction Record - Moved to top */}
            <section className="max-w-7xl mx-auto space-y-4">
                <h2 className="text-xl font-bold tracking-tight uppercase tracking-tighter">Transaction Record</h2>
                <TransactionExampleTable 
                    event={{
                        date: eventData.date,
                        duration: eventData.duration,
                        location: eventData.location,
                        status: eventData.status,
                    }}
                    teacher={{
                        username: teacher?.username || "unknown",
                    }}
                    leaderStudentName={students[0] ? `${students[0].firstName} ${students[0].lastName}` : "Unknown"}
                    studentCount={studentCount}
                    packageData={{
                        description: pkg?.description || "Unknown",
                        pricePerStudent: pkg?.pricePerStudent || 0,
                        durationMinutes: pkg?.durationMinutes || 60,
                        categoryEquipment: pkg?.categoryEquipment || "",
                        capacityEquipment: pkg?.capacityEquipment || 0,
                        capacityStudents: pkg?.capacityStudents || 0,
                    }}
                                            financials={{
                                                teacherEarnings: teacherEarnings,
                                                studentRevenue: studentRevenue,
                                                profit: profit,
                                                currency: currency,
                                                commissionType: commissionType,
                                                commissionValue: commissionValue,
                                            }}
                                        />            </section>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative">
                <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-10 pointer-events-none">
                    <div className="w-[300px] h-[300px] border-2 border-dashed border-primary rounded-full animate-[spin_30s_linear_infinite]" />
                </div>

                {/* Instructor Perspective */}
                <section className="space-y-6 flex flex-col z-10">
                    <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-emerald-500/10">
                            <HeadsetIcon className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">The Instructor</h2>
                            <p className="text-xs text-muted-foreground font-medium">Manage schedule and commissions</p>
                        </div>
                    </div>
                    
                    <div className="relative flex-1 bg-muted/5 rounded-3xl border border-border/50 p-6">
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                Viewing as: <a href={`/teachers/${teacher?.id}`} className="text-foreground hover:underline decoration-1 underline-offset-4 decoration-primary/30 transition-all">{teacher?.firstName} {teacher?.lastName}</a>
                            </p>
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
                        </div>
                    </div>
                </section>

                {/* Student Perspective */}
                <section className="space-y-6 flex flex-col z-10">
                    <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-yellow-500/10">
                            <HelmetIcon className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">The Student</h2>
                            <p className="text-xs text-muted-foreground font-medium">Track booking progress and payments</p>
                        </div>
                    </div>

                    <div className="relative flex-1 bg-muted/5 rounded-3xl border border-border/50 p-6 space-y-6">
                        {students.map((student: any) => (
                            <div key={student.id} className="space-y-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                    Viewing as: <a href={`/students/${student.id}`} className="text-foreground hover:underline decoration-1 underline-offset-4 decoration-primary/30 transition-all">{student.firstName}</a>
                                </p>
                                <EventStudentCard
                                    teacherName={teacherName}
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
                </section>
            </main>

            {/* Event Data Resume */}
            <section className="max-w-7xl mx-auto space-y-8 pt-12">
                <div className="flex items-center gap-3 pb-2 border-b border-border">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-blue-500/10">
                        <FlagIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight uppercase tracking-tighter">Event Data Resume</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <ResumeCard 
                        title="Booking"
                        icon={BookingIcon}
                        color="#3b82f6"
                        data={[
                            { label: "Start Date", value: booking.dateStart },
                            { label: "End Date", value: booking.dateEnd },
                            { label: "Status", value: booking.status, isStatusBadge: true },
                        ]}
                    />

                    <ResumeCard 
                        title="Package"
                        icon={PackageIcon}
                        color="#fb923c"
                        data={[
                            { label: "Description", value: pkg.description },
                            { label: "Type", value: pkg.packageType, isCapitalize: true },
                            { label: "Duration", value: getHMDuration(pkg.durationMinutes) },
                            { label: "Price", value: `${pkg.pricePerStudent} ${currency}` },
                            { label: "Student Cap", value: pkg.capacityStudents },
                            { label: "Equip. Cap", value: pkg.capacityEquipment },
                        ]}
                    />

                    <ResumeCard 
                        title="Lesson & Teacher"
                        icon={HeadsetIcon}
                        color="#22c55e"
                        data={[
                            { label: "Teacher", value: teacherName },
                            { label: "Comm. Type", value: commission.commissionType, isCapitalize: true },
                            { label: "Comm. Value", value: commission.commissionType === "fixed" ? `${commission.cph} ${currency}/h` : `${commission.cph}%` },
                            { label: "Teacher Earning", value: `${teacherEarnings.toFixed(2)} ${currency}` },
                        ]}
                    />

                    <ResumeCard 
                        title="Event Specifics"
                        icon={FlagIcon}
                        color="#06b6d4"
                        data={[
                            { label: "Date", value: new Date(eventData.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
                            { label: "Time", value: new Date(eventData.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) },
                            { label: "Actual Dur.", value: getHMDuration(eventData.duration) },
                            { label: "Location", value: eventData.location || "TBD" },
                        ]}
                    />

                    <ResumeCard 
                        title="Students"
                        icon={HelmetIcon}
                        color="#eab308"
                        data={students.map((s: any) => ({
                            label: "Involved",
                            value: `${s.firstName} ${s.lastName}`
                        }))}
                    />

                    <ResumeCard 
                        title="Equipment"
                        icon={EquipmentIcon}
                        color="#a855f7"
                        data={equipments.length > 0 ? equipments.map((e: any) => ({
                            label: e.category,
                            value: `${e.model} (${e.sku})`,
                            isCapitalize: true
                        })) : [{ label: "Equipment", value: "No active gear linked" }]}
                    />
                </div>
            </section>
        </div>
    );
}

function ResumeCard({ title, icon: Icon, color, data }: { title: string, icon: any, color: string, data: { label: string, value: string | number | null | undefined, isCapitalize?: boolean, isStatusBadge?: boolean }[] }) {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-muted/20">
                <Icon size={16} style={{ color }} />
                <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{title}</h3>
            </div>
            <div className="divide-y divide-border/50 flex-1">
                {data.map((item, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">{item.label}</span>
                        <div className="text-foreground font-semibold">
                            {item.isStatusBadge ? (
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] uppercase font-black tracking-tight">
                                    {item.value}
                                </span>
                            ) : (
                                <span className={item.isCapitalize ? "capitalize" : ""}>
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