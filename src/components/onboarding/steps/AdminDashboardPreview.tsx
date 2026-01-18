"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SchoolIcon from "@/public/appSvgs/SchoolIcon";
import ClassboardIcon from "@/public/appSvgs/ClassboardIcon";
import { ENTITY_DATA } from "@/config/entities";
import { StatItemUI } from "@/backend/data/StatsData";
import { TransactionEventsTable } from "@/src/app/(admin)/(tables)/TransactionEventsTable";
import { TablesProvider } from "@/src/app/(admin)/(tables)/layout";
import { SchoolCredentialsProvider } from "@/src/providers/school-credentials-provider";
import TeacherClassDaily from "@/src/app/(admin)/classboard/TeacherClassDaily";
import { ClassboardContext } from "@/src/providers/classboard-provider";
import { TeacherQueue, type EventNode } from "@/backend/classboard/TeacherQueue";
import { GlobalFlag } from "@/backend/classboard/GlobalFlag";
import type { ClassboardData } from "@/backend/classboard/ClassboardModel";
import { useMemo } from "react";
import type { TransactionEventData } from "@/types/transaction-event";
import type { SchoolCredentials } from "@/types/credentials";

// --- Mock Data ---

const MOCK_CREDENTIALS: SchoolCredentials = {
    id: "school-001",
    logoUrl: "/school-logo.png",
    bannerUrl: "/school-banner.png",
    currency: "€",
    name: "Berkley Windsurf Academy",
    username: "berkley",
    status: "active",
    clerkId: "clerk-001",
    email: "info@berkleyacademy.com",
    country: "USA",
    timezone: "America/Los_Angeles",
};

// Shared data for integrity
const SHARED_MOCK_EVENTS = [
    {
        id: "evt-001",
        date: "2025-01-17T14:00:00",
        duration: 120,
        location: "Beach",
        status: "completed",
        teacher: { id: "teacher-001", username: "John" },
        studentName: "Alice Johnson",
        category: "kite",
        capacity: 2,
        pricePerStudent: 60,
        earnings: 40,
        revenue: 120,
    },
    {
        id: "evt-002",
        date: "2025-01-17T16:30:00",
        duration: 120,
        location: "Bay",
        status: "planned",
        teacher: { id: "teacher-001", username: "John" },
        studentName: "Bob Wilson",
        category: "kite",
        capacity: 2,
        pricePerStudent: 60,
        earnings: 40,
        revenue: 120,
    },
    {
        id: "evt-003",
        date: "2025-01-17T16:30:00",
        duration: 90,
        location: "Beach",
        status: "tbc",
        teacher: { id: "teacher-002", username: "Sarah" },
        studentName: "Charlie Brown",
        category: "wing",
        capacity: 1,
        pricePerStudent: 75,
        earnings: 35,
        revenue: 75,
    },
];

const MOCK_TRANSACTION_EVENTS: TransactionEventData[] = SHARED_MOCK_EVENTS.map((e) => ({
    event: {
        id: e.id,
        date: e.date + "Z",
        duration: e.duration,
        location: e.location,
        status: e.status as any,
    },
    teacher: e.teacher,
    leaderStudentName: e.studentName,
    studentCount: e.capacity,
    studentNames: [e.studentName],
    packageData: {
        description: `${e.category.toUpperCase()} Course`,
        pricePerStudent: e.pricePerStudent,
        durationMinutes: 480,
        categoryEquipment: e.category,
        capacityEquipment: e.capacity,
        capacityStudents: e.capacity,
    },
    financials: {
        teacherEarnings: e.earnings,
        studentRevenue: e.revenue,
        profit: e.revenue - e.earnings,
        currency: "€",
        commissionType: "fixed",
        commissionValue: 20,
    },
    equipments: [],
}));

// --- Helper to Create Mock Event Nodes ---

function createMockEventNode(e: (typeof SHARED_MOCK_EVENTS)[0]): EventNode {
    return {
        id: e.id,
        lessonId: `lesson-${e.id}`,
        bookingId: `booking-${e.id}`,
        bookingLeaderName: e.studentName,
        bookingStudents: [
            {
                id: `s-${e.id}`,
                firstName: e.studentName.split(" ")[0],
                lastName: e.studentName.split(" ")[1] || "",
                passport: "",
                country: "",
                phone: "",
            },
        ],
        capacityStudents: e.capacity,
        pricePerStudent: e.pricePerStudent,
        packageDuration: 480,
        categoryEquipment: e.category,
        capacityEquipment: e.capacity,
        commission: { type: "fixed", cph: 20 },
        eventData: { date: e.date, duration: e.duration, location: e.location, status: e.status as any },
        prev: null,
        next: null,
    };
}

// --- Mock Classboard Provider ---

function MockClassboardProvider({ children }: { children: React.ReactNode }) {
    const selectedDate = "2025-01-17";

    const teacherQueues = useMemo(() => {
        const q1 = new TeacherQueue({ id: "teacher-001", username: "John" });
        q1.syncEvents(SHARED_MOCK_EVENTS.filter((e) => e.teacher.username === "John").map(createMockEventNode));

        const q2 = new TeacherQueue({ id: "teacher-002", username: "Sarah" });
        q2.syncEvents(SHARED_MOCK_EVENTS.filter((e) => e.teacher.username === "Sarah").map(createMockEventNode));

        return [q1, q2];
    }, []);

    const bookingsForSelectedDate: ClassboardData[] = SHARED_MOCK_EVENTS.map((e) => ({
        booking: {
            id: `booking-${e.id}`,
            dateStart: selectedDate,
            dateEnd: selectedDate,
            leaderStudentName: e.studentName,
            status: "active",
        },
        schoolPackage: {
            categoryEquipment: e.category,
            capacityEquipment: e.capacity,
            capacityStudents: e.capacity,
            durationMinutes: 480,
            pricePerStudent: e.pricePerStudent,
        } as any,
        bookingStudents: [
            {
                student: { id: `s-${e.id}`, firstName: e.studentName.split(" ")[0], lastName: e.studentName.split(" ")[1] || "" },
            } as any,
        ],
        lessons: [
            {
                id: `lesson-${e.id}`,
                teacher: e.teacher,
                status: "active",
                commission: { id: "c1", type: "fixed", cph: "20" },
                events: [
                    {
                        id: e.id,
                        date: e.date,
                        duration: e.duration,
                        location: e.location,
                        status: e.status,
                    },
                ],
            },
        ],
    }));

    const globalFlag = useMemo(() => new GlobalFlag(teacherQueues, () => {}), [teacherQueues]);

    const contextValue = {
        classboardModel: bookingsForSelectedDate,
        bookingsForSelectedDate,
        teacherQueues,
        mounted: true,
        error: null,
        selectedDate,
        setSelectedDate: () => {},
        draggedBooking: null,
        setDraggedBooking: () => {},
        addLessonEvent: async () => {},
        deleteEvent: async () => {},
        updateEventStatus: async () => {},
        getEventCardStatus: () => undefined,
        globalFlag,
        setClassboardModel: () => {},
    };

    return <ClassboardContext.Provider value={contextValue as any}>{children}</ClassboardContext.Provider>;
}

export default function AdminDashboardPreview() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full mx-auto"
        >
            <div className="space-y-8">
                <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-3">
                        <SchoolIcon size={32} className="text-primary" />
                        <h2 className="text-3xl font-bold text-foreground tracking-tight">Homeboard</h2>
                    </div>
                </div>

                {/* Mock Dashboard Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl bg-card border border-border overflow-hidden"
                >
                    {/* Date Header */}
                    <div className="flex items-center justify-between p-5 bg-muted/20 border-b border-border cursor-default">
                        <div className="flex flex-col gap-1 min-w-[140px]">
                            <span className="font-bold text-xl">Fri 17 Jan</span>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">2025</span>
                        </div>

                        <div className="flex items-center gap-6 text-sm flex-1 justify-center">
                            <div>
                                <StatItemUI type="completed" value="1/3" hideLabel={false} />
                            </div>
                            <div>
                                <StatItemUI type="students" value={5} hideLabel={false} />
                            </div>
                            <div>
                                <StatItemUI type="teachers" value={2} hideLabel={false} />
                            </div>
                            <div>
                                <StatItemUI type="duration" value={330} hideLabel={false} />
                            </div>
                            <div className="hidden lg:block">
                                <StatItemUI type="revenue" value={315} hideLabel={false} />
                            </div>
                            <div className="hidden lg:block">
                                <StatItemUI type="commission" value={115} hideLabel={false} />
                            </div>
                        </div>

                        <div className="ml-4 shrink-0">
                            <ChevronDown size={20} className="text-muted-foreground/60" />
                        </div>
                    </div>

                    {/* Events Table */}
                    <SchoolCredentialsProvider credentials={MOCK_CREDENTIALS}>
                        <TablesProvider>
                            <TransactionEventsTable events={MOCK_TRANSACTION_EVENTS} />
                        </TablesProvider>
                    </SchoolCredentialsProvider>
                </motion.div>

                {/* Classboard Preview (Real Components) */}
                <div className="flex items-center justify-center gap-2 ">
                    <ClassboardIcon size={32} className="text-primary" />
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Classboard</h2>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl border border-border overflow-hidden bg-card"
                >
                    <SchoolCredentialsProvider credentials={MOCK_CREDENTIALS}>
                        <MockClassboardProvider>
                            <div className="h-[650px]">
                                <TeacherClassDaily />
                            </div>
                        </MockClassboardProvider>
                    </SchoolCredentialsProvider>
                </motion.div>
            </div>
        </motion.div>
    );
}
