import type { StudentFormData } from "@/src/components/forms/school/Student4SchoolForm";
import { CardList } from "@/src/components/ui/card/card-list";
import { AlertCircle } from "lucide-react";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import VerifiedIcon from "@/public/appSvgs/VerifiedIcon";
import { getCountryNameByCode } from "@/config/countries";

interface StudentSummaryProps {
    studentFormData: StudentFormData;
}

export function StudentSummary({ studentFormData }: StudentSummaryProps) {
    const isNameComplete = !!(studentFormData.first_name && studentFormData.last_name);
    const isPassportComplete = !!studentFormData.passport;
    const isCountryComplete = !!studentFormData.country;
    const isPhoneComplete = !!studentFormData.phone;
    const isLanguagesComplete = studentFormData.languages.length > 0;

    const StatusIcon = ({ isComplete }: { isComplete: boolean }) =>
        isComplete ? <VerifiedIcon size={16} className="text-blue-500" /> : <AlertCircle size={14} className="text-amber-500/50" />;

    const fields = [
        {
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isNameComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Full Name</span>
                    <StatusIcon isComplete={isNameComplete} />
                </div>
            ),
            value: isNameComplete ? (
                `${studentFormData.first_name} ${studentFormData.last_name}`
            ) : (
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
            value: isCountryComplete ? (
                getCountryNameByCode(studentFormData.country)
            ) : (
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
            value: studentFormData.rental ? (
                <span className="text-emerald-600 font-bold">
                    Authorized
                </span>
            ) : (
                <span className="text-muted-foreground text-xs font-medium">No</span>
            ),
        },
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-center px-1">
                <div className="flex items-center gap-2">
                    <div className="text-yellow-500">
                        <HelmetIcon size={14} />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Student</h3>
                </div>
            </div>
            <div className="border border-border/50 rounded-xl p-4">
                <CardList fields={fields} />
            </div>
        </div>
    );
}
