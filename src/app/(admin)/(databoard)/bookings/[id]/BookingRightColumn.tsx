import type { BookingModel } from "@/backend/models";
import { BookingContainer } from "@/src/components/ids/BookingContainer";

interface BookingRightColumnProps {
    booking: BookingModel;
    stats: Array<{ label: string; value: string | number; icon?: React.ReactNode }>;
}

export function BookingRightColumn({ booking, stats }: BookingRightColumnProps) {
    return (
        <>
            {stats && stats.length > 0 && (
                <div className="mb-6 rounded-lg border border-border overflow-hidden">
                    <div className="flex flex-wrap">
                        {stats.map((stat, index) => (
                            <div key={index} className="flex-1 min-w-[150px] p-4 bg-muted/20 border-r border-b border-border last:border-r-0">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">{stat.label}</p>
                                <div className="flex items-center gap-4">
                                    {stat.icon && (
                                        <div className="w-6 h-6 text-muted-foreground flex-shrink-0">
                                            {stat.icon}
                                        </div>
                                    )}
                                    <span className="text-lg font-bold text-foreground">{stat.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <BookingContainer booking={booking} />
        </>
    );
}

