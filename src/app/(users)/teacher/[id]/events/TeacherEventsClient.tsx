"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { EventUserConfirmation } from "@/src/components/events/EventUserConfirmation";
import { EventTeacherConfirmation } from "@/src/components/events/EventTeacherConfirmation";
import { EventTeacherCard } from "@/src/components/events/EventTeacherCard";
import { StatItemUI } from "@/backend/data/StatsData";
import { getTodayDateString } from "@/getters/date-getter";
import { useTeacherUser } from "@/src/providers/teacher-user-provider";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";

// Sub-components
function DatePicker({
    selectedDate,
    onPreviousDay,
    onNextDay,
    onToday,
    dayNumber,
    monthShort,
    dayName,
    showBadge,
    badgeText,
    isToday,
}: {
    selectedDate: string;
    onPreviousDay: () => void;
    onNextDay: () => void;
    onToday: () => void;
    dayNumber: number;
    monthShort: string;
    dayName: string;
    showBadge: boolean;
    badgeText: string;
    isToday: boolean;
}) {
    return (
        <div className="w-full flex items-stretch border border-border/30 rounded-lg overflow-hidden shadow-sm select-none min-h-32 bg-card">
            <div className="flex-1 flex items-center justify-center gap-6 py-4 px-4 relative">
                <button
                    onClick={onPreviousDay}
                    className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-slate-800 dark:hover:border-slate-200 bg-transparent flex items-center justify-center transition-all group active:scale-95"
                >
                    <Play
                        size={16}
                        className="rotate-180 text-slate-400 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-slate-200 fill-current transition-colors"
                        strokeWidth={3}
                    />
                </button>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center leading-none">
                        <span className="text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tighter">
                            {dayNumber}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 ml-1">{monthShort}</span>
                    </div>

                    <div className="flex flex-col items-start gap-0.5">
                        <span className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-none">{dayName}</span>

                        <div className="flex items-center gap-2 h-4">
                            {showBadge && (
                                <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-full min-w-[28px] text-center">
                                    {badgeText}
                                </span>
                            )}

                            {isToday && (
                                <span className="text-[10px] font-black text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white pb-0.5 tracking-wider">
                                    TODAY
                                </span>
                            )}

                            {!isToday && (
                                <button
                                    onClick={onToday}
                                    className="text-[9px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider border-b border-transparent hover:border-slate-900 dark:hover:border-white"
                                >
                                    Today
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={onNextDay}
                    className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-slate-800 dark:hover:border-slate-200 bg-transparent flex items-center justify-center transition-all group active:scale-95"
                >
                    <Play
                        size={12}
                        className="text-slate-400 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-slate-200 fill-current transition-colors"
                        strokeWidth={3}
                    />
                </button>
            </div>
        </div>
    );
}

function EventList({
    viewMode,
    selectedDate,
    sortedTransactions,
    eventsByDate,
    currency,
}: {
    viewMode: "date" | "all";
    selectedDate: string;
    sortedTransactions: any[];
    eventsByDate: { date: string; transactions: any[] }[];
    currency: string;
}) {
    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={viewMode === "date" ? selectedDate : "all"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                >
                    {viewMode === "date" ? (
                        sortedTransactions.length > 0 ? (
                            sortedTransactions.map((tx) => (
                                <div key={tx.event.id}>
                                    <EventUserConfirmation event={tx} viewMode="teacher" currency={currency} />
                                    <EventTeacherConfirmation event={tx} currency={currency} />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-card rounded-2xl border-2 border-dashed border-border text-muted-foreground">
                                No events scheduled for this day.
                            </div>
                        )
                    ) : (
                        eventsByDate.length > 0 ? (
                            eventsByDate.map(({ date, transactions }) => {
                                const dateObj = new Date(date + "T00:00:00");
                                const formattedDate = dateObj.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                });

                                const dateStats = transactions.reduce(
                                    (acc, tx) => {
                                        acc.totalDuration += tx.event.duration;
                                        acc.totalEarning += tx.financials.teacherEarnings || 0;
                                        if (tx.event.status === "completed") acc.completedCount++;
                                        return acc;
                                    },
                                    { totalDuration: 0, totalEarning: 0, completedCount: 0 }
                                );

                                return (
                                    <div key={date} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{formattedDate}</h3>
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <FlagIcon size={12} className="text-muted-foreground" />
                                                    <span className="text-muted-foreground">{dateStats.completedCount}/{transactions.length}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <DurationIcon size={12} className="text-muted-foreground" />
                                                    <span className="text-muted-foreground">{Math.round(dateStats.totalDuration / 60 * 10) / 10}h</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <HandshakeIcon size={12} className="text-green-600" />
                                                    <span className="text-green-600 font-semibold">{dateStats.totalEarning.toFixed(0)} {currency}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {transactions.map((tx) => {
                                                const students = tx.booking.students?.map((s) => `${s.firstName} ${s.lastName}`) || [];
                                                const location = tx.event.location || "TBD";
                                                const packageDescription = tx.packageData?.description || "N/A";
                                                const pricePerHour = tx.financials?.commissionValue || 0;
                                                const categoryEquipment = tx.packageData?.categoryEquipment || "";
                                                const capacityEquipment = tx.packageData?.capacityEquipment || 0;
                                                const commissionType = tx.financials?.commissionType || "fixed";
                                                const commissionValue = tx.financials?.commissionValue || 0;

                                                return (
                                                    <EventTeacherCard
                                                        key={tx.event.id}
                                                        students={students}
                                                        location={location}
                                                        date={tx.event.date}
                                                        duration={tx.event.duration}
                                                        capacity={tx.booking.students?.length || 0}
                                                        packageDescription={packageDescription}
                                                        pricePerHour={pricePerHour}
                                                        categoryEquipment={categoryEquipment}
                                                        capacityEquipment={capacityEquipment}
                                                        commissionType={commissionType}
                                                        commissionValue={commissionValue}
                                                        status={tx.event.status}
                                                        schoolLogo={null}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 bg-card rounded-2xl border-2 border-dashed border-border text-muted-foreground">
                                No events scheduled.
                            </div>
                        )
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

export function TeacherEventsClient() {
    const { data: teacherUser, schoolHeader } = useTeacherUser();
    const currency = schoolHeader?.currency || "YEN";
    const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
    const [viewMode, setViewMode] = useState<"date" | "all">("date");

    // Date Logic
    const dateObj = new Date(selectedDate + "T00:00:00");
    const today = new Date(getTodayDateString() + "T00:00:00");

    // Formatters
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const dayNumber = dateObj.getDate();
    const monthShort = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

    // Time difference logic
    const diffTime = dateObj.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const isToday = diffDays === 0;

    const formatDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handlePreviousDay = () => {
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(formatDateString(newDate));
    };

    const handleNextDay = () => {
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(formatDateString(newDate));
    };

    const handleToday = () => {
        setSelectedDate(getTodayDateString());
    };

    // Format relative days badge text
    const showBadge = diffDays !== 0;
    const badgeText =
        diffDays === 1 ? "Tomorrow" : diffDays === -1 ? "Yesterday" : `${diffDays > 0 ? "+" : "-"}${Math.abs(diffDays)}d`;

    // Filter events based on view mode
    const filteredTransactions = useMemo(() => {
        if (viewMode === "all") {
            return teacherUser.transactions;
        }
        return teacherUser.transactions.filter((tx) => {
            const eventDateStr = new Date(tx.event.date).toISOString().split("T")[0];
            return eventDateStr === selectedDate;
        });
    }, [teacherUser.transactions, selectedDate, viewMode]);

    // Sort by time (for single-day view) or keep server sort (for all view)
    const sortedTransactions = useMemo(() => {
        if (viewMode === "date") {
            // For single day, sort by time ascending
            return [...filteredTransactions].sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());
        }
        // For all view, keep server sort (newest dates first)
        return filteredTransactions;
    }, [filteredTransactions, viewMode]);

    // Calculate stats for the day
    const stats = useMemo(() => {
        let totalDuration = 0;
        let totalEarning = 0;
        let completedCount = 0;

        sortedTransactions.forEach((tx) => {
            totalDuration += tx.event.duration;
            totalEarning += tx.financials.teacherEarnings;

            if (tx.event.status === "completed") {
                completedCount++;
            }
        });

        return {
            eventCount: sortedTransactions.length,
            completedCount,
            totalDuration,
            totalHours: totalDuration / 60,
            totalEarning,
        };
    }, [sortedTransactions]);

    // Calculate counts for toggle
    const allEventsCount = teacherUser.transactions.length;
    const dateEventsCount = useMemo(() => {
        return teacherUser.transactions.filter((tx) => {
            const eventDateStr = new Date(tx.event.date).toISOString().split("T")[0];
            return eventDateStr === selectedDate;
        }).length;
    }, [teacherUser.transactions, selectedDate]);

    // Group events by date for "all" view
    const eventsByDate = useMemo(() => {
        const groups = new Map<string, typeof sortedTransactions>();

        sortedTransactions.forEach((tx) => {
            const dateStr = new Date(tx.event.date).toISOString().split("T")[0];
            if (!groups.has(dateStr)) {
                groups.set(dateStr, []);
            }
            groups.get(dateStr)!.push(tx);
        });

        return Array.from(groups.entries()).map(([date, transactions]) => ({ date, transactions }));
    }, [sortedTransactions]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">My Schedule</h2>
                <div className="text-sm text-muted-foreground">{teacherUser.transactions.length} scheduled events</div>
            </div>

            <div className="flex items-center gap-6 py-3 px-4 bg-card rounded-xl border border-border">
                <ToggleSwitch
                    value={viewMode}
                    onChange={(value) => setViewMode(value as "date" | "all")}
                    values={{ left: "date", right: "all" }}
                    counts={{ date: dateEventsCount, all: allEventsCount }}
                    showLabels={true}
                    tintColor="#16610e"
                />
                <div className="flex items-center gap-6">
                    <StatItemUI type="events" value={`${stats.completedCount}/${stats.eventCount}`} hideLabel={false} iconColor={false} />
                    <StatItemUI type="duration" value={stats.totalDuration} hideLabel={false} iconColor={false} />
                    <StatItemUI type="commission" value={stats.totalEarning} hideLabel={false} variant="primary" iconColor={false} />
                </div>
            </div>

            {viewMode === "date" && (
                <DatePicker
                    selectedDate={selectedDate}
                    onPreviousDay={handlePreviousDay}
                    onNextDay={handleNextDay}
                    onToday={handleToday}
                    dayNumber={dayNumber}
                    monthShort={monthShort}
                    dayName={dayName}
                    showBadge={showBadge}
                    badgeText={badgeText}
                    isToday={isToday}
                />
            )}

            <EventList
                viewMode={viewMode}
                selectedDate={selectedDate}
                sortedTransactions={sortedTransactions}
                eventsByDate={eventsByDate}
                currency={currency}
            />
        </div>
    );
}