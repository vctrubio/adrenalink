"use client";

import { type StatItem } from "@/src/components/ui/row";

interface DataboardStatsProps {
  stats: StatItem[];
  totalCount?: number;
  isLoading?: boolean;
}

export const DataboardStats = ({ stats, totalCount = 0, isLoading = false }: DataboardStatsProps) => {
  if (isLoading) {
    return (
      <div className="flex gap-3 items-center overflow-x-auto pb-2 px-4 py-3 scrollbar-hide">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 h-20 w-28 bg-gradient-to-br from-muted to-muted/50 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-3 items-center overflow-x-auto pb-2 px-4 py-3 scrollbar-hide">
      {/* Total Count Card - Featured */}
      <div
        className="flex-shrink-0 group cursor-default transition-all duration-300 hover:scale-105"
      >
        <div
          className="h-20 w-28 rounded-lg border-2 p-3 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary/10 to-primary/5"
          style={{
            borderColor: `var(--color-primary, #6366f1)`,
          }}
        >
          <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
            Total
          </div>
          <p className="text-3xl font-black" style={{ color: `var(--color-primary, #6366f1)` }}>
            {totalCount}
          </p>
        </div>
      </div>

      {/* Individual Stat Cards - Baseball Style */}
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex-shrink-0 group cursor-default transition-all duration-300 hover:scale-105"
        >
          <div
            className="h-20 w-28 rounded-lg border border-border/50 backdrop-blur-sm p-3 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
              borderColor: `${stat.color}40`,
            }}
          >
            {/* Icon */}
            <div
              className="flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              style={{ color: stat.color }}
            >
              {stat.icon}
            </div>

            {/* Value */}
            <div className="flex flex-col gap-0.5">
              <p
                className="text-xl font-bold leading-tight"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              {stat.label && (
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-tight">
                  {stat.label}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
