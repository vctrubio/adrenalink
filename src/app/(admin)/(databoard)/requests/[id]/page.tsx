import Link from "next/link";
import { getEntityId } from "@/actions/id-actions";
import { EntityDetailLayout } from "@/src/components/layouts/EntityDetailLayout";
import { ENTITY_DATA } from "@/config/entities";
import { formatDate } from "@/getters/date-getter";
import type { StudentPackageModel } from "@/backend/models";
import { EntityInfoCard } from "@/src/components/cards/EntityInfoCard";

const STATUS_COLORS: Record<string, string> = {
    requested: "#f59e0b",
    accepted: "#10b981",
    rejected: "#ef4444",
};

interface PackageDetailsProps {
    schoolPackage: any;
}

function PackageDetails({ schoolPackage }: PackageDetailsProps) {
    if (!schoolPackage) return null;

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Package Details</h2>
            <div className="space-y-3">
                <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">{schoolPackage.name}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium text-foreground">{schoolPackage.description || "No description"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium text-foreground">{schoolPackage.durationMinutes} min</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium text-foreground">${schoolPackage.pricePerStudent}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface StudentListProps {
    students: any[];
}

function StudentList({ students }: StudentListProps) {
    if (students.length === 0) return null;

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Students</h2>
            <div className="space-y-2">
                {students.map((sps) => (
                    <Link
                        key={sps.id}
                        href={`/students/${sps.student.id}`}
                        className="block border-l-2 border-primary pl-3 hover:bg-accent/50 transition-colors py-2 rounded-r"
                    >
                        <p className="font-medium text-foreground text-sm">
                            {sps.student.firstName} {sps.student.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{sps.student.passport}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

interface StatusCardProps {
    status: string;
    statusColor: string;
    requestedDateStart: string;
    requestedDateEnd: string;
}

function StatusCard({ status, statusColor, requestedDateStart, requestedDateEnd }: StatusCardProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Request Status</h2>
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-muted-foreground mb-2">Current Status</p>
                    <div
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold"
                        style={{
                            backgroundColor: `${statusColor}20`,
                            color: statusColor,
                        }}
                    >
                        {status.toUpperCase()}
                    </div>
                </div>
                <div className="border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground">Requested Period</p>
                    <p className="text-lg font-bold text-foreground mt-1">
                        {formatDate(requestedDateStart)} - {formatDate(requestedDateEnd)}
                    </p>
                </div>
            </div>
        </div>
    );
}

interface BookingsCardProps {
    bookings: any[];
}

function BookingsCard({ bookings }: BookingsCardProps) {
    if (!bookings || bookings.length === 0) return null;

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Bookings</h2>
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
                </div>
            </div>
        </div>
    );
}

interface FinancialCardProps {
    stats?: {
        money_in?: number;
        money_out?: number;
    };
}

function FinancialCard({ stats }: FinancialCardProps) {
    if (!stats) return null;

    const moneyIn = stats.money_in || 0;
    const moneyOut = stats.money_out || 0;
    const netRevenue = moneyIn - moneyOut;

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Financial</h2>
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-muted-foreground">Income</p>
                    <p className="text-xl font-bold text-green-600">${moneyIn}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Expenses</p>
                    <p className="text-xl font-bold text-red-600">${moneyOut}</p>
                </div>
                <div className="border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground">Net Revenue</p>
                    <p
                        className="text-xl font-bold"
                        style={{
                            color: netRevenue >= 0 ? "#10b981" : "#ef4444",
                        }}
                    >
                        ${netRevenue}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
    const result = await getEntityId("studentPackage", params.id);

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: {result.error}</div>
            </div>
        );
    }

    const request = result.data as StudentPackageModel;
    const requestEntity = ENTITY_DATA.find((e) => e.id === "studentPackage")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;

    const statusColor = STATUS_COLORS[request.schema.status] || "#6b7280";
    const packageName = request.relations?.schoolPackage?.name || "Unknown Package";
    const students = request.relations?.studentPackageStudents || [];
    const bookings = request.relations?.bookings || [];

    return (
        <EntityDetailLayout
            leftColumn={
                <>
                    <EntityInfoCard
                        entity={{
                            id: requestEntity.id,
                            name: packageName,
                            icon: requestEntity.icon,
                            color: requestEntity.color,
                            bgColor: requestEntity.bgColor,
                        }}
                        status={`Status: ${request.schema.status}`}
                        stats={[
                            {
                                icon: studentEntity.icon,
                                label: "Students",
                                value: students.length,
                                color: studentEntity.color,
                            },
                            {
                                icon: bookingEntity.icon,
                                label: "Bookings",
                                value: bookings.length,
                                color: bookingEntity.color,
                            },
                        ]}
                        fields={[
                            {
                                label: "Package",
                                value: packageName,
                            },
                            {
                                label: "Status",
                                value: request.schema.status,
                            },
                            {
                                label: "Requested Start",
                                value: formatDate(request.schema.requestedDateStart),
                            },
                            {
                                label: "Requested End",
                                value: formatDate(request.schema.requestedDateEnd),
                            },
                            {
                                label: "Created",
                                value: formatDate(request.schema.createdAt),
                            },
                            {
                                label: "Last Updated",
                                value: formatDate(request.schema.updatedAt),
                            },
                        ]}
                        accentColor={requestEntity.color}
                    />

                    <PackageDetails schoolPackage={request.relations?.schoolPackage} />

                    <StudentList students={students} />
                </>
            }
            rightColumn={
                <>
                    <StatusCard
                        status={request.schema.status}
                        statusColor={statusColor}
                        requestedDateStart={request.schema.requestedDateStart}
                        requestedDateEnd={request.schema.requestedDateEnd}
                    />

                    <BookingsCard bookings={bookings} />

                    <FinancialCard stats={request.stats} />
                </>
            }
        />
    );
}
