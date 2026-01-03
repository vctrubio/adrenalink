"use client";

interface ChalkboardTableProps {
    duration: string;
    price: string | number;
    pph: string | number | null;
    currency: string;
}

/**
 * 90s School Chalkboard Style Table
 * Displays Time | Price | PPH
 */
export function ChalkboardTable({ duration, price, pph, currency }: ChalkboardTableProps) {
    return (
        <div className="w-full bg-[#334155] rounded-lg border-4 border-[#5d4037] shadow-inner p-3 font-mono relative overflow-hidden">
            {/* Chalk dust effect */}
            <div className="absolute inset-0 bg-white/5 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')" }}></div>
            
            <div className="relative z-10 grid grid-cols-3 text-center text-white text-sm">
                {/* Headers */}
                <div className="border-b border-white/20 pb-2 mb-2 font-bold tracking-widest text-[10px] uppercase text-white/50">TIME</div>
                <div className="border-b border-white/20 pb-2 mb-2 font-bold tracking-widest text-[10px] uppercase text-white/50">PRICE ({currency})</div>
                <div className="border-b border-white/20 pb-2 mb-2 font-bold tracking-widest text-[10px] uppercase text-white/50">PPH</div>

                {/* Values */}
                <div className="font-bold py-1 border-r border-white/10">{duration}</div>
                <div className="font-bold py-1 border-r border-white/10">{price}</div>
                <div className="font-bold py-1 text-white/80">{pph || "-"}</div>
            </div>
        </div>
    );
}