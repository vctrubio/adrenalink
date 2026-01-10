import type { StudentFormData } from "@/src/components/forms/school/Student4SchoolForm";
import { CardList } from "@/src/components/ui/card/card-list";
import { AlertCircle } from "lucide-react";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import VerifiedIcon from "@/public/appSvgs/VerifiedIcon";
import { ENTITY_DATA } from "@/config/entities";
import { motion } from "framer-motion";

interface StudentSummaryProps {
    studentFormData: StudentFormData;
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

export function StudentSummary({ studentFormData }: StudentSummaryProps) {
    const isNameComplete = !!(studentFormData.firstName && studentFormData.lastName);
    const isPassportComplete = !!studentFormData.passport;
    const isCountryComplete = !!studentFormData.country;
    const isPhoneComplete = !!studentFormData.phone;
    const isLanguagesComplete = studentFormData.languages.length > 0;

    // Calculate Progress
    let progress = 0;
    if (isNameComplete) progress += 20;
    if (isPassportComplete) progress += 20;
    if (isCountryComplete) progress += 20;
    if (isPhoneComplete) progress += 20;
    if (isLanguagesComplete) progress += 20;

    const studentColor = ENTITY_DATA.find((e) => e.id === "student")?.color || "#eab308";

    const StatusIcon = ({ isComplete }: { isComplete: boolean }) =>
        isComplete ? <VerifiedIcon size={16} className="text-blue-500" /> : <AlertCircle size={14} className="text-amber-500/50" />;

    const fields = [
        {
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isNameComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Name</span>
                    <StatusIcon isComplete={isNameComplete} />
                </div>
            ),
            value: isNameComplete ? (
                `${studentFormData.firstName} ${studentFormData.lastName}`
            ) : (
                <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span>
            ),
        },
        {
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isPassportComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Passport</span>
                    <StatusIcon isComplete={isPassportComplete} />
                </div>
            ),
            value: studentFormData.passport || (
                <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span>
            ),
        },
        {
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isCountryComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Country</span>
                    <StatusIcon isComplete={isCountryComplete} />
                </div>
            ),
            value: studentFormData.country || (
                <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span>
            ),
        },
        {
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isPhoneComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Phone</span>
                    <StatusIcon isComplete={isPhoneComplete} />
                </div>
            ),
            value: studentFormData.phone || (
                <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span>
            ),
        },
        {
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isLanguagesComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Languages</span>
                    <StatusIcon isComplete={isLanguagesComplete} />
                </div>
            ),
            value: isLanguagesComplete ? (
                studentFormData.languages.join(", ")
            ) : (
                <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span>
            ),
        },
        {
            label: "Rental Auth",
            value: studentFormData.canRent ? (
                <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <VerifiedIcon size={16} className="text-blue-500" />
                    Authorized
                </span>
            ) : (
                <span className="text-muted-foreground text-xs font-medium">No</span>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div
                        style={{ color: progress === 100 ? studentColor : undefined }}
                        className={progress === 100 ? "" : "text-primary"}
                    >
                        <HelmetIcon size={14} />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Check-in Student</h3>
                </div>
                <ProgressBar progress={progress} />
            </div>
            <div className="bg-card border border-border/50 rounded-[2rem] p-5 shadow-sm">
                <CardList fields={fields} />
            </div>
        </div>
    );
}
