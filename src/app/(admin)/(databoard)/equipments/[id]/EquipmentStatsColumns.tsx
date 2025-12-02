"use client";

import { getPrettyDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import type { EquipmentModel } from "@/backend/models";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import RepairIcon from "@/public/appSvgs/RepairIcon";

export function EquipmentStatsColumns({ equipment }: { equipment: EquipmentModel }) {
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
    const rentalEntity = ENTITY_DATA.find((e) => e.id === "rental")!;

    const totalEvents = equipment.stats?.events_count || 0;
    const totalDurationMinutes = equipment.stats?.total_duration_minutes || 0;
    const rentalsCount = equipment.stats?.rentals_count || 0;
    const revenue = equipment.stats?.money_in || 0;
    const repairCosts = equipment.stats?.money_out || 0;
    const netProfit = revenue - repairCosts;

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Equipment Statistics</h2>
            <div className="flex justify-around gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FlagIcon className="w-4 h-4" style={{ color: eventEntity.color }} />
                        <p className="text-sm text-muted-foreground">Total Events</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{totalEvents}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <DurationIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Total Duration</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{getPrettyDuration(totalDurationMinutes)}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BankIcon className="w-4 h-4" style={{ color: rentalEntity.color }} />
                        <p className="text-sm text-muted-foreground">Rentals</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{rentalsCount}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BankIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">${revenue}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <RepairIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Repairs</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">${repairCosts}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BankIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Net Profit</p>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: netProfit >= 0 ? "#10b981" : "#ef4444" }}>
                        ${netProfit}
                    </p>
                </div>
            </div>
        </div>
    );
}
