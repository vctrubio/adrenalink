import { getServerConnection } from "@/supabase/connection";
import { getEventTransaction } from "@/supabase/rpc/event_transaction"; // Only getEventTransaction
import { getSchoolCredentials } from "@/supabase/server/admin";
import { ChangeTheWindFooter } from "@/src/components/ui/ChangeTheWindFooter";
import { SchoolAdranlinkConnectionHeader } from "@/src/components/school/SchoolAdranlinkConnectionHeader";
import { getHMDuration } from "@/getters/duration-getter";
import { getTimeFromISO } from "@/getters/queue-getter";
import { TransactionEventsTable } from "../(admin)/(tables)/TransactionEventsTable";
import { TablesProvider } from "../(admin)/(tables)/layout";
import Link from "next/link";
import type { TransactionEventData } from "@/types/transaction-event"; // Import TransactionEventData type

// Icons
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";

// Components
import { EventTeacherCard } from "@/src/components/events/EventTeacherCard";
import { EventStudentCard } from "@/src/components/events/EventStudentCard";

export const dynamic = "force-dynamic";

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

    const supabase = getServerConnection();
    let transaction: TransactionEventData | null = null; // Type as TransactionEventData
    let errorMsg;

    try {
        transaction = await getEventTransaction(supabase, eventId, currency); // Pass currency
    } catch (e: any) {
        errorMsg = e.message;
    }

    if (errorMsg || !transaction) {
        return (
            <div className="p-10 flex items-center justify-center min-h-screen">
                <div className="text-destructive font-medium">Error: {errorMsg || "Data not found"}</div>
            </div>
        );
    }

    // tableData is now directly transaction
    const tableData = transaction;
    const { event, teacher, booking, packageData, financials } = tableData;

    // Derived values for perspective cards
    const teacherPricePerHour = financials.teacherEarnings / (event.duration / 60);
    const studentPricePerHour = packageData.pricePerStudent / (packageData.durationMinutes / 60);

    return (
        <TablesProvider>
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
                        />
                    </div>
                </header>

                {/* Transaction Record */}
                <section className="max-w-7xl mx-auto space-y-4">
                    <h2 className="text-xl font-bold tracking-tight uppercase">Transaction Record</h2>
                    <TransactionEventsTable events={[tableData]} enableTableLogic={false} />
                </section>

                <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative">
                    {/* Instructor Perspective */}
                    <PerspectiveSection
                        title="The Instructor"
                        subtitle="Manage schedule and commissions"
                        icon={HeadsetIcon}
                        bgColor="bg-emerald-500/10"
                        iconColor="text-emerald-500"
                        viewingAs={{
                            label: teacher.username,
                            link: `/teacher/${teacher.id}`, // Use singular /teacher/
                        }}
                    >
                        <EventTeacherCard
                            students={booking.students.map(s => `${s.firstName} ${s.lastName}`)} // Use booking.students
                            location={event.location || "TBD"}
                            date={event.date}
                            duration={event.duration}
                            capacity={packageData.capacityStudents}
                            packageDescription={packageData.description}
                            pricePerHour={teacherPricePerHour}
                            status={event.status}
                            categoryEquipment={packageData.categoryEquipment}
                            capacityEquipment={packageData.capacityEquipment}
                            commissionType={financials.commissionType}
                            commissionValue={financials.commissionValue}
                            schoolLogo={credentials?.logo}
                        />
                    </PerspectiveSection>

                    {/* Student Perspective */}
                    <PerspectiveSection
                        title="The Student"
                        subtitle="Track booking progress and payments"
                        icon={HelmetIcon}
                        bgColor="bg-yellow-500/10"
                        iconColor="text-yellow-500"
                    >
                        <div className="space-y-6">
                            {booking.students.map((s: any, idx: number) => ( // Use booking.students
                                <div key={s.id || idx} className="space-y-2">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                        Viewing as:{" "}
                                        <a
                                            href={`/student/${s.id}`} // Use singular /student/
                                            className="text-foreground hover:underline decoration-1 underline-offset-4 decoration-primary/30 transition-all font-black"
                                        >
                                            {`${s.firstName} ${s.lastName}`}
                                        </a>
                                    </p>
                                    <EventStudentCard
                                        teacherName={teacher.username}
                                        location={event.location || "TBD"}
                                        date={event.date}
                                        duration={event.duration}
                                        categoryEquipment={packageData.categoryEquipment}
                                        capacityEquipment={packageData.capacityEquipment}
                                        packageDescription={packageData.description}
                                        pricePerHour={studentPricePerHour}
                                        status={event.status}
                                        schoolLogo={credentials?.logo}
                                    />
                                </div>
                            ))}
                        </div>
                    </PerspectiveSection>
                </main>

                {/* Transaction Summary */}
                <section className="max-w-7xl mx-auto space-y-8 py-12">
                    <div className="flex items-center gap-3 pb-2 border-b border-border">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-blue-500/10">
                            <FlagIcon className="w-6 h-6 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight uppercase tracking-tighter">Transaction Summary</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {(() => {
                            const leaderStudent = booking.students.find( // Use booking.students
                                (s) => s.id === booking.id, // Find leader by ID, not name
                            );
                            return (
                                <ResumeCard
                                    title="Booking & Package"
                                    icon={BookingIcon}
                                    color="#3b82f6"
                                    data={[
                                        {
                                            label: "Booking",
                                            value: (
                                                <Link
                                                    href={`/bookings/${booking.id}`} // Use booking.id
                                                    className="hover:underline decoration-1 underline-offset-4 decoration-primary/30 transition-all"
                                                >
                                                    {booking.id.slice(0, 8)}...
                                                </Link>
                                            ),
                                        },
                                        {
                                            label: "Leader",
                                            value: leaderStudent ? (
                                                <Link
                                                    href={`/students/${leaderStudent.id}`}
                                                    className="hover:underline decoration-1 underline-offset-4 decoration-primary/30 transition-all"
                                                >
                                                    {`${leaderStudent.firstName} ${leaderStudent.lastName}`}
                                                </Link>
                                            ) : (
                                                booking.leaderStudentName // Fallback to leaderStudentName
                                            ),
                                        },
                                        { label: "Package", value: packageData.description },
                                        {
                                            label: "PPH",
                                            value: `${(packageData.pricePerStudent / (packageData.durationMinutes / 60)).toFixed(2)} ${currency}/h`,
                                        },
                                    ]}
                                />
                            );
                        })()}

                        <ResumeCard
                            title="Teacher"
                            icon={HeadsetIcon}
                            color="#22c55e"
                            data={[
                                {
                                    label: "Username",
                                    value: (
                                        <Link
                                            href={`/teachers/${teacher.id}`} // Use teacher.id
                                            className="hover:underline decoration-1 underline-offset-4 decoration-primary/30 transition-all"
                                        >
                                            {teacher.username}
                                        </Link>
                                    ),
                                },
                                { label: "Comm. Type", value: financials.commissionType, isCapitalize: true },
                                {
                                    label: "Comm. Value",
                                    value:
                                        financials.commissionType === "fixed"
                                            ? `${financials.commissionValue} ${currency}/h`
                                            : `${financials.commissionValue}%`,
                                },
                                { label: "Net Earning", value: `${financials.teacherEarnings.toFixed(2)} ${currency}` },
                            ]}
                        />

                        <ResumeCard
                            title="Event"
                            icon={FlagIcon}
                            color="#06b6d4"
                            data={[
                                {
                                    label: "Date",
                                    value: new Date(event.date).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    }),
                                },
                                {
                                    label: "Time",
                                    value: getTimeFromISO(event.date),
                                },
                                { label: "Location", value: event.location || "TBD" },
                                { label: "Status", value: event.status, isStatusBadge: true },
                            ]}
                        />

                        <ResumeCard
                            title="Student"
                            icon={HelmetIcon}
                            color="#eab308"
                            data={booking.students.map((s: any) => ({ // Use booking.students
                                label: "Involved",
                                value: (
                                    <a
                                        href={`/students/${s.id}`}
                                        className="hover:underline decoration-1 underline-offset-4 decoration-primary/30 transition-all"
                                    >
                                        {`${s.firstName} ${s.lastName}`}
                                    </a>
                                ),
                            }))}
                        />

                        <ResumeCard
                            title="Equipment"
                            icon={EquipmentIcon}
                            color="#a855f7"
                            data={
                                tableData.equipments && tableData.equipments.length > 0 // Use tableData.equipments
                                    ? tableData.equipments.map((e: any) => ({
                                          label: e.category || "Equipment",
                                          value: `${e.brand} ${e.model} (${e.size || "N/A"})`,
                                          isCapitalize: true,
                                      }))
                                    : [{ label: "Equipment", value: "None" }]
                            }
                        />

                        <ResumeCard
                            title="Payments"
                            icon={CreditIcon}
                            color="#71717a"
                            data={[
                                { label: "Gross Revenue", value: `${financials.studentRevenue} ${currency}` }, // Use financials
                                { label: "Teacher Comm.", value: `${financials.teacherEarnings.toFixed(2)} ${currency}` }, // Use financials
                                {
                                    label: "Net Profit",
                                    value: `${financials.profit.toFixed(2)} ${currency}`, // Use financials
                                    isStatusBadge: true,
                                },
                            ]}
                        />
                    </div>
                </section>

                <ChangeTheWindFooter showFooter={true} isStarting={false} getStartedUrl="/home" registerUrl="/" />
            </div>
        </TablesProvider>
    );
}

// --- Sub-components ---

function PerspectiveSection({
    title,
    subtitle,
    icon: Icon,
    bgColor,
    iconColor,
    viewingAs,
    children,
}: {
    title: string;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
    viewingAs?: { label: string; link: string };
    children: React.ReactNode;
}) {
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
                            <a
                                href={viewingAs.link}
                                className="text-foreground hover:underline decoration-1 underline-offset-4 decoration-primary/30 transition-all"
                            >
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

function ResumeCard({
    title,
    icon: Icon,
    color,
    data,
}: {
    title: string;
    icon: any;
    color: string;
    data: {
        label: string;
        value: string | number | null | undefined | React.ReactNode;
        isCapitalize?: boolean;
        isStatusBadge?: boolean;
    }[];
}) {
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
                            {item.isStatusBadge ? (
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] uppercase font-black tracking-tight">
                                    {item.value}
                                </span>
                            ) : (
                                <span className={item.isCapitalize ? "capitalize" : ""}>{item.value}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}