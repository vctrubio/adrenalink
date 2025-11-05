"use client";

import { type EntityConfig } from "@/config/entities";
import { GridEntityDev } from "./GridEntityDev";
import { ChartColumnDecreasing } from "lucide-react";
import LinkIcon from "@/public/appSvgs/LinkIcon.jsx";
import BankIcon from "@/public/appSvgs/BankIcon.jsx";
import CreditIcon from "@/public/appSvgs/CreditIcon.jsx";

const entityBank: EntityConfig = {
    id: "bank",
    name: "Revenue",
    icon: BankIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-300",
    link: "/bank",
    description: ["Financial institution.", "Manages payments and revenue."],
    relations: ["payment", "revenue"],
};

const entityPayment: EntityConfig = {
    id: "payment",
    name: "Payments",
    icon: CreditIcon,
    color: "text-sand-600",
    bgColor: "bg-sand-200",
    link: "/payments",
    description: ["Records payments made to teachers.", "Tracks teacher earnings and compensation."],
    relations: ["teacher", "lesson"],
};

const entityRef: EntityConfig = {
    id: "referral",
    name: "Referrals",
    icon: LinkIcon,
    color: "text-gray-200",
    bgColor: "bg-gray-100",
    link: "/referrals",
    description: ["Tracks referral codes and their associated commissions."],
    relations: ["school", "student_package"],
};

export function StatisticDevPage() {
    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <ChartColumnDecreasing className="w-12 h-12 text-sand-500" />
                    <h1 className="text-5xl font-bold text-foreground">Financial Analytics</h1>
                </div>
                <p className="text-muted-foreground text-lg">Revenue & Payments</p>
            </div>

            <GridEntityDev entityA={entityBank} entityB={entityRef} entityC={entityPayment} description="See your money flow, who you have to pay = students package - teacher commission - referrals = revenue (our 3 pillars)." />
        </div>
    );
}
