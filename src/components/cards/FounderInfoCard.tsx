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
    description: "So I had an idea … but never imagined something like this. At first it was just a simple replacement for excel, as I saw receptive task that took too much time, but then guess what? ",
    tackle: "The wind changed and everything needed to re planned again, in 5 different places. ", // tonadd after desciption
    descriptionSections: [
        {
            title: "Adrenalink",
            content: "This application is specifically designed for sports management activities, where weather conditions mean changing the lesson planning constantly. And that's what's been desginged.",
        },
        {
            title: "Mission",
            content:
                "After 2 decades in the adrenaline community, I founded this platform to embrace a new level of visibility, connection, and organisation for outdoor schools. Our mission is to give schools, students, and teachers a unified digital home where lessons, progress, and operations flow effortlessly.",
        },
        {
            title: "Social",
            content: "Our focus now is on empowering each school with its own homepage, along with direct links to your website and social channels. Follow along for updates, or reach out to my personal email here.",
        },
        {
            title: "Introduction",
            content:
                "This documentation will guide you through the essential steps required to run your school on Adrenalink. Because outdoor sports depend heavily on changing weather conditions, our system is built to handle every moving part — from student registrations and booking flows to referrals, teacher commissions, and the most requested feature: full equipment tracking. Each component has been simplified as much as possible, while still covering the real operational needs that schools face every day. The goal is to give you clarity, structure, and control — so you always know who is booked, who is teaching, and which gear is ready for flight time (or finally ready to retire).",
        },
        {
            title: "Beta",
            content: "The platform will begin as a beta with a maximum of 10 schools on the Early Bird Pass. Together, we will meet weekly in 1:1 sessions to review improvements, gather feedback, and prioritise the real needs of your school.",
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
