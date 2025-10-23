"use client";

import { Mail, Linkedin, Calendar } from "lucide-react";
import { WindToggle } from "@/src/components/themes/WindToggle";
import Link from "next/link";
import Image from "next/image";
import BetaCountdown from "./BetaCountdown";

interface DevAboutMeFooterProps {
    onThemeChange?: () => void;
}

export function DevAboutMeFooter({ onThemeChange }: DevAboutMeFooterProps = {}) {
    return (
        <section className="h-screen snap-start relative overflow-hidden">
            <div className="h-full flex flex-col items-center justify-center px-4">
                <div className="max-w-2xl mx-auto text-center space-y-16">
                    {/* Main Content */}
                    <div className="space-y-8">
                        <h2 className="text-4xl font-light tracking-tight text-foreground">Ready to transform your school?</h2>

                        <div className="text-2xl font-mono text-secondary">your_school.adrenalink.tech</div>

                        {/* <p className="text-xl text-muted-foreground">First come, first served</p> */}
                    </div>

                    {/* Beta Version */}
                    {/* <BetaCountdown /> */}

                    {/* Contact */}
                    <div className="space-y-8 bg-muted p-8 rounded-2xl">
                        <div className="grid grid-cols-2 gap-6 divide-blue-50">
                            <Link
                                href="mailto:vctrubio@gmail.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 px-6 py-3 text-lg rounded-xl border-2 transition-all duration-300 text-foreground border-secondary bg-secondary/10 hover:bg-secondary/20 hover:border-secondary hover:shadow-lg"
                                title="Contact me"
                            >
                                <Mail className="w-5 h-5" />
                                <span>Contact me</span>
                            </Link>
                            <Link
                                href="https://www.linkedin.com/in/vctrubio/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 px-6 py-3 text-lg rounded-xl border-2 transition-all duration-300 text-foreground border-secondary bg-secondary/10 hover:bg-secondary/20 hover:border-secondary hover:shadow-lg"
                                title="LinkedIn Profile"
                            >
                                <Linkedin className="w-5 h-5" />
                                <span>Connect on LinkedIn</span>
                            </Link>

                            <Link
                                href="https://donkeydrills.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 px-6 py-3 text-lg rounded-xl border-2 transition-all duration-300 text-foreground border-secondary bg-secondary/10 hover:bg-secondary/20 hover:border-secondary hover:shadow-lg"
                                title="Personal Website"
                            >
                                <Image src="/donkey.png" alt="Donkey Drills" width={42} height={42} />
                                <span>Portfolio</span>
                            </Link>

                            <Link
                                href="https://calendly.com/vctrubio/adrenalink-earlybird"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 px-6 py-3 text-lg rounded-xl border-2 transition-all duration-300 text-foreground border-secondary bg-secondary/10 hover:bg-secondary/20 hover:border-secondary hover:shadow-lg"
                                title="Book a Call"
                            >
                                <Calendar className="w-5 h-5" />
                                <span>Book A Call</span>
                            </Link>
                        </div>
                    </div>

                    {/* Theme Toggle */}
                    <div className="pt-8">
                        <div className="text-sm text-muted-foreground mb-2">
                            Developed by <span className="text-secondary">vctrubio</span> 📍 Tarifa
                        </div>

                        <WindToggle onThemeChange={onThemeChange} />
                    </div>
                </div>
            </div>
        </section>
    );
}
