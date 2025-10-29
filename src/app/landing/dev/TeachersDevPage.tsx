"use client";

import { ENTITY_DATA, type EntityConfig } from "@/config/entities";
import { GridEntityDev } from "./GridEntityDev";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon.jsx";
import LessonIcon from "@/public/appSvgs/LessonIcon.jsx";

const entityTeacher: EntityConfig = {
    id: "teacher",
    name: "Teachers",
    icon: HeadsetIcon,
    color: "text-green-500",
    bgColor: "bg-green-300",
    hoverColor: "#d1fae5",
    link: "/teachers",
    description: ["Our employees, each has commission rates for lessons.", "Payments are used to track earnings."],
    relations: ["commission", "lesson", "equipment"],
};

const entityCommission: EntityConfig = {
    id: "commission",
    name: "Commissions",
    icon: HandshakeIcon,
    color: "text-emerald-500",
    bgColor: "bg-emerald-300",
    hoverColor: "#d1fae5",
    link: "/commissions",
    description: ["Defines commission rates for teachers.", "Can be percentage or fixed amount."],
    relations: ["teacher"],
};

const entityLesson: EntityConfig = {
    id: "lesson",
    name: "Lessons",
    icon: LessonIcon,
    color: "text-metal-700",
    bgColor: "bg-metal-400",
    hoverColor: "#e0e7ff",
    link: "/lessons",
    description: ["Represents a scheduled lesson.", "Links teacher, booking, and commission."],
    relations: ["student", "teacher", "event"],
};

export function TeachersDevPage() {
    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <entityTeacher.icon className="w-12 h-12" style={{ color: entityTeacher.color.replace("text-", "") }} />
                    <h1 className="text-5xl font-bold text-foreground">Team Building</h1>
                </div>
                <p className="text-muted-foreground text-lg">Build Your Team</p>
            </div>

            <GridEntityDev entityA={entityTeacher} entityB={entityCommission} entityC={entityLesson} description="Create teachers, give them commission based salaries, and appoint them to lessons for planning." />
        </div>
    );
}
