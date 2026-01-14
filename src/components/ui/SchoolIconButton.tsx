"use client";

import Image from "next/image";

interface SchoolIconButtonProps {
    logo?: string;
    username?: string;
    onClick?: () => void;
}

export default function SchoolIconButton({ logo, username, onClick }: SchoolIconButtonProps) {
    return (
        <button
            onClick={onClick}
            className="group relative w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95 hover:shadow-xl"
        >
            {logo ? (
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-background shadow-sm group-hover:border-white/40 dark:group-hover:border-white/20 transition-all">
                    <Image src={logo} alt={username || "School"} fill className="object-cover" sizes="40px" />
                </div>
            ) : (username && username.length > 0) ? (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-sm border-2 border-background group-hover:border-white/40 dark:group-hover:border-white/20 transition-all group-hover:from-blue-600 group-hover:to-cyan-500">
                    <span className="text-sm font-bold">{username.charAt(0).toUpperCase()}</span>
                </div>
            ) : (
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-background shadow-sm group-hover:border-white/40 dark:group-hover:border-white/20 transition-all">
                    <Image src="/prototypes/north-icon.png" alt="North" fill className="object-cover" sizes="40px" />
                </div>
            )}
        </button>
    );
}
