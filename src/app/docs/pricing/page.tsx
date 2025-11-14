"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { ENTITY_DATA } from "@/config/entities";
import { OnboardingBook } from "./OnboardingBook";

const pricingTiers = [
    {
        name: "Blue",
        price: "50",
        features: ["Cap of 3 teachers", "Unlimited lessond + bookings", "As many packages and request as needed"],
        borderColor: "border-blue-500",
        priceTagBg: "bg-blue-500",
        dividerColor: "bg-blue-500",
        entityIds: ["student", "schoolPackage", "studentPackage", "booking", "teacher", "event"],
        allEntityIds: ["student", "schoolPackage", "studentPackage", "booking", "teacher", "event"],
        uniqueEntityIds: ["student", "schoolPackage", "studentPackage", "booking", "teacher", "event"],
    },
    {
        name: "Silver",
        price: "100",
        features: ["Unlimited teachers", "Unlimited lessons", "Rentals"],
        borderColor: "border-gray-400",
        priceTagBg: "bg-gray-400",
        dividerColor: "bg-gray-400",
        entityIds: ["student", "schoolPackage", "studentPackage", "booking", "teacher", "event", "rental", "student_lesson_feedback"],
        allEntityIds: ["student", "schoolPackage", "studentPackage", "booking", "teacher", "event", "rental", "student_lesson_feedback", "payment"],
        uniqueEntityIds: ["rental", "student_lesson_feedback", "payment"],
        includesFrom: "Blue",
    },
    {
        name: "Gold",
        price: "200",
        features: ["Everything from Silver", "Equipment tracking", "Know where your bookings originate from"],
        borderColor: "border-yellow-500",
        priceTagBg: "bg-yellow-500",
        dividerColor: "bg-yellow-500",
        entityIds: ["student", "schoolPackage", "studentPackage", "booking", "teacher", "event", "rental", "student_lesson_feedback", "equipment", "repairs", "referral"],
        allEntityIds: ["student", "schoolPackage", "studentPackage", "booking", "teacher", "event", "rental", "student_lesson_feedback", "payment", "equipment", "repairs", "referral"],
        uniqueEntityIds: ["equipment", "repairs", "referral"],
        includesFrom: "Silver",
    },
];

function PricingCard({ tier }: { tier: (typeof pricingTiers)[0] }) {
    const uniqueEntities = ENTITY_DATA.filter((entity) => tier.uniqueEntityIds.includes(entity.id));

    // Get inherited entities (everything except unique ones)
    const inheritedEntityIds = tier.allEntityIds.filter((id) => !tier.uniqueEntityIds.includes(id));
    const inheritedEntities = ENTITY_DATA.filter((entity) => inheritedEntityIds.includes(entity.id));

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

            {/* Entity Icons Footer */}
            <div className="pt-6 border-t border-white/10">
                {/* Inherited icons - small, one line, no names */}
                {inheritedEntities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 justify-center">
                        {inheritedEntities.map((entity) => {
                            const IconComponent = entity.icon;
                            return (
                                <div key={entity.id} className="w-6 h-6 flex items-center justify-center" style={{ color: entity.color }}>
                                    <IconComponent className="w-5 h-5" />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Unique icons - BIG with names */}
                <div className="grid grid-cols-3 gap-3">
                    {uniqueEntities.map((entity) => {
                        const IconComponent = entity.icon;
                        return (
                            <div key={entity.id} className="flex flex-col items-center gap-1">
                                <div className="w-10 h-10 flex items-center justify-center" style={{ color: entity.color }}>
                                    <IconComponent className="w-8 h-8" />
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
