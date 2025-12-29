// Debug utility with environment-controlled logging for performance testing
// Enable via .env.local: DEBUG_PERFORMANCE=true, DEBUG_DB_QUERIES=true, DEBUG_CACHE=true, DEBUG_RENDER=true

const isProduction = process.env.NODE_ENV === "production";

export const debug = {
    performance: (label: string, duration: number, details?: Record<string, any>) => {
        if (isProduction) return;
        if (process.env.DEBUG_PERFORMANCE !== "true") return;

        const color = duration > 1000 ? "🔴" : duration > 500 ? "🟡" : "🟢";
        console.log(`${color} [PERF] ${label}: ${duration}ms`, details ? JSON.stringify(details) : "");
    },

    query: (label: string, duration: number, details?: Record<string, any>) => {
        if (isProduction) return;
        if (process.env.DEBUG_DB_QUERIES !== "true") return;

        const color = duration > 1000 ? "🔴" : duration > 500 ? "🟡" : "🟢";
        console.log(`${color} 🗄️ [QUERY] ${label}: ${duration}ms`, details ? JSON.stringify(details) : "");
    },

    cache: (label: string, hit: boolean, details?: Record<string, any>) => {
        if (isProduction) return;
        if (process.env.DEBUG_CACHE !== "true") return;

        const icon = hit ? "✅" : "❌";
        console.log(`${icon} [CACHE] ${label}: ${hit ? "HIT" : "MISS"}`, details ? JSON.stringify(details) : "");
    },

    render: (component: string, duration: number) => {
        if (isProduction) return;
        if (process.env.DEBUG_RENDER !== "true") return;

        const color = duration > 1000 ? "🔴" : duration > 500 ? "🟡" : "🟢";
        console.log(`${color} 🎨 [RENDER] ${component}: ${duration}ms`);
    },

    warn: (message: string, details?: Record<string, any>) => {
        if (isProduction) return;
        console.warn(`⚠️ ${message}`, details ? JSON.stringify(details) : "");
    },
};

// Wrapper function to track async operation performance with automatic thresholds
export async function trackPerformance<T>(
    label: string,
    fn: () => Promise<T>,
    warnThreshold = 1000
): Promise<T> {
    const start = Date.now();

    try {
        const result = await fn();
        const duration = Date.now() - start;

        debug.performance(label, duration);

        if (duration > warnThreshold && process.env.DEBUG_PERFORMANCE === "true") {
            console.warn(`⚠️ SLOW OPERATION: ${label} took ${duration}ms (threshold: ${warnThreshold}ms)`);
        }

        return result;
    } catch (error) {
        const duration = Date.now() - start;
        console.error(`❌ ERROR in ${label} after ${duration}ms:`, error);
        throw error;
    }
}
