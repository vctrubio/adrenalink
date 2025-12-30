import { Check, TrendingUp, TrendingDown } from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { EquipmentStudentCommissionBadge } from "@/src/components/ui/badge/equipment-student-commission";
import { TeacherUsernameCommissionBadge } from "@/src/components/ui/badge/teacher-username-commission";
import { EVENT_STATUS_CONFIG, type EventStatus } from "@/types/status";
import { EventDurationTag } from "@/src/components/tags/EventDurationTag";
import { TeacherCommissionBadge } from "@/src/components/ui/badge/teacher-commission";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";

interface TransactionExampleTableProps {
    event: {
        date: string;
        duration: number;
        location: string | null;
        status: string;
    };
    teacher: {
        username: string;
    };
    leaderStudentName: string;
    studentCount: number;
    packageData: {
        description: string;
        pricePerStudent: number;
        durationMinutes: number; // For PPH calc
        categoryEquipment: string;
        capacityEquipment: number;
        capacityStudents: number;
    };
    financials: {
        teacherEarnings: number;
        studentRevenue: number;
        profit: number;
        currency: string;
    };
}

export function TransactionExampleTable({
    event,
    teacher,
    leaderStudentName,
    studentCount,
    packageData,
    financials
}: TransactionExampleTableProps) {
    const equipmentConfig = EQUIPMENT_CATEGORIES.find(c => c.id === packageData.categoryEquipment);
    const EquipmentIcon = equipmentConfig?.icon;
    
    // Calculate PPH
    const packageHours = packageData.durationMinutes / 60;
    const pricePerHour = packageHours > 0 ? packageData.pricePerStudent / packageHours : 0;

    // Native formatters
    const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
    const mobileDateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
    const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

    const statusConfig = EVENT_STATUS_CONFIG[event.status as EventStatus];
    const studentFirstName = leaderStudentName.split(" ")[0];

    return (
        <div className="w-full rounded-xl border border-border shadow-sm bg-card overflow-hidden">
            {/* Desktop Table - Hidden on Mobile */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                        <tr>
                            {/* Booking / Event (Blue) */}
                            <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Date</th>
                            <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Time</th>
                            <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Dur</th>
                            <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Teacher</th>
                            <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Student</th>
                            <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Loc</th>

                            {/* Package (Orange) */}
                            <th className="px-4 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10">Package</th>
                            <th className="px-4 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10">PPH</th>
                            <th className="px-4 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10">Equip</th>

                            {/* Financials (Grey) */}
                            <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right">Comm.</th>
                            <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right">Rev.</th>
                            <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right">Profit</th>
                            
                            {/* Status */}
                            <th className="px-4 py-3 font-medium text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        <tr className="hover:bg-muted/5 transition-colors">
                            {/* Booking / Event Details */}
                            <td className="px-4 py-3 whitespace-nowrap tabular-nums text-blue-900/80 dark:text-blue-100/80 bg-blue-50/10 dark:bg-blue-900/5">
                                {dateFormat.format(new Date(event.date))}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap tabular-nums text-blue-900/80 dark:text-blue-100/80 bg-blue-50/10 dark:bg-blue-900/5">
                                {timeFormat.format(new Date(event.date))}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap tabular-nums text-blue-900/80 dark:text-blue-100/80 bg-blue-50/10 dark:bg-blue-900/5">
                                {(event.duration / 60).toFixed(1)}h
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap font-medium text-blue-900/80 dark:text-blue-100/80 bg-blue-50/10 dark:bg-blue-900/5">
                                {teacher.username}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-blue-900/80 dark:text-blue-100/80 bg-blue-50/10 dark:bg-blue-900/5">
                                <span className="font-medium">{leaderStudentName}</span>
                                {studentCount > 1 && <span className="text-xs text-muted-foreground ml-1">+{studentCount - 1}</span>}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-blue-900/80 dark:text-blue-100/80 bg-blue-50/10 dark:bg-blue-900/5">
                                {event.location || "-"}
                            </td>

                            {/* ... rest of desktop table ... */}
                            {/* Package Details */}
                            <td className="px-4 py-3 whitespace-nowrap max-w-[150px] truncate text-orange-900/80 dark:text-orange-100/80 bg-orange-50/10 dark:bg-orange-900/5">
                                {packageData.description}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap tabular-nums text-orange-900/80 dark:text-orange-100/80 bg-orange-50/10 dark:bg-orange-900/5">
                                {pricePerHour.toFixed(0)} {financials.currency}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap bg-orange-50/10 dark:bg-orange-900/5">
                                {EquipmentIcon && (
                                    <EquipmentStudentCapacityBadge 
                                        categoryIcon={EquipmentIcon}
                                        equipmentCapacity={packageData.capacityEquipment}
                                        studentCapacity={packageData.capacityStudents}
                                    />
                                )}
                            </td>

                            {/* Financials */}
                            <td className="px-4 py-3 whitespace-nowrap text-right tabular-nums font-medium text-zinc-900/80 dark:text-zinc-100/80 bg-zinc-50/10 dark:bg-zinc-900/5">
                                {financials.teacherEarnings.toFixed(0)} {financials.currency}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right tabular-nums font-medium text-zinc-900/80 dark:text-zinc-100/80 bg-zinc-50/10 dark:bg-zinc-900/5">
                                {financials.studentRevenue.toFixed(0)} {financials.currency}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right tabular-nums font-bold text-emerald-600 dark:text-emerald-400 bg-zinc-50/10 dark:bg-zinc-900/5">
                                {financials.profit.toFixed(0)} {financials.currency}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3 text-center">
                                {statusConfig ? (
                                    <div 
                                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tight"
                                        style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
                                    >
                                        {event.status === "completed" && <Check size={10} strokeWidth={4} />}
                                        {statusConfig.label}
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground italic">Unknown</span>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Mobile Table - 4 Columns (Event, Teacher, Details, Profit) */}
            <div className="sm:hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                        <tr>
                            <th className="px-3 py-2 font-medium w-[30%]">Event</th>
                            <th className="px-3 py-2 font-medium w-[25%]">Teacher</th>
                            <th className="px-3 py-2 font-medium w-[30%] text-center">Package</th>
                            <th className="px-3 py-2 font-medium w-[15%] text-right">Profit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        <tr>
                            {/* Event: Date, Time, and Duration on one line */}
                            <td className="px-3 py-3 align-middle">
                                <div className="flex items-center gap-2 whitespace-nowrap">
                                    <span className="text-xs font-bold text-muted-foreground">
                                        {new Date(event.date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })}
                                    </span>
                                    <span className="text-sm font-bold text-foreground">
                                        {timeFormat.format(new Date(event.date))}
                                    </span>
                                    <span className="text-xs font-bold text-foreground">
                                        +{(event.duration / 60).toFixed(1)}h
                                    </span>
                                </div>
                            </td>

                            {/* Teacher: Username & Commission Badge */}
                            <td className="px-3 py-3 align-middle">
                                <TeacherUsernameCommissionBadge 
                                    teacherIcon={HeadsetIcon}
                                    teacherUsername={teacher.username}
                                    teacherColor="#22c55e"
                                    commissionValue={financials.commissionValue.toString()}
                                    commissionType={financials.commissionType}
                                    currency={financials.currency}
                                    showCurrency={false}
                                />
                            </td>

                            {/* Package Details: Equipment, Capacity, Price */}
                            <td className="px-3 py-3 align-middle text-center">
                                <div className="inline-flex">
                                    <EquipmentStudentPackagePriceBadge 
                                        categoryEquipment={packageData.categoryEquipment}
                                        equipmentCapacity={packageData.capacityEquipment}
                                        studentCapacity={packageData.capacityStudents}
                                        packageDurationHours={packageData.durationMinutes / 60}
                                        pricePerHour={pricePerHour}
                                    />
                                </div>
                            </td>

                            {/* Status: Badge showing Profit with trending icon */}
                            <td className="px-3 py-3 align-middle text-right">
                                {statusConfig && (
                                    <div 
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-tight"
                                        style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
                                    >
                                        {financials.profit >= 0 ? (
                                            <TrendingUp size={12} strokeWidth={3} className="shrink-0" />
                                        ) : (
                                            <TrendingDown size={12} strokeWidth={3} className="shrink-0" />
                                        )}
                                        {Math.abs(financials.profit).toFixed(0)}
                                    </div>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}


