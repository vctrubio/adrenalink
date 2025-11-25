export const BOOKING_BAR_CHART_CONFIG = {
    scales: {
        eventsCount: { min: 0, max: 12 },
        durationHours: { min: 0, max: 18 },
        paymentsCount: { min: 0, max: 3 },
    },
    colors: {
        events: "#06b6d4",      // cyan (event entity color)
        duration: "#7dd3fc",    // sky blue (lesson entity color)
        payments: "#78716c",    // stone (payment entity color)
        selected: "#3b82f6",    // blue (booking entity color)
    },
    barHeight: 40, // pixels
    iconSize: 24,  // pixels
};
