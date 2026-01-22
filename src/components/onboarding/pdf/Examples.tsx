"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import ClassboardIcon from "@/public/appSvgs/ClassboardIcon";
import { TransactionEventsTable } from "@/src/app/(admin)/(tables)/TransactionEventsTable";
import { TablesProvider } from "@/src/app/(admin)/(tables)/layout";
import { SchoolCredentialsProvider } from "@/src/providers/school-credentials-provider";
import TeacherClassCard from "@/src/app/(admin)/classboard/TeacherClassCard";
import EventCard from "@/src/app/(admin)/classboard/EventCard";
import { ClassboardContext } from "@/src/providers/classboard-provider";
import { TeacherQueue, type EventNode } from "@/backend/classboard/TeacherQueue";
import { GlobalFlag } from "@/backend/classboard/GlobalFlag";
import type { ClassboardData } from "@/backend/classboard/ClassboardModel";
import { useMemo } from "react";
import type { TransactionEventData } from "@/types/transaction-event";
import type { SchoolCredentials } from "@/types/credentials";
import { TeacherEventCard } from "@/src/app/(users)/teacher/[id]/events/TeacherEventCard";
import { EventStudentCard } from "@/src/components/events/EventStudentCard";

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
        id: "evt-002",
        date: "2025-01-17T10:00:00",
        duration: 120, // 2h
        location: "Los Lances",
        status: "completed",
        teacher: { id: "teacher-001", username: "Agustin", firstName: "Agustin", lastName: "" },
        studentNames: ["Robert Jynosky", "Charlie"],
        category: "kite",
        capacity: 2,
        packageDescription: "Semi-Private",
        packageTotal: 400,   // €50/h * 8h package
        packageHours: 8,
        pricePerStudent: 50, // €50/h
        earnings: 42,        // €21/h * 2h
        revenue: 200,        // €50/h * 2h * 2 students
    },
    {
        id: "evt-001",
        date: "2025-01-17T14:00:00",
        duration: 150, // 2h 30m
        location: "Balneario",
        status: "planned",
        teacher: { id: "teacher-001", username: "Agustin", firstName: "Agustin", lastName: "" },
        studentNames: ["Ivy Stones"],
        category: "kite",
        capacity: 1,
        packageDescription: "Zero to Hero",
        packageTotal: 600,   // €75/h * 8h package
        packageHours: 8,
        pricePerStudent: 75, // €75/h
        earnings: 52.5,      // €21/h * 2.5h
        revenue: 187.5,      // €75/h * 2.5h
    }
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
    leaderStudentName: e.studentNames[0],
    studentCount: e.studentNames.length,
    studentNames: e.studentNames,
    packageData: {
        description: e.packageDescription,
        pricePerStudent: e.packageTotal,
        durationMinutes: e.packageHours * 60,
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
        commissionValue: 21,
    },
    equipments: Array(e.capacity).fill(null).map((_, i) => ({
        id: `eq-${e.id}-${i}`,
        name: `North Reach ${i === 0 ? '10' : '12'}`,
        category: "kite",
        status: "active",
        brand: "North",
        model: "Reach",
        size: i === 0 ? "10" : "12",
    })),
}));

// --- Helper to Create Mock Event Nodes ---

function createMockEventNode(e: (typeof SHARED_MOCK_EVENTS)[0]): EventNode {
    return {
        id: e.id,
        lessonId: `lesson-${e.id}`,
        bookingId: `booking-${e.id}`,
        bookingLeaderName: e.studentNames[0],
        bookingStudents: e.studentNames.map((name, i) => ({
            id: `s-${e.id}-${i}`,
            firstName: name.split(" ")[0],
            lastName: name.split(" ").slice(1).join(" ") || "",
            passport: "",
            country: "",
            phone: "",
        })),
        capacityStudents: e.capacity,
        pricePerStudent: e.packageTotal,
        packageDuration: e.packageHours * 60,
        categoryEquipment: e.category,
        capacityEquipment: e.capacity,
        commission: { type: "fixed", cph: 21 },
        eventData: { date: e.date, duration: e.duration, location: e.location, status: e.status as any },
        prev: null,
        next: null,
    };
}

// --- Mock Classboard Provider ---

function MockClassboardProvider({ children, teacherQueues }: { children: React.ReactNode, teacherQueues: TeacherQueue[] }) {
    const selectedDate = "2025-01-17";

    const bookingsForSelectedDate: ClassboardData[] = SHARED_MOCK_EVENTS.map((e) => ({
        booking: {
            id: `booking-${e.id}`,
            dateStart: selectedDate,
            dateEnd: selectedDate,
            leaderStudentName: e.studentNames[0],
            status: "active",
        },
        schoolPackage: {
            categoryEquipment: e.category,
            capacityEquipment: e.capacity,
            capacityStudents: e.capacity,
            durationMinutes: e.packageHours * 60,
            pricePerStudent: e.packageTotal,
        } as any,
        bookingStudents: e.studentNames.map((name, i) => ({
            student: { id: `s-${e.id}-${i}`, firstName: name.split(" ")[0], lastName: name.split(" ").slice(1).join(" ") || "" },
        } as any)),
        lessons: [
            {
                id: `lesson-${e.id}`,
                teacher: e.teacher,
                status: "active",
                commission: { id: "c1", type: "fixed", cph: "21" },
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

    const globalFlag = useMemo(() => new GlobalFlag(teacherQueues, () => { }), [teacherQueues]);

    const contextValue = {
        classboardModel: bookingsForSelectedDate,
        bookingsForSelectedDate,
        teacherQueues,
        mounted: true,
        error: null,
        selectedDate,
        setSelectedDate: () => { },
        draggedBooking: null,
        setDraggedBooking: () => { },
        addLessonEvent: async () => { },
        deleteEvent: async () => { },
        updateEventStatus: async () => { },
        getEventCardStatus: () => undefined,
        globalFlag,
        setClassboardModel: () => { },
    };

    return <ClassboardContext.Provider value={contextValue as any}>{children}</ClassboardContext.Provider>;
}

function AdminSection({
    teacherQueues,
    queue,
    events,
}: {
    teacherQueues: TeacherQueue[];
    queue: TeacherQueue;
    events: EventNode[];
}) {
    return (
        <div className="space-y-4">
            {/* Events Table (No container/header) */}
       
            <SchoolCredentialsProvider credentials={MOCK_CREDENTIALS}>
                <TablesProvider>
                    <TransactionEventsTable events={MOCK_TRANSACTION_EVENTS} />
                </TablesProvider>
            </SchoolCredentialsProvider>

            {/* Classboard Preview (No container/header) */}
            <SchoolCredentialsProvider credentials={MOCK_CREDENTIALS}>
                <MockClassboardProvider teacherQueues={teacherQueues}>
                    <div className="space-y-3">

                        <div className="w-full flex ml-4">
                            <div className="flex-shrink-0 w-[340px] pr-4  ">
                                <TeacherClassCard
                                    queue={queue}
                                    viewMode="expanded"
                                    hasChanges={false}
                                />
                            </div>
                            <div className="flex-1 min-w-0 pl-4 overflow-hidden">
                                <div className="flex items-center gap-4">
                                    {events.map((event) => (
                                        <div key={event.id} className="w-[320px] flex-shrink-0">
                                            <EventCard
                                                event={event}
                                                showLocation={true}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </MockClassboardProvider>
            </SchoolCredentialsProvider>
        </div>
    );
}

function UsersSection({
    userViewEvent,
    queue
}: {
    userViewEvent: EventNode | undefined;
    queue: TeacherQueue;
}) {
    return (
        <div className="space-y-2">
            <SchoolCredentialsProvider credentials={MOCK_CREDENTIALS}>
                <div>
                    {/* Table Header */}
                    <div className="grid grid-cols-2 border-b-2 border-border">
                        <div className="py-3 pl-6 pr-3 border-r-2 border-border">
                            <div className="flex items-center gap-2 text-foreground/90">
                                <div className="p-2 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20" style={{ color: "#22c55e" }}>
                                    <HeadsetIcon size={24} />
                                </div>
                                <h3 className="font-bold text-lg leading-tight tracking-tight">Teacher</h3>
                            </div>
                        </div>
                        <div className="py-3 pl-6 pr-3">
                            <div className="flex items-center gap-2 text-foreground/90">
                                <div className="p-2 rounded-lg bg-[#eab308]/10 border border-[#eab308]/20" style={{ color: "#eab308" }}>
                                    <HelmetIcon size={24} />
                                </div>
                                <h3 className="font-bold text-lg leading-tight tracking-tight">Student</h3>
                            </div>
                        </div>
                    </div>

                    {/* Table Body with Event Cards */}
                    <div className="grid grid-cols-2">
                        {userViewEvent && (
                            <>
                                <div className="p-4 border-r-2 border-border">
                                    <TeacherEventCard
                                        event={userViewEvent}
                                        currency="€"
                                    />
                                </div>
                                <div className="p-4">
                                    <EventStudentCard
                                        teacherName={queue.teacher.username}
                                        location={userViewEvent.eventData.location}
                                        date={userViewEvent.eventData.date}
                                        duration={userViewEvent.eventData.duration}
                                        categoryEquipment={userViewEvent.categoryEquipment}
                                        capacityEquipment={userViewEvent.capacityEquipment}
                                        packageDescription="Zero to Hero"
                                        pricePerHour={75}
                                        status={userViewEvent.eventData.status}
                                        schoolLogo={null}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </SchoolCredentialsProvider>
        </div>
    );
}

export function Examples() {
    const teacherQueues = useMemo(() => {
        const q1 = new TeacherQueue({ id: "teacher-001", username: "Agustin" });
        const sortedEvents = [...SHARED_MOCK_EVENTS]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        q1.syncEvents(sortedEvents.map(createMockEventNode));
        return [q1];
    }, []);

    const queue = teacherQueues[0];
    const events = queue.getAllEvents();
    const userViewEvent = events.find(e => e.id === "evt-001");

    return (
        <section className="mb-8">
            <h2 className="text-xl font-bold uppercase mb-6 text-primary border-b border-border pb-1">
                Examples
            </h2>

            <div className="space-y-8">
                <AdminSection teacherQueues={teacherQueues} queue={queue} events={events} />
                <UsersSection userViewEvent={userViewEvent} queue={queue} />
            </div>
        </section>
    );
}
