import { Calendar, ArrowRight } from "lucide-react";
import { WindToggle } from "@/src/components/themes/WindToggle";
import Link from "next/link";

interface DevAboutMeFooterProps {
    onThemeChange?: () => void;
}

// Hero Section Component
function HeroSection() {
    return (
        <div className="text-center space-y-8 mb-16">
            <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground animate-in slide-in-from-bottom-4 duration-1000">Transform Your School</h1>
                <p className="text-xl md:text-2xl text-muted-foreground animate-in slide-in-from-bottom-4 duration-1000 delay-200">First come, first served</p>
            </div>
            <div className="text-3xl md:text-4xl font-mono text-primary animate-in slide-in-from-bottom-4 duration-1000 delay-300">your_school.adrenalink.tech</div>
        </div>
    );
}

// CTA Buttons Component
function CTAButtons() {
    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
                href="/welcome"
                className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 animate-in slide-in-from-left-4 duration-1000 delay-500"
            >
                Sign Up (Early Bird)
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
                href="https://calendly.com/vctrubio/adrenalink-earlybird"
                target="_blank"
                rel="noopener noreferrer"
                className="group border-2 border-secondary hover:bg-secondary/10 text-foreground px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 animate-in slide-in-from-right-4 duration-1000 delay-500"
            >
                <Calendar className="w-5 h-5" />
                Request a Demo
            </Link>
        </div>
    );
}

// Footer Credits Component
function FooterCredits({ onThemeChange }: { onThemeChange?: () => void }) {
    return (
        <footer className="mt-auto py-8 bg-muted rounded-2xl">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col items-center space-y-4">
                    <div className="text-sm text-muted-foreground">
                        Developed by <span className="text-secondary font-medium">vctrubio</span> 📍 Tarifa
                    </div>
                    <WindToggle onThemeChange={onThemeChange} />
                </div>
            </div>
        </footer>
    );
}

export function DevAboutMeFooter({ onThemeChange }: DevAboutMeFooterProps = {}) {
    return (
        <section className="h-screen snap-start relative overflow-hidden">
            <div className="h-full flex flex-col justify-between px-4 py-16">
                <div className="flex-1 flex items-center justify-center">
                    <div className="max-w-4xl mx-auto text-center">
                        <HeroSection />
                        <CTAButtons />
                    </div>
                </div>

                <FooterCredits onThemeChange={onThemeChange} />
            </div>
        </section>
    );
}
