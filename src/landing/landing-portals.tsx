"use client";

import { useState, useEffect } from "react";
import AdminIcon from "../../public/appSvgs/AdminIcon";
import HelmetIcon from "../../public/appSvgs/HelmetIcon";
import HeadsetIcon from "../../public/appSvgs/HeadsetIcon";
import FlagIcon from "../../public/appSvgs/FlagIcon";
import AdranlinkIcon from "../../public/appSvgs/AdranlinkIcon";
import { AnimatedCanvas } from "./animated-canvas";

type RoleType = "student" | "teacher" | "lesson" | "school" | null;

const ROLE_CONFIGS = {
    student: {
        id: "student",
        label: "Students",
        Icon: HelmetIcon,
        color: "#eab308",
        tailwindBg: "bg-yellow-500",
        tailwindText: "text-yellow-500",
        tailwindBorder: "border-yellow-500",
        tailwindConnection: "text-yellow-500",
        title: "Find Your Adventure",
        description: "Book lessons and track your progress",
    },
    teacher: {
        id: "teacher",
        label: "Teachers",
        Icon: HeadsetIcon,
        color: "#22c55e",
        tailwindBg: "bg-green-500",
        tailwindText: "text-green-500",
        tailwindBorder: "border-green-500",
        tailwindConnection: "text-green-500",
        title: "Teach Your Passion",
        description: "Manage schedules and earnings",
    },
    lesson: {
        id: "lesson",
        label: "Lessons",
        Icon: FlagIcon,
        color: "#06b6d4",
        tailwindBg: "bg-cyan-500",
        tailwindText: "text-cyan-500",
        tailwindBorder: "border-cyan-500",
        tailwindConnection: "text-cyan-500",
        title: "Connect & Learn",
        description: "Where students meet teachers",
    },
    school: {
        id: "school",
        label: "School",
        Icon: AdminIcon,
        color: "#6366f1",
        tailwindBg: "bg-indigo-500",
        tailwindText: "text-indigo-500",
        tailwindBorder: "border-indigo-500",
        tailwindConnection: "text-indigo-500",
        title: "Automate Operations",
        description: "One platform for everything",
    },
};

export function LandingPortals() {
    const [hoveredRole, setHoveredRole] = useState<RoleType>(null);
    const [logoVisible, setLogoVisible] = useState(false);

    useEffect(() => {
        // Trigger logo animation on mount
        const timer = setTimeout(() => setLogoVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const showLessonActive = hoveredRole === "student" || hoveredRole === "teacher" || hoveredRole === "school";

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-full max-w-5xl px-4">
                {/* Centered Adrenalink Logo - Always visible in center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
                    <div
                        className={`
                            transition-all duration-[3000ms] ease-out
                            ${logoVisible ? "opacity-20 scale-100" : "opacity-0 scale-50"}
                        `}
                    >
                        <AdranlinkIcon className="text-white/30" size={450} />
                    </div>
                </div>

                {/* Portal Container - Positioned relative to center */}
                <div className="relative h-[550px]">
                    {/* Connection Lines SVG */}
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none z-0"
                        viewBox="0 0 400 450"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <defs>
                            {/* Gradient for Student-Teacher connection through Lesson */}
                            <linearGradient id="studentTeacherGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: ROLE_CONFIGS.student.color, stopOpacity: 0.6 }} />
                                <stop offset="100%" style={{ stopColor: ROLE_CONFIGS.teacher.color, stopOpacity: 0.6 }} />
                            </linearGradient>
                        </defs>

                        {/* Student to School */}
                        {hoveredRole === "student" && (
                            <line
                                x1="80"
                                y1="400"
                                x2="200"
                                y2="80"
                                stroke="url(#studentTeacherGradient)"
                                strokeWidth="3"
                                className="opacity-60 animate-pulse"
                                strokeDasharray="8 8"
                            />
                        )}
                        {/* Student to Lesson - with gradient */}
                        {hoveredRole === "student" && (
                            <line
                                x1="80"
                                y1="400"
                                x2="200"
                                y2="300"
                                stroke="url(#studentTeacherGradient)"
                                strokeWidth="3"
                                className="opacity-60 animate-pulse"
                                strokeDasharray="8 8"
                            />
                        )}
                        {/* Teacher to School */}
                        {hoveredRole === "teacher" && (
                            <line
                                x1="320"
                                y1="400"
                                x2="200"
                                y2="80"
                                stroke="url(#studentTeacherGradient)"
                                strokeWidth="3"
                                className="opacity-60 animate-pulse"
                                strokeDasharray="8 8"
                            />
                        )}
                        {/* Teacher to Lesson - with gradient */}
                        {hoveredRole === "teacher" && (
                            <line
                                x1="320"
                                y1="400"
                                x2="200"
                                y2="300"
                                stroke="url(#studentTeacherGradient)"
                                strokeWidth="3"
                                className="opacity-60 animate-pulse"
                                strokeDasharray="8 8"
                            />
                        )}
                        {/* School to Student - with gradient */}
                        {hoveredRole === "school" && (
                            <line
                                x1="200"
                                y1="80"
                                x2="80"
                                y2="400"
                                stroke="url(#studentTeacherGradient)"
                                strokeWidth="3"
                                className="opacity-60 animate-pulse"
                                strokeDasharray="8 8"
                            />
                        )}
                        {/* School to Teacher - with gradient */}
                        {hoveredRole === "school" && (
                            <line
                                x1="200"
                                y1="80"
                                x2="320"
                                y2="400"
                                stroke="url(#studentTeacherGradient)"
                                strokeWidth="3"
                                className="opacity-60 animate-pulse"
                                strokeDasharray="8 8"
                            />
                        )}
                    </svg>

                    {/* School Portal - Top */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
                        onMouseEnter={() => setHoveredRole("school")}
                        onMouseLeave={() => setHoveredRole(null)}
                    >
                        <div className="flex flex-col items-center gap-3 cursor-pointer">
                            <div className="p-6">
                                <div style={{ color: ROLE_CONFIGS.school.color }}>
                                    <AdminIcon className="h-12 w-12" />
                                </div>
                            </div>
                            <span className="text-lg font-bold text-white whitespace-nowrap">{ROLE_CONFIGS.school.label}</span>
                        </div>
                    </div>

                    {/* Lesson Portal - Lower Position (Always visible, unhoverable, no border) */}
                    <div className="absolute top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative" style={{ width: "200px", height: "200px" }}>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6">
                                    <div
                                        className="transition-colors duration-300"
                                        style={{
                                            color: showLessonActive ? ROLE_CONFIGS.lesson.color : "#6b7280",
                                        }}
                                    >
                                        <FlagIcon className="h-12 w-12" />
                                    </div>
                                </div>
                                {/* Animated Canvas in front of Lesson - appears on hover */}
                                {showLessonActive && (
                                    <AnimatedCanvas
                                        className="absolute inset-0 w-full h-full pointer-events-none"
                                        style={{ zIndex: 20 }}
                                    />
                                )}
                            </div>
                            <span className="text-lg font-bold text-white whitespace-nowrap">{ROLE_CONFIGS.lesson.label}</span>
                        </div>
                    </div>

                    {/* Student Portal - Bottom Left */}
                    <div
                        className="absolute bottom-0 left-[10%] md:left-[15%] z-10"
                        onMouseEnter={() => setHoveredRole("student")}
                        onMouseLeave={() => setHoveredRole(null)}
                    >
                        <div className="flex flex-col items-center gap-3 cursor-pointer">
                            <div className="p-6">
                                <div style={{ color: ROLE_CONFIGS.student.color }}>
                                    <HelmetIcon className="h-12 w-12" />
                                </div>
                            </div>
                            <span className="text-lg font-bold text-white whitespace-nowrap">{ROLE_CONFIGS.student.label}</span>
                        </div>
                    </div>

                    {/* Teacher Portal - Bottom Right */}
                    <div
                        className="absolute bottom-0 right-[10%] md:right-[15%] z-10"
                        onMouseEnter={() => setHoveredRole("teacher")}
                        onMouseLeave={() => setHoveredRole(null)}
                    >
                        <div className="flex flex-col items-center gap-3 cursor-pointer">
                            <div className="p-6">
                                <div style={{ color: ROLE_CONFIGS.teacher.color }}>
                                    <HeadsetIcon className="h-12 w-12" />
                                </div>
                            </div>
                            <span className="text-lg font-bold text-white whitespace-nowrap">{ROLE_CONFIGS.teacher.label}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
