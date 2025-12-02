"use client";

import type { BookingModel } from "@/backend/models";
import { BookingStats } from "@/getters/bookings-getter";
import BankIcon from "@/public/appSvgs/BankIcon";

export function BookingStatsColumns({ booking }: { booking: BookingModel }) {
    const revenue = BookingStats.getMoneyIn(booking);
    const teacherPayments = BookingStats.getTeacherPayments(booking);
    const studentPayments = BookingStats.getStudentPayments(booking);
    const teacherCommissions = BookingStats.getTeacherCommissions(booking);
    const netProfit = BookingStats.getNetProfit(booking);

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Booking Statistics</h2>
            <div className="flex justify-around gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BankIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">${revenue}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BankIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Teacher Payments</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">${teacherPayments}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BankIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Teacher Commissions</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">${Math.round(teacherCommissions)}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BankIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Student Payments</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">${studentPayments}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BankIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Net Profit</p>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: netProfit >= 0 ? "#10b981" : "#ef4444" }}>
                        ${Math.round(netProfit)}
                    </p>
                </div>
            </div>
        </div>
    );
}
