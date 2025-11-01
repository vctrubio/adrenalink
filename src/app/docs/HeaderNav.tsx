"use client";

import { usePathname, useRouter } from "next/navigation";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

const NAV_PAGES = [
    { name: "Manual", path: "/docs/manual" },
    { name: "What We Do", path: "/docs/wwd" },
    { name: "Pricing", path: "/docs/pricing" },
];

export default function HeaderNav() {
    const pathname = usePathname();
    const router = useRouter();

    const currentIndex = NAV_PAGES.findIndex((page) => page.path === pathname);
    const currentPage = currentIndex !== -1 ? NAV_PAGES[currentIndex] : null;

    const handlePrevious = () => {
        const prevIndex = currentIndex - 1;
        const targetIndex = prevIndex < 0 ? NAV_PAGES.length - 1 : prevIndex;
        router.push(NAV_PAGES[targetIndex].path);
    };

    const handleNext = () => {
        const nextIndex = currentIndex + 1;
        const targetIndex = nextIndex >= NAV_PAGES.length ? 0 : nextIndex;
        router.push(NAV_PAGES[targetIndex].path);
    };

    if (!currentPage) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4">
            <button onClick={handlePrevious} className="p-3 rounded-lg bg-black/80 hover:bg-black/90 backdrop-blur-md border border-white/10 transition-all transform -rotate-90 hover:scale-110">
                <AdranlinkIcon size={32} className="text-primary" />
            </button>

            <button onClick={handleNext} className="p-3 rounded-lg bg-black/80 hover:bg-black/90 backdrop-blur-md border border-white/10 transition-all transform rotate-90 hover:scale-110">
                <AdranlinkIcon size={32} className="text-primary" />
            </button>
        </div>
    );
}
