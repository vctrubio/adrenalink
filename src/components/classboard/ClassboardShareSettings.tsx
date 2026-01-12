"use client";

import SchoolIcon from "@/public/appSvgs/SchoolIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";

export default function ClassboardShareSettings() {
    return (
        <div className="flex-1 grid grid-cols-3 divide-x divide-border/30 h-full">
            {/* School View */}
            <div className="flex flex-col items-center justify-center p-2 h-full">
                <button className="flex flex-col items-center justify-center gap-2 w-full h-full group transition-colors">
                    <SchoolIcon 
                        size={32} 
                        className="text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors duration-300" 
                    />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors duration-300">
                        School
                    </p>
                </button>
            </div>

            {/* Student View */}
            <div className="flex flex-col items-center justify-center p-2 h-full">
                <button className="flex flex-col items-center justify-center gap-2 w-full h-full group transition-colors">
                    <HelmetIcon 
                        size={32} 
                        className="text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors duration-300" 
                    />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors duration-300">
                        Student
                    </p>
                </button>
            </div>

            {/* Teacher View */}
            <div className="flex flex-col items-center justify-center p-2 h-full">
                <button className="flex flex-col items-center justify-center gap-2 w-full h-full group transition-colors">
                    <HeadsetIcon 
                        size={32} 
                        className="text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors duration-300" 
                    />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors duration-300">
                        Teacher
                    </p>
                </button>
            </div>
        </div>
    );
}