import type { TeacherFormData } from "@/src/components/forms/school/Teacher4SchoolForm";
import { CardList } from "@/src/components/ui/card/card-list";
import { AlertCircle } from "lucide-react";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import VerifiedIcon from "@/public/appSvgs/VerifiedIcon";
import { ENTITY_DATA } from "@/config/entities";
import { motion } from "framer-motion";

interface TeacherSummaryProps {
    teacherFormData: TeacherFormData;
}

const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
        <motion.div 
            className={`h-full ${progress === 100 ? "bg-emerald-500" : "bg-primary"}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
        />
    </div>
);

export function TeacherSummary({ teacherFormData }: TeacherSummaryProps) {
    const isNameComplete = !!(teacherFormData.firstName && teacherFormData.lastName);
    const isUsernameComplete = !!teacherFormData.username;
    const isPassportComplete = !!teacherFormData.passport;
    const isCountryComplete = !!teacherFormData.country;
    const isPhoneComplete = !!teacherFormData.phone;
    const isLanguagesComplete = teacherFormData.languages.length > 0;

    // Calculate Progress
    let progress = 0;
    if (isNameComplete) progress += 20;
    if (isUsernameComplete) progress += 20;
    if (isPassportComplete) progress += 20;
    if (isCountryComplete) progress += 20;
    if (isPhoneComplete) progress += 10;
    if (isLanguagesComplete) progress += 10;

    const teacherColor = ENTITY_DATA.find(e => e.id === "teacher")?.color || "#22c55e";

    const StatusIcon = ({ isComplete }: { isComplete: boolean }) => (
        isComplete 
            ? <VerifiedIcon size={16} className="text-blue-500" /> 
            : <AlertCircle size={14} className="text-amber-500/50" />
    );

    const fields = [
        { 
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isNameComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Full Name</span>
                    <StatusIcon isComplete={isNameComplete} />
                </div>
            ), 
            value: isNameComplete 
                ? `${teacherFormData.firstName} ${teacherFormData.lastName}` 
                : <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span> 
        },
        { 
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isUsernameComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Username</span>
                    <StatusIcon isComplete={isUsernameComplete} />
                </div>
            ), 
            value: teacherFormData.username ? (
                <span className="font-mono text-primary font-black">@{teacherFormData.username}</span>
            ) : <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span> 
        },
        { 
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isPassportComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Passport</span>
                    <StatusIcon isComplete={isPassportComplete} />
                </div>
            ), 
            value: teacherFormData.passport || <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span> 
        },
        { 
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isCountryComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Country</span>
                    <StatusIcon isComplete={isCountryComplete} />
                </div>
            ), 
            value: teacherFormData.country || <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span> 
        },
        { 
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isPhoneComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Phone</span>
                    <StatusIcon isComplete={isPhoneComplete} />
                </div>
            ), 
            value: teacherFormData.phone || <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span> 
        },
        { 
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isLanguagesComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Languages</span>
                    <StatusIcon isComplete={isLanguagesComplete} />
                </div>
            ), 
            value: isLanguagesComplete 
                ? teacherFormData.languages.join(", ") 
                : <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span> 
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div style={{ color: progress === 100 ? teacherColor : undefined }} className={progress === 100 ? "" : "text-primary"}>
                        <HeadsetIcon size={14} />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Check-in Teacher</h3>
                </div>
                <ProgressBar progress={progress} />
            </div>
            <div className="bg-card border border-border/50 rounded-[2rem] p-5 shadow-sm">
                <CardList fields={fields} />
            </div>
        </div>
    );
}
