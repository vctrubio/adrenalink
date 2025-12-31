"use client";

// Icons & Nav
import { ENTITY_DATA } from "@/config/entities";
import { Users } from "lucide-react";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon.jsx";
import SchoolIcon from "@/public/appSvgs/SchoolIcon.jsx";
import ClassboardIcon from "@/public/appSvgs/ClassboardIcon.jsx";
import TableIcon from "@/public/appSvgs/TableIcon.jsx";
import { WindToggle } from "@/src/components/themes/WindToggle";

// Data Components
import { StudentRow } from "@/src/components/databoard/rows/StudentRow";
import ClassboardStatistics from "@/src/app/(admin)/(classboard)/ClassboardStatisticsComponennt";
import EventCard from "@/src/app/(admin)/(classboard)/classboard/EventCard";
import { EventStudentCard } from "@/src/portals/EventStudentCard";
import { EventTeacherCard } from "@/src/portals/EventTeacherCard";

// Types for Mock Data
import type { DailyLessonStats } from "@/src/app/(admin)/(classboard)/ClassboardStatistics";
import type { TeacherQueue } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { EventNode } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { StudentModel } from "@/backend/models";

// MOCK DATA
const entitiesWithIcons = ENTITY_DATA.filter((entity) => entity.icon && ["student", "teacher", "booking"].includes(entity.id));

const designRoutes = [
    { id: "profile", name: "Profile", icon: AdranlinkIcon },
    { id: "statistics", name: "Statistics", icon: SchoolIcon },
    { id: "classboard", name: "Classboard", icon: ClassboardIcon },
    { id: "datarows", name: "Data Rows", icon: TableIcon },
    { id: "checkin", name: "Check In", icon: Users },
];

const mockStudentModel = {
    schema: {
        id: "s1",
        firstName: "John",
        lastName: "Doe",
        passport: "P12345",
        country: "USA",
        phone: "123-456-7890",
        languages: ["English"],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    updateForm: {
        active: true,
    },
    relations: {
        schoolStudents: [],
        bookingStudents: [],
    },
} as unknown as StudentModel;

const mockStats: DailyLessonStats = {
    teacherCount: 3,
    studentCount: 5,
    eventCount: 10,
    durationCount: 1200, // 20 hours in minutes
    revenue: {
        commission: 500,
        revenue: 1000,
        profit: 500,
    },
};

const mockTeacherQueues: TeacherQueue[] = [];

const mockEvent: EventNode = {
    id: "evt1",
    eventData: {
        id: "evt1",
        schoolId: "sch1",
        lessonId: "les1",
        date: new Date().toISOString(),
        duration: 120,
        location: "Admin Beach",
        status: "completed",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    studentData: [{ id: "s1", firstName: "Admin", lastName: "User" }],
    packageData: {
        categoryEquipment: "wing",
        capacityEquipment: 1,
    },
    teacherData: {
        id: "t1",
        firstName: "Sys",
        lastName: "Admin",
    },
};

export default function DesignPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
            {/* Theme Toggle - Absolute Right */}
            <div className="absolute top-6 right-6 z-50 bg-card/80 backdrop-blur-md rounded-xl border border-border shadow-lg">
                <WindToggle compact={true} />
            </div>

            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-12 text-slate-800 dark:text-slate-100">Adrenalink Design System</h1>

                {/* Theme Color Palette */}
                <div className="mt-6">
                    <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-4">Theme Colors</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="rounded-lg p-4 bg-background text-foreground shadow-sm">
                            <div className="font-medium">Background</div>
                            <div className="text-xs opacity-80">bg-background • text-foreground</div>
                        </div>
                        <div className="rounded-lg p-4 bg-card text-card-foreground shadow-sm">
                            <div className="font-medium">Card</div>
                            <div className="text-xs opacity-80">bg-card • text-card-foreground</div>
                        </div>
                        <div className="rounded-lg p-4 bg-muted text-muted-foreground shadow-sm">
                            <div className="font-medium">Muted</div>
                            <div className="text-xs opacity-80">bg-muted • text-muted-foreground</div>
                        </div>
                        <div className="rounded-lg p-4 bg-primary text-primary-foreground shadow-sm">
                            <div className="font-medium">Primary</div>
                            <div className="text-xs opacity-80">bg-primary • text-primary-foreground</div>
                        </div>
                        <div className="rounded-lg p-4 bg-secondary text-secondary-foreground shadow-sm">
                            <div className="font-medium">Secondary</div>
                            <div className="text-xs opacity-80">bg-secondary • text-secondary-foreground</div>
                        </div>
                        <div className="rounded-lg p-4 bg-foreground text-background shadow-sm">
                            <div className="font-medium">Foreground</div>
                            <div className="text-xs opacity-80">bg-foreground • text-background</div>
                        </div>
                    </div>
                </div>

                {/* Entity Icon Section */}
                <div className="mt-16">
                    <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-6">Entity Icons</h2>
                    <div className="flex justify-center gap-12 bg-white p-6 rounded-lg">
                        {entitiesWithIcons.map((entity) => {
                            const Icon = entity.icon;
                            if (!Icon) return null;
                            return (
                                <div key={entity.id} className="flex flex-col items-center space-y-2">
                                    <div style={{ color: entity.color }}>
                                        <Icon size={48} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">{entity.name}</h3>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Route Section */}
                <div className="mt-16">
                    <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-6">Route Component</h2>
                    <div className="flex justify-center gap-12 bg-white p-6 rounded-lg">
                        {designRoutes.map((route) => {
                            const Icon = route.icon;
                            return (
                                <div key={route.id} className="flex flex-col items-center space-y-2">
                                    <div className="text-secondary">
                                        <Icon size={48} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">{route.name}</h3>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Data Display Section */}
                <div className="mt-16">
                    <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-6">Data Display</h2>

                    <div className="space-y-12">
                        <div>
                            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-4">Row</h3>
                            <div className="bg-white p-6 rounded-lg">
                                <StudentRow item={mockStudentModel} isExpanded={false} onToggle={() => { }} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-4">Statistics</h3>
                            <div className="bg-white p-6 rounded-lg">
                                <ClassboardStatistics stats={mockStats} teacherQueues={mockTeacherQueues} totalBookings={5} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-4">Cards</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div>
                                    <h4 className="font-medium text-center mb-2">Student</h4>
                                    <EventStudentCard
                                        teacherName="Alex Smith"
                                        location="Main Beach"
                                        date={new Date().toISOString()}
                                        duration={120}
                                        capacity={2}
                                        packageDescription="A two-hour kite lesson for beginners."
                                        pricePerHour={50}
                                        status="planned"
                                        categoryEquipment="kite"
                                        capacityEquipment={2}
                                    />
                                </div>
                                <div>
                                    <h4 className="font-medium text-center mb-2">Teacher</h4>
                                    <EventTeacherCard
                                        students={["Jane Doe", "Peter Jones"]}
                                        location="Main Beach"
                                        date={new Date().toISOString()}
                                        duration={120}
                                        capacity={2}
                                        packageDescription="A two-hour kite lesson for beginners."
                                        pricePerHour={50}
                                        status="planned"
                                        categoryEquipment="kite"
                                        capacityEquipment={2}
                                    />
                                </div>
                                <div>
                                    <h4 className="font-medium text-center mb-2">Admin (Event)</h4>
                                    <EventCard event={mockEvent} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
