"use client";

import { Mail, Linkedin, Phone } from "lucide-react";
import Image from "next/image";
import { Card, CardHeader, CardBody } from "@/src/components/ui/card";
import { FOUNDER_DATA } from "@/config/founder";

interface FounderInfoCardProps {
    accentColor?: string;
    className?: string;
}

export const FounderInfoCard = ({ accentColor = "#3b82f6", className }: FounderInfoCardProps) => {
    const socialIcons = [
        {
            icon: Mail,
            href: `mailto:${FOUNDER_DATA.email}`,
            label: "Email",
        },
        {
            icon: Linkedin,
            href: FOUNDER_DATA.linkedin,
            label: "LinkedIn",
        },
        {
            icon: Phone,
            href: `https://wa.me/${FOUNDER_DATA.whatsapp.replace(/[^0-9]/g, "")}`,
            label: "WhatsApp",
        },
    ];

    const sections = [
        {
            label: "Description",
            value: FOUNDER_DATA.description,
        },
        {
            label: "Vision",
            value: FOUNDER_DATA.vision,
        },
        {
            label: "Adrenalink",
            value: FOUNDER_DATA.adrenalink,
        },
    ];

    const avatar = (
        <div
            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
            style={{
                border: `3px solid ${accentColor}`,
            }}
        >
            <Image src="/pp.webp" alt={FOUNDER_DATA.name} width={80} height={80} className="object-cover w-full h-full" />
        </div>
    );

    return (
        <Card accentColor={accentColor} stats={socialIcons.map((social) => ({ icon: social.icon, value: "" }))} isActionable={true} className={className}>
            <CardHeader name={FOUNDER_DATA.name} status={FOUNDER_DATA.role} avatar={avatar} accentColor={accentColor} />

            <CardBody>
                {sections.map((section, index) => (
                    <div key={index} className="py-3 border-b border-white/10 last:border-0">
                        <div className="text-xs uppercase tracking-wider text-white/60 mb-2">{section.label}</div>
                        <p className="text-sm text-white/80 leading-relaxed">{section.value}</p>
                    </div>
                ))}
            </CardBody>
        </Card>
    );
};
