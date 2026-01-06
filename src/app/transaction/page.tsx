import { getEventTransaction } from "@/supabase/server/events";
import { getSchoolCredentials } from "@/supabase/server/admin";
import { EventTeacherCard } from "@/src/components/events/EventTeacherCard";
import { EventStudentCard } from "@/src/components/events/EventStudentCard";
import { calculateLessonRevenue, calculateCommission } from "@/getters/commission-calculator";
import { ChangeTheWindFooter } from "@/src/components/ui/ChangeTheWindFooter";
import { SchoolAdranlinkConnectionHeader } from "@/src/components/school/SchoolAdranlinkConnectionHeader";
import { TransactionEventsTable } from "../(admin)/(tables)/TransactionEventsTable";
import { getHMDuration } from "@/getters/duration-getter";

// Icons
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";

interface TransactionPageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TransactionExamplePage({ searchParams }: TransactionPageProps) {
    const params = await searchParams;
    const eventId = params.id as string;

    const credentials = await getSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    if (!eventId) {
        return (
            <div className="p-10 flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Transaction Showcase</h1>
                    <p className="text-muted-foreground">Please provide an event ID in the URL query: ?id=...</p>
                </div>
            </div>
        );
    }

    const result = await getEventTransaction(eventId);

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
    // Updated: booking has school_package directly
    const pkg = booking.school_package;
    const teacher = lesson.teacher;
    // Updated: snake_case for booking_student and first_name/last_name
    const students = booking.booking_student.map((bs: any) => bs.student);
    // Updated: snake_case for equipment_event
    const equipments = eventData.equipment_event?.map((ee: any) => ee.equipment) || [];

    // --- Calculations ---
    const studentCount = students.length;
    let teacherPricePerHour = 0;
    let commissionValue = 0;
    let commissionType: "fixed" | "percentage" = "fixed";
    const commission = lesson.teacher_commission; // snake_case name from query

    if (pkg && commission) {
        commissionType = commission.commission_type;
        commissionValue = parseFloat(commission.cph || "0");

        const lessonRevenue = calculateLessonRevenue(pkg.price_per_student, studentCount, eventData.duration, pkg.duration_minutes);
        const commCalc = calculateCommission(eventData.duration, { type: commissionType, cph: commissionValue }, lessonRevenue, pkg.duration_minutes);
        teacherPricePerHour = commCalc.earned / (eventData.duration / 60);
    }

    const studentNames = students.map((s: any) => `${s.first_name} ${s.last_name}`);
    const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}` : "Unknown";
    const studentPricePerHour = pkg ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0;

    const studentRevenue = pkg ? calculateLessonRevenue(pkg.price_per_student, studentCount, eventData.duration, pkg.duration_minutes) : 0;

    const teacherEarnings = teacherPricePerHour * (eventData.duration / 60);
    const profit = studentRevenue - teacherEarnings;

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8 space-y-10 pb-40">
            <header className="max-w-7xl mx-auto pb-10">
                <div className="space-y-8 w-full">
                    <SchoolAdranlinkConnectionHeader
                        schoolName={credentials?.name || "School Name"}
                        username={credentials?.username || "username"}
                        country={credentials?.country || "Location"}
                        timezone={credentials?.timezone || "Timezone"}
                        currency={currency}
                        eventId={eventId}
                        description={
                            <>
                                Transparent tracking{" "}
                                <span className="text-muted-foreground/40">
                                    <span className="italic font-medium">for both</span> teachers and students.
                                </span>
                            </>
                        }
                    />{" "}
                </div>
            </header>

            {/* Transaction Record */}
            <section className="max-w-7xl mx-auto space-y-4">
                <h2 className="text-xl font-bold tracking-tight uppercase tracking-tighter">Transaction Record</h2>
                <TransactionEventsTable
                    events={[
                        {
                            event: {
                                id: eventId,
                                date: eventData.date,
                                duration: eventData.duration,
                                location: eventData.location,
                                status: eventData.status,
                            },
                            teacher: {
                                username: teacher?.username || "unknown",
                            },
                            leaderStudentName: students[0] ? `${students[0].first_name} ${students[0].last_name}` : "Unknown",
                            studentCount: studentCount,
                            studentNames: studentNames,
                            packageData: {
                                description: pkg?.description || "Unknown",
                                pricePerStudent: pkg?.price_per_student || 0,
                                durationMinutes: pkg?.duration_minutes || 60,
                                categoryEquipment: pkg?.category_equipment || "",
                                capacityEquipment: pkg?.capacity_equipment || 0,
                                capacityStudents: pkg?.capacity_students || 0,
                            },
                            financials: {
                                teacherEarnings: teacherEarnings,
                                studentRevenue: studentRevenue,
                                profit: profit,
                                currency: currency,
                                commissionType: commissionType,
                                commissionValue: commissionValue,
                            },
                            equipments: equipments.map((e: any) => ({
                                id: e.id,
                                brand: e.brand,
                                model: e.model,
                                size: e.size ? parseFloat(e.size) : null,
                            })),
                        },
                    ]}
                />
            </section>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative">
                <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-10 pointer-events-none">
                    {/* <div className="w-[300px] h-[300px] border-2 border-dashed border-primary rounded-full animate-[spin_30s_linear_infinite]" /> */}
                </div>

                {/* Instructor Perspective */}
                <PerspectiveSection
                    title="The Instructor"
                    subtitle="Manage schedule and commissions"
                    icon={HeadsetIcon}
                    bgColor="bg-emerald-500/10"
                    iconColor="text-emerald-500"
                    viewingAs={{
                        label: `${teacher?.first_name} ${teacher?.last_name}`,
                        link: `/teachers/${teacher?.id}`,
                    }}
                >
                    <EventTeacherCard
                        students={studentNames}
                        location={eventData.location || "TBD"}
                        date={new Date(eventData.date).toISOString()}
                        duration={eventData.duration}
                        capacity={pkg?.capacity_students || 0}
                        packageDescription={pkg?.description || "No description"}
                        pricePerHour={teacherPricePerHour}
                        status={eventData.status}
                        categoryEquipment={pkg?.category_equipment}
                        capacityEquipment={pkg?.capacity_equipment}
                        commissionType={commissionType}
                        commissionValue={commissionValue}
                    />
                </PerspectiveSection>

                {/* Student Perspective */}
                <PerspectiveSection title="The Student" subtitle="Track booking progress and payments" icon={HelmetIcon} bgColor="bg-yellow-500/10" iconColor="text-yellow-500">
                    <div className="space-y-6">
                        {students.map((student: any) => (
                            <div key={student.id} className="space-y-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                    Viewing as:{" "}
                                    <a href={`/students/${student.id}`} className="text-foreground hover:underline decoration-1 underline-offset-4 decoration-primary/30 transition-all">
                                        {student.first_name}
                                    </a>
                                </p>
                                <EventStudentCard
                                    teacherName={teacherName}
                                    location={eventData.location || "TBD"}
                                    date={new Date(eventData.date).toISOString()}
                                    duration={eventData.duration}
                                    categoryEquipment={pkg?.category_equipment}
                                    capacityEquipment={pkg?.capacity_equipment}
                                    packageDescription={pkg?.description}
                                    pricePerHour={studentPricePerHour}
                                    status={eventData.status}
                                />
                            </div>
                        ))}
                    </div>
                </PerspectiveSection>
            </main>

            {/* Event Data Resume */}
            <section className="max-w-7xl mx-auto space-y-8 py-12">
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
                            { label: "Start Date", value: booking.date_start },
                            { label: "End Date", value: booking.date_end },
                            { label: "Status", value: "active", isStatusBadge: true }, // Booking status not in new query, assuming active or adding it back? Query says date_start, date_end. It doesn't select status for booking! I should check the query.
                        ]}
                    />

                    <ResumeCard
                        title="Package"
                        icon={PackageIcon}
                        color="#fb923c"
                        data={[
                            { label: "Description", value: pkg.description },
                            { label: "Type", value: pkg.package_type, isCapitalize: true },
                            { label: "Duration", value: getHMDuration(pkg.duration_minutes) },
                            { label: "Price", value: `${pkg.price_per_student} ${currency}` },
                            { label: "PPH", value: `${studentPricePerHour.toFixed(2)} ${currency}/h` },
                            { label: "Student Cap", value: pkg.capacity_students },
                            { label: "Equip. Cap", value: pkg.capacity_equipment },
                        ]}
                    />

                    <ResumeCard
                        title="Lesson & Teacher"
                        icon={HeadsetIcon}
                        color="#22c55e"
                        data={[
                            { label: "Teacher", value: teacherName },
                            { label: "Comm. Type", value: commission.commission_type, isCapitalize: true },
                            { label: "Comm. Value", value: commission.commission_type === "fixed" ? `${commission.cph} ${currency}/h` : `${commission.cph}%` },
                            { label: "Teacher Earning", value: `${teacherEarnings.toFixed(2)} ${currency}` },
                            { label: "Lesson Status", value: lesson.status, isStatusBadge: true },
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
                            { label: "Event Status", value: eventData.status, isStatusBadge: true },
                        ]}
                    />

                    <ResumeCard
                        title="Students"
                        icon={HelmetIcon}
                        color="#eab308"
                        data={students.map((s: any) => ({
                            label: "Involved",
                            value: `${s.first_name} ${s.last_name}`,
                        }))}
                    />

                    <ResumeCard
                        title="Equipment"
                        icon={EquipmentIcon}
                        color="#a855f7"
                        data={
                            equipments.length > 0
                                ? equipments.map((e: any) => ({
                                    label: e.category,
                                    value: `${e.model} (${e.sku})`,
                                    isCapitalize: true,
                                }))
                                : [{ label: "Equipment", value: "No active gear linked" }]
                        }
                    />
                </div>
            </section>

            <ChangeTheWindFooter showFooter={true} isStarting={false} getStartedUrl="/home" registerUrl="/" />
        </div>
    );
}

// --- Sub-components ---

function PerspectiveSection({ title, subtitle, icon: Icon, bgColor, iconColor, viewingAs, children }: { title: string; subtitle: string; icon: any; bgColor: string; iconColor: string; viewingAs?: { label: string; link: string }; children: React.ReactNode }) {
    return (
        <section className="space-y-6 flex flex-col z-10">
            <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${bgColor}`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
                </div>
            </div>

            <div className="relative flex-1 bg-muted/5 rounded-3xl border border-border/50 p-6">
                <div className="space-y-2">
                    {viewingAs && (
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                            Viewing as:{" "}
                            <a href={viewingAs.link} className="text-foreground hover:underline decoration-1 underline-offset-4 decoration-primary/30 transition-all">
                                {viewingAs.label}
                            </a>
                        </p>
                    )}
                    {children}
                </div>
            </div>
        </section>
    );
}

function ResumeCard({ title, icon: Icon, color, data }: { title: string; icon: any; color: string; data: { label: string; value: string | number | null | undefined; isCapitalize?: boolean; isStatusBadge?: boolean }[] }) {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-muted/20">
                <Icon size={16} style={{ color }} />
                <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
                    {title}
                </h3>
            </div>
            <div className="divide-y divide-border/50 flex-1">
                {data.map((item, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">{item.label}</span>
                        <div className="text-foreground font-semibold text-right">
                            {item.isStatusBadge ? <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] uppercase font-black tracking-tight">{item.value}</span> : <span className={item.isCapitalize ? "capitalize" : ""}>{item.value}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}