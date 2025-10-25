"use client";

interface FloatingNavProps {
    show?: boolean;
    slogan?: string;
}

export default function FloatingNav({ show = true, slogan = "streamlining the experience" }: FloatingNavProps) {
    return (
        <nav
            className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        px-6 py-3 rounded-full border border-secondary/60 bg-card/80 backdrop-blur-md
        shadow-lg
        transition-all duration-500
        ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
      `}
        >
            <span className="text-xl font-semibold tracking-tight text-foreground">
                Adrenalink
                <span className="ml-3 align-middle text-sm font-normal text-secondary/80 italic tracking-wide">{slogan}</span>
            </span>
        </nav>
    );
}
