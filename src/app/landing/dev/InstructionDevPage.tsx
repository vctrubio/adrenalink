"use client";

import { ENTITY_DATA } from "@/config/entities";
import { InstructionHeader } from "./InstructionHeader";
import { DevCard } from "./DevCard";
import { useState } from "react";
import { ChartColumnDecreasing } from "lucide-react";

export function InstructionDevPage() {
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

    const getEntity = (id: string) => ENTITY_DATA.find((e) => e.id === id);

    const school = getEntity("school");
    const schoolPackage = getEntity("schoolPackage");
    const equipment = getEntity("equipment");
    const teacher = getEntity("teacher");
    const commission = getEntity("commission");
    const student = getEntity("student");
    const studentPackage = getEntity("studentPackage");
    const booking = getEntity("booking");
    const lesson = getEntity("lesson");
    const event = getEntity("event");
    const feedback = getEntity("feedback");

    const statistic = {
        id: "statistic",
        name: "Statistics",
        icon: ChartColumnDecreasing,
        color: "text-sand-500",
        bgColor: "bg-sand-300",
        hoverColor: "#cccbf1",
        link: "/statistics",
        description: ["Track key metrics and performance indicators.", "Monitor revenue, bookings, and student progress."],
        relations: ["booking", "events", "equipment"],
    };

    return (
        <div>
            <InstructionHeader icon={school!.icon} title="Sign Up" subtitle="Early Bird" bgColor="bg-indigo-50 dark:bg-indigo-950/20" iconColor="text-indigo-500" iconBgColor="bg-indigo-300">
                <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                    {school && (
                        <DevCard
                            entity={school}
                            isSelected={selectedEntity === school.id}
                            isHovered={hoveredEntity === school.id}
                            isRelated={false}
                            onClick={() => setSelectedEntity(selectedEntity === school.id ? null : school.id)}
                            onMouseEnter={() => setHoveredEntity(school.id)}
                            onMouseLeave={() => setHoveredEntity(null)}
                        />
                    )}
                </div>
            </InstructionHeader>

            <InstructionHeader icon={schoolPackage!.icon} title="Set Up Your Operations" subtitle="Create Packages" bgColor="bg-orange-50 dark:bg-orange-950/20" iconColor="text-orange-500" iconBgColor="bg-orange-300">
                <div className="grid grid-cols-2 gap-4">
                    {[schoolPackage, equipment].map((entity) => {
                        if (!entity) return null;
                        return (
                            <DevCard
                                key={entity.id}
                                entity={entity}
                                isSelected={selectedEntity === entity.id}
                                isHovered={hoveredEntity === entity.id}
                                isRelated={false}
                                onClick={() => setSelectedEntity(selectedEntity === entity.id ? null : entity.id)}
                                onMouseEnter={() => setHoveredEntity(entity.id)}
                                onMouseLeave={() => setHoveredEntity(null)}
                            />
                        );
                    })}
                </div>
            </InstructionHeader>

            <InstructionHeader icon={teacher!.icon} title="Build Your Team" subtitle="Hire Teachers" bgColor="bg-green-50 dark:bg-green-950/20" iconColor="text-green-500" iconBgColor="bg-green-300">
                <div className="grid grid-cols-2 gap-4">
                    {[teacher, commission].map((entity) => {
                        if (!entity) return null;
                        return (
                            <DevCard
                                key={entity.id}
                                entity={entity}
                                isSelected={selectedEntity === entity.id}
                                isHovered={hoveredEntity === entity.id}
                                isRelated={false}
                                onClick={() => setSelectedEntity(selectedEntity === entity.id ? null : entity.id)}
                                onMouseEnter={() => setHoveredEntity(entity.id)}
                                onMouseLeave={() => setHoveredEntity(null)}
                            />
                        );
                    })}
                </div>
            </InstructionHeader>

            <InstructionHeader icon={student!.icon} title="Student Enrollment" subtitle="Welcome Riders" bgColor="bg-yellow-50 dark:bg-yellow-950/20" iconColor="text-yellow-500" iconBgColor="bg-yellow-300">
                <div className="grid grid-cols-2 gap-4">
                    {[student, studentPackage].map((entity) => {
                        if (!entity) return null;
                        return (
                            <DevCard
                                key={entity.id}
                                entity={entity}
                                isSelected={selectedEntity === entity.id}
                                isHovered={hoveredEntity === entity.id}
                                isRelated={false}
                                onClick={() => setSelectedEntity(selectedEntity === entity.id ? null : entity.id)}
                                onMouseEnter={() => setHoveredEntity(entity.id)}
                                onMouseLeave={() => setHoveredEntity(null)}
                            />
                        );
                    })}
                </div>
            </InstructionHeader>

            <InstructionHeader icon={booking!.icon} title="Booking & Lesson Planning" subtitle="Schedule Sessions" bgColor="bg-blue-50 dark:bg-blue-950/20" iconColor="text-blue-500" iconBgColor="bg-blue-300">
                <div className="grid grid-cols-2 gap-4">
                    {[booking, lesson].map((entity) => {
                        if (!entity) return null;
                        return (
                            <DevCard
                                key={entity.id}
                                entity={entity}
                                isSelected={selectedEntity === entity.id}
                                isHovered={hoveredEntity === entity.id}
                                isRelated={false}
                                onClick={() => setSelectedEntity(selectedEntity === entity.id ? null : entity.id)}
                                onMouseEnter={() => setHoveredEntity(entity.id)}
                                onMouseLeave={() => setHoveredEntity(null)}
                            />
                        );
                    })}
                </div>
            </InstructionHeader>

            <InstructionHeader icon={equipment!.icon} title="Daily Operations" subtitle="Track & Improve" bgColor="bg-purple-50 dark:bg-purple-950/20" iconColor="text-purple-500" iconBgColor="bg-purple-300">
                <div className="grid grid-cols-2 gap-4">
                    {[event, equipment].map((entity) => {
                        if (!entity) return null;
                        return (
                            <DevCard
                                key={entity.id}
                                entity={entity}
                                isSelected={selectedEntity === entity.id}
                                isHovered={hoveredEntity === entity.id}
                                isRelated={false}
                                onClick={() => setSelectedEntity(selectedEntity === entity.id ? null : entity.id)}
                                onMouseEnter={() => setHoveredEntity(entity.id)}
                                onMouseLeave={() => setHoveredEntity(null)}
                            />
                        );
                    })}
                </div>
            </InstructionHeader>

            <InstructionHeader icon={feedback!.icon} title="Analytics & Revenue" subtitle="Monitor Performance" bgColor="" iconColor="text-sand-600 dark:text-sand-400" iconBgColor="bg-sand-300 dark:bg-sand-700">
                <div className="grid grid-cols-2 gap-4">
                    {[feedback, statistic].map((entity) => {
                        if (!entity) return null;
                        return (
                            <DevCard
                                key={entity.id}
                                entity={entity}
                                isSelected={selectedEntity === entity.id}
                                isHovered={hoveredEntity === entity.id}
                                isRelated={false}
                                onClick={() => setSelectedEntity(selectedEntity === entity.id ? null : entity.id)}
                                onMouseEnter={() => setHoveredEntity(entity.id)}
                                onMouseLeave={() => setHoveredEntity(null)}
                            />
                        );
                    })}
                </div>
            </InstructionHeader>
        </div>
    );
}
