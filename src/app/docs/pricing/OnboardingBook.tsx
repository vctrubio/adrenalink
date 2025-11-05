"use client";

import { useState } from "react";
import { InstructionDevPage } from "@/src/components/onboarding/InstructionDevPage";
import { SchoolDevPage } from "@/src/components/onboarding/SchoolDevPage";
import { TeachersDevPage } from "@/src/components/onboarding/TeachersDevPage";
import { StudentDevPage } from "@/src/components/onboarding/StudentDevPage";
import { EventDevPage } from "@/src/components/onboarding/EventDevPage";
import { StatisticDevPage } from "@/src/components/onboarding/StatisticDevPage";
import { EntityDevPage } from "@/src/components/onboarding/EntityDevPage";
import OpenBookIcon from "@/public/appSvgs/OpenBookIcon";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import PyramidIcon from "@/public/appSvgs/PyramidIcon";
import { Calendar, ChartColumnDecreasing } from "lucide-react";

const onboardingSteps = [
    {
        id: "instructions",
        title: "Introduction",
        subtitle: "Sign up",
        icon: OpenBookIcon,
        iconColor: "text-blue-500",
        iconBgColor: "bg-blue-100",
        component: InstructionDevPage,
    },
    {
        id: "schools",
        title: "Schools",
        subtitle: "Setting up",
        icon: AdminIcon,
        iconColor: "text-indigo-500",
        iconBgColor: "bg-indigo-100",
        component: SchoolDevPage,
    },
    {
        id: "teachers",
        title: "Teachers",
        subtitle: "Define your team",
        icon: HeadsetIcon,
        iconColor: "text-green-500",
        iconBgColor: "bg-green-100",
        component: TeachersDevPage,
    },
    {
        id: "students",
        title: "Students",
        subtitle: "Registrations & requests",
        icon: HelmetIcon,
        iconColor: "text-yellow-500",
        iconBgColor: "bg-yellow-100",
        component: StudentDevPage,
    },
    {
        id: "events",
        title: "Events",
        subtitle: "Create lessons with ease",
        icon: Calendar,
        iconColor: "text-purple-500",
        iconBgColor: "bg-purple-100",
        component: EventDevPage,
    },
    {
        id: "revenue",
        title: "Revenue",
        subtitle: "Monitor performance",
        icon: ChartColumnDecreasing,
        iconColor: "text-sand-500",
        iconBgColor: "bg-sand-100",
        component: StatisticDevPage,
    },
    {
        id: "entities",
        title: "All Entities",
        subtitle: "Recap of everything",
        icon: PyramidIcon,
        iconColor: "text-gray-500",
        iconBgColor: "bg-gray-100",
        component: EntityDevPage,
    },
];

export function OnboardingBook() {
    const [activeStep, setActiveStep] = useState(0);

    const currentStep = onboardingSteps[activeStep];
    const StepComponent = currentStep.component;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 max-h-[845px]">
                    {/* Left Side - Navigation */}
                    <div className="bg-slate-800 p-10 border-r border-slate-700 flex flex-col">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-4">Onboarding Process</h2>
                        </div>

                        <nav className="space-y-3">
                            {onboardingSteps.map((step, index) => {
                                const StepIcon = step.icon;
                                return (
                                    <button key={index} onClick={() => setActiveStep(index)} className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${activeStep === index ? "bg-slate-900 shadow-lg scale-105" : "hover:bg-slate-700"}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.iconBgColor}`}>
                                                <StepIcon className={`w-6 h-6 ${step.iconColor}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-semibold ${activeStep === index ? "text-white" : "text-slate-300"}`}>{step.title}</h3>
                                                <p className="text-xs text-slate-400">{step.subtitle}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="mt-8 pt-8 border-t border-slate-700">
                            <p className="text-sm text-slate-400 italic">
                                Before we set you up, 1 week prior starts our onboarding. We feed you videos, and have direct contact with the team to assist you. - Yes you may use the app during the onboarding process, it is meant for you to ask questions during this
                                period.
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="bg-slate-900 p-10 overflow-y-auto">
                        <StepComponent />
                    </div>
                </div>
            </div>
        </div>
    );
}
