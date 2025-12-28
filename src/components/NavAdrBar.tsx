"use client";

import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import Image from "next/image";
import Link from "next/link";

export default function NavAdrBar() {
    const credentials = useSchoolCredentials();

    return (
        <header className="fixed top-0 left-0 right-0 z-40 px-4 py-2 pointer-events-none">
            <div className="relative flex items-center justify-between pointer-events-auto bg-background/60 backdrop-blur-xl rounded-full px-5 py-2.5 border border-white/20 dark:border-white/10 shadow-sm mx-auto max-w-7xl mt-2 transition-all hover:bg-background/80 min-h-[60px]">
                
                {/* Center: Adrenalink Branding */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Link href="/" className="font-bold text-2xl tracking-tight text-foreground hover:opacity-80 transition-opacity">
                        Adrenalink
                    </Link>
                </div>

                {/* Right: School Icon Only */}
                <div className="ml-auto">
                    {credentials && (
                        <div className="flex items-center">
                            {credentials.logo ? (
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border shadow-sm">
                                    <Image 
                                        src={credentials.logo} 
                                        alt={credentials.username} 
                                        fill 
                                        className="object-cover" 
                                        sizes="40px"
                                    />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-sm border border-white/10">
                                    <span className="text-sm font-bold">{credentials.username.charAt(0).toUpperCase()}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}