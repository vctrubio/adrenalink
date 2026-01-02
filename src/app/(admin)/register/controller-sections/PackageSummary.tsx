import type { PackageFormData } from "@/src/components/forms/school/Package4SchoolForm";
import { CardList } from "@/src/components/ui/card/card-list";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import VerifiedIcon from "@/public/appSvgs/VerifiedIcon";
import { ENTITY_DATA } from "@/config/entities";
import { motion } from "framer-motion";

interface PackageSummaryProps {
    packageFormData: PackageFormData;
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

export function PackageSummary({ packageFormData }: PackageSummaryProps) {
    const isDescriptionComplete = !!packageFormData.description;
    const isTypeComplete = !!packageFormData.packageType;
    const isCapacityComplete = packageFormData.capacityStudents > 0;
    const isDurationComplete = packageFormData.durationMinutes > 0;
    const isPriceComplete = packageFormData.pricePerStudent >= 0;

    // Calculate Progress
    let progress = 0;
    if (isDescriptionComplete) progress += 20;
    if (isTypeComplete) progress += 20;
    if (isCapacityComplete) progress += 20;
    if (isDurationComplete) progress += 20;
    if (isPriceComplete) progress += 20;

    const packageColor = ENTITY_DATA.find(e => e.id === "schoolPackage")?.color || "#fb923c";

    const StatusIcon = ({ isComplete }: { isComplete: boolean }) => (
        isComplete 
            ? <VerifiedIcon size={16} className="text-blue-500" /> 
            : <AlertCircle size={14} className="text-amber-500/50" />
    );

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} minutes`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const typeLabels = {
        lessons: "Lessons",
        rental: "Rental",
    };

    const categoryConfig = EQUIPMENT_CATEGORIES.find(
        (cat) => cat.id === packageFormData.categoryEquipment
    );
    const CategoryIcon = categoryConfig?.icon;

    const fields = [
        { 
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isDescriptionComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Description</span>
                    <StatusIcon isComplete={isDescriptionComplete} />
                </div>
            ), 
            value: packageFormData.description || <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span> 
        },
        { 
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isTypeComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Type</span>
                    <StatusIcon isComplete={isTypeComplete} />
                </div>
            ), 
            value: packageFormData.packageType ? (
                <span className="capitalize font-black text-primary">{typeLabels[packageFormData.packageType]}</span>
            ) : <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span> 
        },
        { 
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isCapacityComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Capacity</span>
                    <StatusIcon isComplete={isCapacityComplete} />
                </div>
            ), 
            value: isCapacityComplete && CategoryIcon ? (
                <EquipmentStudentCapacityBadge
                    categoryIcon={CategoryIcon}
                    equipmentCapacity={packageFormData.capacityEquipment}
                    studentCapacity={packageFormData.capacityStudents}
                />
            ) : <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span> 
        },
        { 
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isDurationComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Duration</span>
                    <StatusIcon isComplete={isDurationComplete} />
                </div>
            ), 
            value: isDurationComplete ? formatDuration(packageFormData.durationMinutes) : <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span> 
        },
        { 
            label: (
                <div className="flex items-center gap-2.5">
                    <span className={isPriceComplete ? "text-foreground font-medium" : "text-muted-foreground"}>Price</span>
                    <StatusIcon isComplete={isPriceComplete} />
                </div>
            ), 
            value: isPriceComplete ? (
                <span className="font-mono font-black text-emerald-600">€{packageFormData.pricePerStudent}</span>
            ) : <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Required</span> 
        },
        { 
            label: "Visibility", 
            value: packageFormData.isPublic ? (
                <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                    <Eye size={14} /> Public
                </span>
            ) : (
                <span className="flex items-center gap-1.5 text-muted-foreground font-bold">
                    <EyeOff size={14} /> Private
                </span>
            ) 
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div style={{ color: progress === 100 ? packageColor : undefined }} className={progress === 100 ? "" : "text-primary"}>
                        <PackageIcon size={14} />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Check-in Package</h3>
                </div>
                <ProgressBar progress={progress} />
            </div>
            <div className="bg-card border border-border/50 rounded-[2rem] p-5 shadow-sm">
                <CardList fields={fields} />
            </div>
        </div>
    );
}
