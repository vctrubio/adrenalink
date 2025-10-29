"use client";
import { BookOpen, Target, DollarSign } from "lucide-react";
import PopoverNav from "@/src/components/navigations/PopoverNav";
import { ReactNode } from "react";

const NAV_ITEMS = [
    {
        name: "Manual",
        icon: BookOpen,
        link: "/docs/manual",
    },
    {
        name: "What We Do",
        icon: Target,
        link: "/docs/wwd",
    },
    {
        name: "Pricing",
        icon: DollarSign,
        link: "/docs/pricing",
    },
];

export default function DocsLayout({ children }: { children: ReactNode }) {
    return (
        <div>
            <PopoverNav items={NAV_ITEMS} />
            <main>{children}</main>
        </div>
    );
}
