"use client";

import { ENTITY_DATA, type EntityConfig } from "@/config/entities";
import { GridEntityDev } from "./GridEntityDev";
import { Globe } from "lucide-react";
import AdminIcon from "@/public/appSvgs/AdminIcon.jsx";

const entitySchool: EntityConfig = {
    id: "school",
    name: "Schools",
    icon: AdminIcon,
    color: "text-indigo-500",
    bgColor: "bg-indigo-300",
    link: "/schools",
    description: ["Central entity that organizes all activities.", "Contains teachers, packages, and bookings."],
    relations: ["schoolPackage", "student", "teacher", "booking", "equipment"],
};

const entitySubdomain: EntityConfig = {
    id: "subdomain",
    name: "Subdomain",
    icon: Globe,
    color: "text-sky-500",
    bgColor: "bg-sky-300",
    link: "/subdomain",
    description: ["School subdomain for public access.", "Students book through this portal."],
    relations: ["school"],
};

const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");

const entityPackage: EntityConfig = {
    id: "schoolPackage",
    name: "Packages",
    icon: packageEntity ? packageEntity.icon : (() => null),
    color: "text-orange-400",
    bgColor: "bg-orange-200",
    link: "/packages",
    description: ["Determines duration, capacity, and equipment for bookings.", "Defines pricing and availability."],
    relations: ["school", "booking"],
};

export function SchoolDevPage() {
    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <entitySchool.icon className="w-12 h-12" style={{ color: entitySchool.color.replace("text-", "") }} />
                    <h1 className="text-5xl font-bold text-foreground">School Setup</h1>
                </div>
                <p className="text-muted-foreground text-lg">Sign Up</p>
            </div>

            <GridEntityDev entityA={entitySchool} entityB={entitySubdomain} entityC={entityPackage} description="School sets up account." />
        </div>
    );
}
