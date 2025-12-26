export interface TimelineStats {
    eventCount: number;
    totalDuration: number;
    totalCommission: number;
    totalRevenue: number;
    // Package specific stats
    packageCount?: number;
    packagePending?: number;
    packageAccepted?: number;
    packageRejected?: number;
    packageTotalNet?: number;
    // Booking specific stats
    bookingCount?: number;
}
