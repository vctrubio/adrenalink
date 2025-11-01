"use client";

import { useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import Link from "next/link";
import { ENTITY_DATA } from "@/config/entities";

const pricingTiers = [
    {
        name: "Blue",
        price: "50",
        features: ["Cap of 3 teachers", "Unlimited lessons"],
        borderColor: "border-blue-500",
        priceTagBg: "bg-blue-500",
        dividerColor: "bg-blue-500",
        entityIds: ["student", "schoolPackage", "studentPackage", "booking", "lesson", "event"],
        uniqueEntityIds: ["student", "schoolPackage", "studentPackage", "booking", "teacher", "event"],
    },
    {
        name: "Silver",
        price: "100",
        features: ["Unlimited teachers", "Unlimited lessons", "Rentals"],
        borderColor: "border-gray-400",
        priceTagBg: "bg-gray-400",
        dividerColor: "bg-gray-400",
        entityIds: ["student", "schoolPackage", "studentPackage", "booking", "lesson", "event", "rental", "student_lesson_feedback"],
        uniqueEntityIds: ["rental", "student_lesson_feedback", "payment"],
        includesFrom: "Blue",
    },
    {
        name: "Gold",
        price: "200",
        features: ["Everything from Silver", "Equipment tracking"],
        borderColor: "border-yellow-500",
        priceTagBg: "bg-yellow-500",
        dividerColor: "bg-yellow-500",
        entityIds: ["student", "schoolPackage", "studentPackage", "booking", "lesson", "event", "rental", "student_lesson_feedback", "equipment", "repairs"],
        uniqueEntityIds: ["equipment", "repairs"],
        includesFrom: "Silver",
    },
];

const onboardingSteps = [
    {
        title: "1 week of 1-on-1s",
        description: "Before we set you up, we feed you videos and unlimited 1-on-1 sessions to help you get started.",
        icon: "💬",
    },
    {
        title: "Integration support",
        description: "Use the app fully during onboarding. Ask questions anytime as we help you integrate into your school.",
        icon: "🔧",
    },
    {
        title: "60 days free trial",
        description: "Try Adrenalink completely free for 60 days. No credit card required. Cancel anytime.",
        icon: "🎁",
    },
];

function PricingCard({ tier }: { tier: (typeof pricingTiers)[0] }) {
    const uniqueEntities = ENTITY_DATA.filter((entity) => tier.uniqueEntityIds.includes(entity.id));

    return (
        <div className={`relative bg-slate-800/80 backdrop-blur-md rounded-2xl p-8 border-2 ${tier.borderColor} transition-all duration-300 hover:scale-105 flex flex-col overflow-hidden`}>
            {/* Price Tag - Top Right Corner */}
            <div className="absolute -top-2 -right-2">
                <div className={`${tier.priceTagBg} px-6 py-3 rounded-bl-2xl rounded-tr-xl shadow-xl`}>
                    <p className="text-2xl font-bold text-white whitespace-nowrap">{tier.price}€/month</p>
                </div>
            </div>

            <div className="flex-1">
                <h3 className="text-4xl font-bold text-white mb-6 pr-24">{tier.name}</h3>

                {/* Colored Divider */}
                <div className={`h-1 w-20 ${tier.dividerColor} rounded-full mb-6`} />

                <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                        <li key={index} className="text-white text-lg">
                            • {feature}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Entity Icons Footer - Shows only NEW icons this tier adds */}
            <div className="pt-6 border-t border-white/10">
                {tier.includesFrom && <p className="text-xs text-white/40 mb-3 text-center">+ Everything from {tier.includesFrom}</p>}
                <div className="grid grid-cols-3 gap-3 opacity-60">
                    {uniqueEntities.map((entity) => {
                        const IconComponent = entity.icon;
                        return (
                            <div key={entity.id} className="flex flex-col items-center gap-1">
                                <div className="w-10 h-10 flex items-center justify-center">
                                    <IconComponent className={`w-8 h-8 ${entity.color}`} />
                                </div>
                                <span className="text-[10px] text-center text-white/60 leading-tight">{entity.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function OnboardingBook() {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
                    {/* Left Side - Navigation */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-10 border-r border-slate-300 dark:border-slate-700">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Onboarding Process</h2>
                        </div>

                        <nav className="space-y-3">
                            {onboardingSteps.map((step, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveStep(index)}
                                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${activeStep === index ? "bg-white dark:bg-slate-900 shadow-lg scale-105" : "hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl">{step.icon}</span>
                                        <div className="flex-1">
                                            <h3 className={`font-semibold ${activeStep === index ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>{step.title}</h3>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </nav>

                        <div className="mt-8 pt-8 border-t border-slate-300 dark:border-slate-700">
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">You may use the app fully during onboarding. It's meant for you to ask questions during this period.</p>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="bg-white dark:bg-slate-900 p-10">
                        <div className="h-full flex flex-col">
                            <div className="flex-1">
                                <div className="text-6xl mb-6">{onboardingSteps[activeStep].icon}</div>
                                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">{onboardingSteps[activeStep].title}</h2>
                                <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed">{onboardingSteps[activeStep].description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <div className="min-h-screen relative">
            {/* Background Image */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: "url(/kritaps_ungurs_unplash/3tiers.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            {/* Gradient Overlay */}
            <div
                className="fixed inset-0 z-[1]"
                style={{
                    background: "linear-gradient(to bottom, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.7) 50%, rgba(15, 23, 42, 0.9) 100%)",
                }}
            />

            <div className="relative z-[2] min-h-screen py-20 px-4">
                {/* Tabs */}
                <TabGroup>
                    <TabList className="flex gap-4 mb-16 justify-center max-w-md mx-auto">
                        <Tab className="flex-1 px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-200 data-[selected]:bg-white/20 data-[selected]:backdrop-blur-md data-[selected]:shadow-xl data-[hover]:bg-white/10 bg-white/5 backdrop-blur-sm">
                            Onboarding
                        </Tab>
                        <Tab className="flex-1 px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-200 data-[selected]:bg-white/20 data-[selected]:backdrop-blur-md data-[selected]:shadow-xl data-[hover]:bg-white/10 bg-white/5 backdrop-blur-sm">
                            Pricing
                        </Tab>
                    </TabList>

                    <TabPanels>
                        {/* Onboarding Panel */}
                        <TabPanel>
                            <OnboardingBook />
                        </TabPanel>

                        {/* Pricing Panel */}
                        <TabPanel>
                            <div className="max-w-7xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {pricingTiers.map((tier) => (
                                        <PricingCard key={tier.name} tier={tier} />
                                    ))}
                                </div>
                            </div>
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </div>
        </div>
    );
}
