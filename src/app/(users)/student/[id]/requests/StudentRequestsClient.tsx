"use client";

import { useStudentUser } from "@/src/providers/student-user-provider";
import { Inbox, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange.tsx";
import { getHMDuration } from "@/getters/duration-getter";
import { SPORTS_CONFIG } from "@/src/components/school/SportSelection";
import Image from "next/image";
import HelmetIcon from "@/public/appSvgs/HelmetIcon.jsx";

export function StudentRequestsClient() {
    const { data: studentUser, schoolHeader } = useStudentUser();
    const currency = schoolHeader?.currency || "YEN";
    const hasRequests = studentUser.packageRequests.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground/80">Package Requests</h2>
            </div>

            {!hasRequests ? (
                <div className="text-center py-20 bg-card border border-border rounded-[2.5rem] shadow-sm">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                        <Inbox size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground/70">No requests found</h3>
                    <p className="text-muted-foreground">You haven't requested any packages yet.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4 w-full">
                    {studentUser.packageRequests.map((request) => (
                        <PackageRequestCard key={request.id} request={request} currency={currency} />
                    ))}
                </div>
            )}
        </div>
    );
}

function PackageRequestCard({ request, currency }: { request: any; currency: string }) {
    const statusStyles: Record<string, string> = {
        requested: "bg-amber-50 text-amber-600 border-amber-100",
        accepted: "bg-emerald-50 text-emerald-600 border-emerald-100",
        rejected: "bg-red-50 text-red-600 border-red-100",
    };

    const durationHours = request.durationMinutes / 60;
    const pph = request.durationMinutes !== 60 ? Math.round(request.price / durationHours) : null;

    const sport = SPORTS_CONFIG.find(s => s.id === request.categoryEquipment);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-card rounded-[2rem] border border-border overflow-hidden hover:shadow-md transition-all group"
        >
            <div className="flex flex-col md:flex-row">
                {/* Main Info Section */}
                <div className="flex-1 p-6 md:p-8 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusStyles[request.status] || "bg-muted text-muted-foreground"}`}>
                            {request.status}
                        </div>
                        <h3 className="font-bold text-lg md:text-xl text-foreground/90 leading-tight">
                            {request.packageName}
                        </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock size={14} className="opacity-60" />
                            <span className="text-xs font-semibold uppercase tracking-wider">{getHMDuration(request.durationMinutes)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="relative w-5 h-4 opacity-60">
                                {sport?.image ? (
                                    <Image src={sport.image} alt={request.categoryEquipment} fill className="object-contain brightness-0 dark:invert" />
                                ) : (
                                    <Inbox size={14} />
                                )}
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider">{request.capacityEquipment} {request.categoryEquipment}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <HelmetIcon size={16} className="opacity-60" />
                            <span className="text-xs font-semibold uppercase tracking-wider">{request.capacityStudents} {request.capacityStudents === 1 ? "Student" : "Students"}</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Requested Dates</span>
                            <DateRangeBadge startDate={request.startDate} endDate={request.endDate} />
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 block">Submitted On</span>
                            <span className="text-xs font-semibold text-muted-foreground">{new Date(request.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                        </div>
                    </div>
                </div>

                {/* Price Sidebar */}
                <div className="bg-muted/10 border-t md:border-t-0 md:border-l border-border/50 p-6 md:p-8 flex flex-row md:flex-col items-center justify-between md:justify-center md:min-w-[200px] gap-2">
                    <div className="flex flex-col items-start md:items-center">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-foreground">{currency}{request.price}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">/ student</span>
                        </div>
                        {pph && (
                            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">
                                {currency}{pph} per hour
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}