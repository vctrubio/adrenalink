import { StatItemUI, type StatType } from "@/backend/data/StatsData";

export interface TableStat {
    type: StatType;
    value: string | number;
    label?: string;
    variant?: "default" | "profit";
    desc?: string;
}

export function TablesHeaderStats({ stats }: { stats: TableStat[] }) {
    if (!stats || stats.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center bg-muted/30 rounded-2xl p-1.5 gap-1 border border-border/50 w-fit">
            {stats.map((stat, index) => (
                <div key={index} className="flex items-center">
                    <div className="flex items-center p-2">
                        <StatItemUI type={stat.type} value={stat.value} labelOverride={stat.label} hideLabel={true} variant={stat.variant === "profit" ? "profit" : "default"} iconColor={true} desc={stat.desc} className="text-sm tracking-widest font-black uppercase" />
                    </div>
                    {index < stats.length - 1 && <div className="h-4 w-px bg-border/60 rotate-[25deg] mx-1" />}
                </div>
            ))}
        </div>
    );
}
