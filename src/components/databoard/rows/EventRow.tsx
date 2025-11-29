"use client";

import { Row, type StatItem } from "@/src/components/ui/row";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { ENTITY_DATA } from "@/config/entities";
import { getPrettyDuration } from "@/getters/duration-getter";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import type { EventModel } from "@/backend/models";

export function calculateEventGroupStats(events: EventModel[]): StatItem[] {
  const totalMinutes = events.reduce((sum, event) => sum + event.schema.duration, 0);

  // Calculate total school revenue
  let totalRevenue = 0;
  events.forEach((event) => {
    const booking = event.relations?.lesson?.booking;
    const studentPackage = booking?.studentPackage;
    const schoolPackage = studentPackage?.schoolPackage;
    const bookingStudents = booking?.bookingStudents || [];

    if (schoolPackage && schoolPackage.pricePerStudent) {
      // Revenue = price per student * number of students
      const studentCount = bookingStudents.length || 1; // At least 1 if no booking students
      totalRevenue += schoolPackage.pricePerStudent * studentCount;
    }
  });

  return [
    { icon: <DurationIcon className="w-5 h-5" />, value: getPrettyDuration(totalMinutes), label: "Duration", color: "#4b5563" },
    { icon: <HeadsetIcon className="w-5 h-5" />, value: `$${totalRevenue.toFixed(2)}`, label: "Revenue", color: "#10b981" },
  ];
}

interface EventRowProps {
    item: EventModel;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

export const EventRow = ({ item: eventData, isExpanded, onToggle }: EventRowProps) => {
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;

    const EventIcon = eventEntity.icon;
    const entityColor = eventEntity.color;
    const iconColor = isExpanded ? entityColor : "#9ca3af";

    const teacher = eventData.relations?.lesson?.teacher;
    const eventDate = new Date(eventData.schema.date);
    const formattedDate = eventDate.toLocaleDateString();
    const formattedTime = eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const strItems = [
        { label: "Date", value: formattedDate },
        { label: "Time", value: formattedTime },
        { label: "Location", value: eventData.schema.location || "Not specified" },
        { label: "Status", value: eventData.schema.status },
        { label: "Duration", value: `${eventData.schema.duration} minutes` },
    ];

    const stats: StatItem[] = [
        { icon: <DurationIcon className="w-5 h-5" />, value: getPrettyDuration(eventData.schema.duration), color: "#4b5563" },
        teacher ? { icon: <HeadsetIcon className="w-5 h-5" />, value: teacher.username, color: teacherEntity.color } : null,
    ].filter(Boolean) as StatItem[];

    return (
        <Row
            id={eventData.schema.id}
            entityData={eventData}
            entityBgColor={eventEntity.bgColor}
            entityColor={eventEntity.color}
            isExpanded={isExpanded}
            onToggle={onToggle}
            head={{
                avatar: (
                    <div style={{ color: iconColor }}>
                        <EventIcon className="w-10 h-10" />
                    </div>
                ),
                name: (
                    <HoverToEntity entity={eventEntity} id={eventData.schema.id}>
                        {formattedDate} - {formattedTime}
                    </HoverToEntity>
                ),
                status: eventData.schema.status,
            }}
            str={{
                label: "Details",
                items: strItems,
            }}
            action={null}
            popover={null}
            stats={stats}
        />
    );
};
