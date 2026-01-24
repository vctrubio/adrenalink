"use client";

import { BackgroundImage } from "@/src/components/BackgroundImage";
import IntoAdrBarShell from "@/src/components/IntoAdrBarShell";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { ENTITY_DATA } from "@/config/entities";

const pricingTiers = [
    {
        name: "Blue",
        price: "50",
        features: ["Cap of 3 teachers", "Unlimited lessons + bookings", "As many packages and requests as needed"],
        borderColor: "border-blue-500",
        priceTagBg: "bg-blue-500",
        dividerColor: "bg-blue-500",
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
        allEntityIds: [
            "student",
            "schoolPackage",
            "studentPackage",
            "booking",
            "teacher",
            "event",
            "rental",
            "student_lesson_feedback",
            "payment",
        ],
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
        allEntityIds: [
            "student",
            "schoolPackage",
            "studentPackage",
            "booking",
            "teacher",
            "event",
            "rental",
            "student_lesson_feedback",
            "payment",
            "equipment",
            "repairs",
            "referral",
        ],
        uniqueEntityIds: ["equipment", "repairs", "referral"],
        includesFrom: "Silver",
    },
];

function PricingCard({ tier }: { tier: (typeof pricingTiers)[0] }) {
    const uniqueEntities = ENTITY_DATA.filter((entity) => tier.uniqueEntityIds.includes(entity.id));
    const inheritedEntityIds = tier.allEntityIds.filter((id) => !tier.uniqueEntityIds.includes(id));
    const inheritedEntities = ENTITY_DATA.filter((entity) => inheritedEntityIds.includes(entity.id));

    return (
        <div
            className={`relative bg-zinc-900/80 backdrop-blur-md rounded-2xl p-8 border-2 ${tier.borderColor} transition-all duration-300 hover:scale-105 flex flex-col overflow-hidden`}
        >
            <div className="absolute -top-2 -right-2">
                <div className={`${tier.priceTagBg} px-6 py-3 rounded-bl-2xl rounded-tr-xl shadow-xl`}>
                    <p className="text-2xl font-bold text-white whitespace-nowrap">{tier.price}€/month</p>
                </div>
            </div>

            <div className="flex-1">
                <h3 className="text-4xl font-bold text-white mb-6 pr-24">{tier.name}</h3>
                <div className={`h-1 w-20 ${tier.dividerColor} rounded-full mb-6`} />

                <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                        <li key={index} className="text-white text-lg">
                            • {feature}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="pt-6 border-t border-white/10">
                {inheritedEntities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 justify-center">
                        {inheritedEntities.map((entity) => {
                            const IconComponent = entity.icon;
                            return (
                                <div
                                    key={entity.id}
                                    className="w-6 h-6 flex items-center justify-center"
                                    style={{ color: entity.color }}
                                >
                                    <IconComponent className="w-5 h-5" />
                                </div>
                            );
                        })}
                    </div>
                )}

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
            <BackgroundImage
                src="/kritaps_ungurs_unplash/3tiers.jpg"
                position="fixed"
                overlay="linear-gradient(to bottom, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.7) 50%, rgba(15, 23, 42, 0.9) 100%)"
            />

            <IntoAdrBarShell
                inverted
                onBarClick="/"
                leftSlot={
                    <Image
                        src="/ADR.webp"
                        alt="Adrenalink"
                        width={28}
                        height={28}
                        className="w-8 h-8 object-contain brightness-0 invert"
                    />
                }
                rightSlot={
                    <div className="flex items-center gap-2 text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                }
            />

            <div className="relative z-[2] min-h-screen py-20 px-4 pt-32">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pricingTiers.map((tier) => (
                            <PricingCard key={tier.name} tier={tier} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
