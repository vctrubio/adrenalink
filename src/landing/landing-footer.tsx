import { Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { BackgroundImage } from "@/src/components/BackgroundImage";
import { WindToggle } from "@/src/components/themes/WindToggle";
import LightSwitch from "@/src/components/themes/LightSwitch";
import Link from "next/link";

const GREEN_GO = "bg-green-600 hover:bg-green-700";

interface DevAboutMeFooterProps {
    onThemeChange?: () => void;
}

// Hero Section Component
function HeroSection() {
    return (
        <div className="text-center space-y-8 mb-16">
            <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white animate-in slide-in-from-bottom-4 duration-1000">Transform Your School</h1>
                <div>
                    <p className="text-xl md:text-2xl text-gray-300 animate-in slide-in-from-bottom-4 duration-1000 delay-200">First come, first served</p>
                    <p className="text-xl md:text-2xl text-gray-300 animate-in slide-in-from-bottom-4 duration-1000 delay-200">We help you grow your social presence, and help speed your daily operations.</p>
                </div>
                <div>
                    <p className="text-xl md:text-2xl text-gray-300 animate-in slide-in-from-bottom-4 duration-1000 delay-300">BEta is only available to Kite/Windsurf/Wing</p>
                    <p className="text-xl md:text-2xl text-gray-300 animate-in slide-in-from-bottom-4 duration-1000 delay-400">Coming up is Paragliding, speed riding, White Water Rafting, Ski and Snowboard. </p>
                </div>
            </div>
            <div className="inline-block bg-black/30 backdrop-blur-md rounded-lg px-6 py-3 animate-in slide-in-from-bottom-4 duration-1000 delay-300">
                <div className="text-3xl md:text-4xl font-mono text-green-400">your_school.adrenalink.tech</div>
            </div>
        </div>
    );
}

// CTA Buttons Component
function CTAButtons() {
    return (
        <div className="space-y-6 mb-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/welcome" className={`group ${GREEN_GO} text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 animate-in slide-in-from-left-4 duration-1000 delay-500`}>
                    Sign Up (Early Bird)
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                    href="https://calendly.com/vctrubio/adrenalink-earlybird"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group border-2 border-secondary hover:bg-secondary/10 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 animate-in slide-in-from-right-4 duration-1000 delay-500"
                >
                    <Calendar className="w-5 h-5" />
                    Request a Demo
                </Link>
            </div>
        </div>
    );
}

// Prototype Preview Component
function PrototypePreview() {
    return (
        <div className="w-full max-w-5xl mx-auto mb-12 px-4">
            <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-gray-900">
                <div className="aspect-video w-full">
                    <iframe src="https://kite-hostel.vercel.app/" className="w-full h-full" title="Adrenalink Prototype" loading="lazy" />
                </div>
            </div>
        </div>
    );
}

export function DevAboutMeFooter() {
    return (
        <section className="h-screen snap-start relative overflow-hidden">
            <BackgroundImage
                src="/kritaps_ungurs_unplash/wave.jpg"
                position="absolute"
                overlay="linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 25%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.5) 75%, rgba(0, 0, 0, 0.8) 100%)"
                transform="rotate(180deg)"
            />

            <div className="relative z-10 h-full flex flex-col justify-between px-4 py-16 overflow-y-auto">
                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <HeroSection />
                        <CTAButtons />
                    </div>
                    {/* <PrototypePreview /> */}
                </div>
            </div>

            {/* <div className="absolute bottom-4 right-4 z-20"> */}
            {/*     <LightSwitch /> */}
            {/* </div> */}
        </section>
    );
}
