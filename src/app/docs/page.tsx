import Link from "next/link";
import { FounderInfoCard } from "@/src/components/cards/FounderInfoCard";

export default function DocsPage() {
    return (
        <div className="min-h-screen relative flex items-center justify-center">
            {/* Background Boat Image */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: "url(/kritaps_ungurs_unplash/boat.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            {/* Content */}
            <div className="relative z-[2] max-w-7xl mx-auto px-6 space-y-8">
                {/* Founder Card */}
                <FounderInfoCard accentColor="#3b82f6" className="max-w-3xl mx-auto" />

                {/* Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/docs/manual" className="py-4 px-6 rounded-lg border border-white/30 hover:border-white/60 hover:bg-white/5 transition-all text-white text-lg font-medium text-center backdrop-blur-xl bg-black/40">
                        Manual
                    </Link>
                    <Link href="/docs/wwd" className="py-4 px-6 rounded-lg border border-white/30 hover:border-white/60 hover:bg-white/5 transition-all text-white text-lg font-medium text-center backdrop-blur-xl bg-black/40">
                        What We Do
                    </Link>
                    <Link href="/docs/pricing" className="py-4 px-6 rounded-lg border border-white/30 hover:border-white/60 hover:bg-white/5 transition-all text-white text-lg font-medium text-center backdrop-blur-xl bg-black/40">
                        Pricing
                    </Link>
                </div>
            </div>
        </div>
    );
}
