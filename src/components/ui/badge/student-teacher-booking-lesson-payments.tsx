import { TrendingUp, TrendingDown } from "lucide-react";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";

interface StudentTeacherBookingLessonPaymentsBadgeProps {
    studentPayment: number;
    teacherCommission: number;
    currency: string;
}

export function StudentTeacherBookingLessonPaymentsBadge({ 
    studentPayment, 
    teacherCommission, 
    currency 
}: StudentTeacherBookingLessonPaymentsBadgeProps) {
    const profit = studentPayment - teacherCommission;
    const isPositive = profit >= 0;
    
    return (
        <div className="flex items-center justify-start gap-4 text-xs font-bold tabular-nums">
            {/* Student Payment */}
            <div className="flex items-center gap-1.5">
                <HelmetIcon size={14} className="text-muted-foreground/40" />
                <span className="text-foreground">{studentPayment.toFixed(0)}</span>
            </div>

            {/* Teacher Commission */}
            <div className="flex items-center gap-1.5">
                <HandshakeIcon size={14} className="text-muted-foreground/40" />
                <span className="text-foreground">{teacherCommission.toFixed(0)}</span>
            </div>

            {/* Net / Trending (No background) */}
            <div className={`flex items-center gap-1 ${
                isPositive 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-primary-orange"
            }`}>
                {isPositive ? (
                    <TrendingUp size={14} />
                ) : (
                    <TrendingDown size={14} />
                )}
                <span>
                    {Math.abs(profit).toFixed(0)}
                </span>
            </div>
        </div>
    );
}
