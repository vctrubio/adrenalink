import { Mail, Linkedin, Phone } from "lucide-react";
import Image from "next/image";
import { Card, CardHeader } from "@/src/components/ui/card";
import { FounderDescriptionSection } from "./FounderDescriptionSection";

const FOUNDER_DATA = {
    name: "Victor Rubio",
    role: "Founder and Developer",
    email: "vctrubio@gmail.com",
    linkedin: "https://www.linkedin.com/in/vctrubio/",
    whatsapp: "+34686516248",
    description: "So I had an idea … but never imagined something like this. At first it was just a simple replacement for excel, as I saw receptive task that took too much time, then guess what? ",
    descriptionSections: [
        {
            title: "Adrenalink",
            content: "This technology is specifically designed for sports management activities, where weather conditions mean changing the lesson planning constantly. And that's what's been achieved.",
        },
        {
            title: "Mission",
            content: "After almost 2 decades in the adrenaline community, I decided to take a leap of faith and fix to the best of my abilities. This will start out as a beta, with a maximum of 10 schools on the early bird pass, where we will work together on weekly 1:1s to talk about improvements, feedback and your school necessities.",
        },
        {
            title: "Introduction",
            content: "Please read the documentation to the application, as it has many steps. I have tried to simplify and minimize what is needed, but please bear in mind, we need to take everything into account. From the student registration, to the referrals of the bookings, to teacher's commissions, and the most requested feature - equipment tracking. So we know when enough is enough - too old - flight time > then your grandfather.",
        },
        {
            title: "Further",
            content: "Please note, I plan to target the kitesurfing world first, including kite / wind / wing for the early beta version. Later, we will expand to all adrenaline communities. Empowering each school with a homepage, direct links to their personal website and social network. Please follow along for more, or write to my personal email here.",
        },
    ],
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


    const avatar = (
        <div
            className="w-96 h-48 rounded-2xl overflow-hidden flex flex-col items-center justify-center mb-4"
            style={{
                border: `3px solid ${accentColor}`,
            }}
        >
            <Image src="/pp.webp" alt={FOUNDER_DATA.name} width={384} height={192} className="object-cover w-full h-full scale-160 translate-y-9 translate-x-1" />
        </div>
    );

    return (
        <Card accentColor={accentColor} stats={socialIcons} isActionable={true} className={className}>
            <CardHeader name={FOUNDER_DATA.name} status={FOUNDER_DATA.role} avatar={avatar} accentColor={accentColor} desc={FOUNDER_DATA.description} />
            <FounderDescriptionSection sections={FOUNDER_DATA.descriptionSections} />
            <div className="pt-6 text-center">
                <p className="text-xs uppercase tracking-wider text-gray-500">Thank you for stopping by.</p>
            </div>
        </Card>
    );
};
