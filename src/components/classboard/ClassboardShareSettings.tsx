"use client";

import SchoolIcon from "@/public/appSvgs/SchoolIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { useClassboardContext } from "@/src/providers/classboard-provider";

const SHARE_OPTIONS = [
    { id: "admin", label: "Admin", Icon: SchoolIcon },
    { id: "student", label: "Student", Icon: HelmetIcon },
    { id: "teacher", label: "Teacher", Icon: HeadsetIcon },
] as const;

export default function ClassboardShareSettings() {
    const { globalFlag } = useClassboardContext();
    const sharingMode = globalFlag.getSharingMode();

    return (
        <div className="flex-1 grid grid-cols-3 divide-x divide-border/30 h-full">
            {SHARE_OPTIONS.map(({ id, label, Icon }) => {
                const isActive = sharingMode === id;
                const isShared = globalFlag.isRoleShared(id);

                return (
                    <div key={id} className="flex flex-col items-center justify-center p-2 h-full">
                        <button
                            onClick={() => globalFlag.setSharingMode(isActive ? null : id)}
                            className={`flex flex-col items-center justify-center gap-2 w-full h-full group transition-colors ${
                                isActive ? "bg-primary/5" : ""
                            }`}
                        >
                            <Icon
                                size={32}
                                className={`transition-colors duration-300 ${
                                    isActive
                                        ? "text-primary"
                                        : isShared
                                          ? "text-slate-500 dark:text-slate-400"
                                          : "text-slate-300 dark:text-slate-600"
                                } group-hover:text-primary`}
                            />
                            <p
                                className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                                    isActive ? "text-primary" : "text-muted-foreground"
                                } group-hover:text-primary`}
                            >
                                {label}
                            </p>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
