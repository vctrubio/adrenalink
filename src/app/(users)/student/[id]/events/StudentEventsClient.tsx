"use client";

import { useMemo } from "react";
import { useStudentUser } from "@/src/providers/student-user-provider";
import { EventStudentCard } from "@/src/components/events/EventStudentCard";

export function StudentEventsClient() {
    const { data: studentUser, currency } = useStudentUser();

    // Filter events (show planned, tbc, and completed)
    const visibleEvents = useMemo(() => {
        return studentUser.events.filter((event) => ["planned", "tbc", "completed"].includes(event.status));
    }, [studentUser.events]);

    // Sort events by date (upcoming/recent first)
    const sortedEvents = useMemo(() => {
        return [...visibleEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [visibleEvents]);

    // Group events by date
    const eventsByDate = useMemo(() => {
        const groups = new Map<string, typeof sortedEvents>();

        sortedEvents.forEach((event) => {
            const dateStr = new Date(event.date).toISOString().split("T")[0];
            if (!groups.has(dateStr)) {
                groups.set(dateStr, []);
            }
            groups.get(dateStr)!.push(event);
        });

        return Array.from(groups.entries()).map(([date, events]) => ({ date, events }));
    }, [sortedEvents]);

    if (visibleEvents.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                No scheduled events found.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">My Schedule</h2>
                <div className="text-sm text-muted-foreground">{visibleEvents.length} scheduled events</div>
            </div>

            {eventsByDate.map(({ date, events }) => {
                const dateObj = new Date(date + "T00:00:00");
                const formattedDate = dateObj.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });

                return (
                    <div key={date} className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{formattedDate}</h3>
                            <div className="flex-1 h-px bg-border/30" />
                        </div>

                        <div className="space-y-3">
                            {events.map((event) => {
                                const teacherName = event.teacher.firstName && event.teacher.lastName
                                    ? `${event.teacher.firstName} ${event.teacher.lastName}`
                                    : event.teacher.username;

                                return (
                                    <EventStudentCard
                                        key={event.id}
                                        teacherName={teacherName}
                                        location={event.location}
                                        date={event.date}
                                        duration={event.duration}
                                        categoryEquipment={event.packageDetails.categoryEquipment}
                                        capacityEquipment={event.packageDetails.capacityEquipment}
                                        packageDescription={event.packageDetails.description}
                                        pricePerHour={event.packageDetails.pricePerHour}
                                        status={event.status}
                                        schoolLogo={null}
                                    />
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
