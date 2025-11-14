import { EntityInfoCard } from "@/src/components/cards/EntityInfoCard";
import { ENTITY_DATA } from "@/config/entities";
import { mockStudents } from "@/drizzle/mocks/v1";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import { formatDate } from "@/getters/date-getter";

export default function MockCardsPage() {
    // Get entity configs
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;

    // Get mock data
    const mockStudent = mockStudents[0];

    // Student stats (booking count, event count, event duration)
    const studentStats = [
        {
            icon: BookingIcon,
            label: "Bookings",
            value: 12,
            color: "#3b82f6",
        },
        {
            icon: FlagIcon,
            label: "Events",
            value: 8,
            color: "#10b981",
        },
        {
            icon: DurationIcon,
            label: "Hours",
            value: 24,
            color: "#f59e0b",
        },
    ];

    // Student fields from schema
    const studentFields = [
        { label: "Passport", value: mockStudent.passport },
        { label: "Country", value: mockStudent.country },
        { label: "Phone", value: mockStudent.phone },
        { label: "Joined", value: new Date(mockStudent.createdAt).toLocaleDateString() },
    ];

    // Teacher stats (lesson count, event count, event hours)
    const teacherStats = [
        {
            icon: LessonIcon,
            label: "Lessons",
            value: 45,
            color: "#8b5cf6",
        },
        {
            icon: FlagIcon,
            label: "Events",
            value: 18,
            color: "#06b6d4",
        },
        {
            icon: DurationIcon,
            label: "Hours",
            value: 120,
            color: "#ec4899",
        },
    ];

    // Teacher fields (mock data since we don't have teachers in v1.ts)
    const teacherFields = [
        { label: "Specialty", value: "Surfing" },
        { label: "Experience", value: "5 years" },
        { label: "Rating", value: "4.8/5.0" },
        { label: "Active Since", value: "Jan 2020" },
    ];

    // Booking stats (events count, duration hours, revenue)
    const bookingStats = [
        {
            icon: FlagIcon,
            label: "Events",
            value: 3,
            color: "#10b981",
        },
        {
            icon: DurationIcon,
            label: "Hours",
            value: 3,
            color: "#4b5563",
        },
        {
            icon: BankIcon,
            label: "Revenue",
            value: 250,
            color: "#10b981",
        },
    ];

    // Booking fields - disabled since mockBooking not available
    const bookingFields = [
        { label: "Status", value: "pending" },
        { label: "Start", value: "N/A" },
        { label: "End", value: "N/A" },
        { label: "Created", value: "N/A" },
    ];

    return (
        <div className="min-h-screen p-8">
            <h1 className="text-4xl font-bold text-center mb-12">MockEntityCard Playground</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
                {/* Student Card */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-center">Student Example</h2>
                    <EntityInfoCard
                        entity={{
                            id: studentEntity.id,
                            name: mockStudent.name,
                            icon: studentEntity.icon,
                            color: studentEntity.color,
                            bgColor: studentEntity.bgColor,
                        }}
                        status="Active Student"
                        stats={studentStats as [any, any, any]}
                        fields={studentFields}
                        accentColor="#eab308"
                    />
                </div>

                {/* Teacher Card */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-center">Teacher Example</h2>
                    <EntityInfoCard
                        entity={{
                            id: teacherEntity.id,
                            name: "Sarah Johnson",
                            icon: teacherEntity.icon,
                            color: teacherEntity.color,
                            bgColor: teacherEntity.bgColor,
                        }}
                        status="Senior Instructor"
                        stats={teacherStats as [any, any, any]}
                        fields={teacherFields}
                        accentColor="#10b981"
                    />
                </div>

                {/* Booking Card */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-center">Booking Example</h2>
                    <EntityInfoCard
                        entity={{
                            id: bookingEntity.id,
                            name: "Booking abc12345",
                            icon: bookingEntity.icon,
                            color: bookingEntity.color,
                            bgColor: bookingEntity.bgColor,
                        }}
                        status="pending"
                        stats={bookingStats as [any, any, any]}
                        fields={bookingFields}
                        accentColor="#3b82f6"
                    />
                </div>
            </div>
        </div>
    );
}
