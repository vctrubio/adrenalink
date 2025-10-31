import { ENTITY_DATA, type EntityConfig } from "./entities";
import OctagonIcon from "../public/appSvgs/OctagonIcon.jsx";

// users dont need to know about this.
export const HIDDEN_ENTITIES: EntityConfig[] = [
    {
        id: "school_students",
        name: "School Students",
        icon: OctagonIcon,
        color: "text-amber-600",
        bgColor: "bg-amber-400",
        link: "/schools",
        description: ["Manages the relationship between schools and students."],
        relations: ["school", "student"],
    },
    {
        id: "booking_student",
        name: "Students Bookings",
        icon: OctagonIcon,
        color: "text-blue-500",
        bgColor: "bg-blue-300",
        link: "/bookings",
        description: ["Links students to specific bookings."],
        relations: ["booking", "student"],
    },
    {
        id: "equipment_event",
        name: "Equipment Events",
        icon: OctagonIcon,
        color: "text-sky-500",
        bgColor: "bg-sky-300",
        link: "/events?equipment=true",
        description: ["Assigns specific equipment to scheduled events."],
        relations: ["equipment", "event"],
    },
    {
        id: "teacher_equipment",
        name: "Equipment Permissions",
        icon: OctagonIcon,
        color: "text-teal-500",
        bgColor: "bg-teal-300",
        link: "/permissions",
        description: ["Links teachers to specific equipment."],
        relations: ["teacher", "equipment"],
    },
];

export const TABLE_CONFIG: EntityConfig[] = [...ENTITY_DATA, ...HIDDEN_ENTITIES];
