"use client";

import Link from "next/link";

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
            <div className="relative z-[2] max-w-4xl mx-auto px-6">
                <div className="text-center p-12 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 space-y-8">
                    <div className="text-xl md:text-2xl text-white leading-relaxed space-y-6">
                        <p>Hi, I'm a software developer with 25 years experience of adrenaline venom.</p>
                        <p>I want to create a community for aspiring junkies. The idea is to built a community that connects students with schools.</p>
                        <p>This documentation section is aimed towards management teams that aim to boost their social activity, forget excel sheets, and make planning fun. For once.</p>
                    </div>

                    {/* Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                        <Link href="/docs/manual" className="py-4 px-6 rounded-lg border border-white/30 hover:border-white/60 hover:bg-white/5 transition-all text-white text-lg font-medium">
                            Manual
                        </Link>
                        <Link href="/docs/wwd" className="py-4 px-6 rounded-lg border border-white/30 hover:border-white/60 hover:bg-white/5 transition-all text-white text-lg font-medium">
                            What We Do
                        </Link>
                        <Link href="/docs/pricing" className="py-4 px-6 rounded-lg border border-white/30 hover:border-white/60 hover:bg-white/5 transition-all text-white text-lg font-medium">
                            Pricing
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
