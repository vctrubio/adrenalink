"use client";

import { useRouter } from "next/navigation";

interface LabelTagProps {
    icon: React.ComponentType<{ className?: string }>;
    name: string;
    backgroundColor: string; // Hex color value
    color: string; // Tailwind text color class
    link?: string; // Optional link
}

export default function LabelTag({ icon: Icon, name, backgroundColor, color, link }: LabelTagProps) {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (link) {
            router.push(link);
        }
    };

    const content = (
        <div className="flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-all hover:scale-105 cursor-pointer" style={{ backgroundColor }} onClick={link ? handleClick : undefined}>
            <Icon className={`w-3 h-3 ${color}`} />
            <span className="text-foreground">{name}</span>
        </div>
    );

    return content;
}
