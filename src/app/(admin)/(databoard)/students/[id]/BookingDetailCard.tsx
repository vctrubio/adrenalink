"use client";

import PackageIcon from "@/public/appSvgs/PackageIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import type { BookingStatsData, GlobalStatsType } from "@/getters/student-booking-stats-getter";

interface BookingDetailCardProps {
    booking: BookingStatsData | null;
    globalStats: GlobalStatsType;
    isGlobal: boolean;
}

export function BookingDetailCard({ booking, globalStats, isGlobal }: BookingDetailCardProps) {
    // Use booking data if selected, otherwise use global aggregated data
    const displayData = isGlobal
        ? {
              packageDescription: "All Packages",
              packageDurationMinutes: 0,
              packagePricePerHour: 0,
              packageCapacityStudents: 0,
              moneyToPay: globalStats.moneyToPay,
              moneyPaid: globalStats.moneyPaid,
              balance: globalStats.balance,
          }
        : booking!;

    return (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            {/* Package Information */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <PackageIcon size={16} />
                    Package Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <p className="text-muted-foreground">Description</p>
                        <p className="font-medium text-foreground">{displayData.packageDescription}</p>
                    </div>
                    {!isGlobal && (
                        <>
                            <div>
                                <p className="text-muted-foreground">Duration</p>
                                <p className="font-medium text-foreground">{displayData.packageDurationMinutes}min</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Price/Hour</p>
                                <p className="font-medium text-foreground">${displayData.packagePricePerHour}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Students</p>
                                <p className="font-medium text-foreground">{displayData.packageCapacityStudents}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Balance Information */}
            <div className="space-y-2 border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CreditIcon size={16} />
                    Payment Balance
                </h3>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Money to Pay</span>
                        <span className="font-medium text-foreground">${displayData.moneyToPay.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Money Paid</span>
                        <span className="font-medium text-green-600">${displayData.moneyPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border pt-2">
                        <span className="font-semibold text-foreground">Balance</span>
                        <span
                            className="font-bold text-base"
                            style={{
                                color:
                                    displayData.balance < 0
                                        ? "#10b981"
                                        : displayData.balance > 0
                                          ? "#ef4444"
                                          : "#78716c",
                            }}
                        >
                            ${Math.abs(displayData.balance).toFixed(2)}{" "}
                            {displayData.balance < 0 ? "Credit" : displayData.balance > 0 ? "Owed" : ""}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
