import { Mail, Linkedin, Phone } from "lucide-react";
import Image from "next/image";
import { Card, CardHeader, CardBody } from "@/src/components/ui/card";

const FOUNDER_DATA = {
    name: "Victor Rubio",
    role: "Founder and Developer",
    email: "vctrubio@gmail.com",
    linkedin: "https://www.linkedin.com/in/vctrubio/",
    whatsapp: "+34686516248",
    description: "So I had an idea … but never imagined something like this. At first it was just a simple replacement for excel, as I saw receptive task that took too much time, then guess what? ",
} as const;

interface FounderInfoCardProps {
    accentColor?: string;
    className?: string;
}

export const FounderInfoCard = ({ accentColor = "#3b82f6", className }: FounderInfoCardProps) => {
    const socialIcons = [
        {
            icon: Mail,
            href: `mailto:${FOUNDER_DATA.email}`,
            value: "",
        },
        {
            icon: Linkedin,
            href: FOUNDER_DATA.linkedin,
            value: "",
        },
        {
            icon: Phone,
            href: `https://wa.me/${FOUNDER_DATA.whatsapp.replace(/[^0-9]/g, "")}`,
            value: "",
        },
    ];

    const sections = [
        {
            label: "My Vision",
            value: FOUNDER_DATA.vision,
        },
        {
            label: "About Adrenalink",
            value: FOUNDER_DATA.adrenalink,
        },
    ];

    const avatar = (
        <div
            className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
                border: `3px solid ${accentColor}`,
            }}
        >
            <Image src="/pp.webp" alt={FOUNDER_DATA.name} width={100} height={100} className="object-cover w-full h-full scale-140 translate-y-4 translate-x-1" />
        </div>
    );

    return (
        <Card accentColor={accentColor} stats={socialIcons} isActionable={true} className={className}>
            <CardHeader name={FOUNDER_DATA.name} status={FOUNDER_DATA.role} avatar={avatar} accentColor={accentColor} desc={FOUNDER_DATA.description} />
            <CardBody sections={sections} />
        </Card>
    );
};
