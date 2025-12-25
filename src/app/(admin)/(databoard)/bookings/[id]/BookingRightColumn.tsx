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
                    <table className="w-full">
                        <tbody>
                            {stats.map((stat, index) => (
                                <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                    <td className="px-4 py-3 border-r border-border">
                                        <div className="flex items-center gap-3">
                                            {stat.icon && (
                                                <div className="w-5 h-5 text-muted-foreground flex-shrink-0">
                                                    {stat.icon}
                                                </div>
                                            )}
                                            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{stat.label}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-base font-bold text-foreground">{stat.value}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <BookingContainer booking={booking} />
        </>
    );
}

