"use client";

import { ENTITY_DATA } from "@/config/entities";
import { GridEntityDev } from "./GridEntityDev";

const entityStudent = ENTITY_DATA.find((e) => e.id === "student")!;
const entitySchoolPackage = ENTITY_DATA.find((e) => e.id === "studentPackage")!;
const entityBooking = ENTITY_DATA.find((e) => e.id === "booking")!;

export function StudentDevPage() {
    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <entityStudent.icon className="w-12 h-12" style={{ color: entityStudent.color.replace("text-", "") }} />
                    <h1 className="text-5xl font-bold text-foreground">Student Enrollment</h1>
                </div>
                <p className="text-muted-foreground text-lg">Welcome Riders</p>
            </div>

            <GridEntityDev entityA={entityStudent} entityB={entitySchoolPackage} entityC={entityBooking} description="Students register to your site, request a package, and seamlessly create a booking." />
        </div>
    );
}
