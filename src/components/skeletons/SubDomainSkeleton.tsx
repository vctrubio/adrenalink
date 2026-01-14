import Image from "next/image";

export const SubDomainSkeleton = () => {
    return (
        <div className="min-h-screen h-screen bg-[#f8f9fa] flex flex-col items-center p-4 md:p-8 overflow-hidden overscroll-none text-zinc-900">
            {/* Main Portal Container Skeleton */}
            <div className="w-full max-w-[1600px] flex-1 bg-white border border-zinc-200 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative">
                {/* 1. Banner Section Skeleton */}
                <div className="relative w-full h-64 md:h-96 shrink-0 bg-zinc-100 flex items-center justify-center overflow-hidden border-b border-zinc-200">
                    <div className="opacity-20 grayscale">
                        <Image src="/ADR.webp" alt="Loading..." width={120} height={120} priority />
                    </div>
                </div>

                {/* 2. Profile Info Bar Skeleton */}
                <div className="relative px-6 md:px-10 pt-2 pb-4 bg-zinc-50 shrink-0 border-b border-zinc-100">
                    <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-2">
                        {/* School Icon Skeleton */}
                        <div className="z-10 flex-shrink-0">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-[6px] border-white bg-zinc-200 shadow-xl animate-pulse" />
                        </div>

                        {/* Name & Categories Skeleton */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-2 w-full max-w-lg">
                            <div className="h-8 md:h-10 w-3/4 bg-zinc-200 rounded-lg animate-pulse" />
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                <div className="h-8 w-24 bg-zinc-200 rounded-lg animate-pulse" />
                                <div className="h-8 w-20 bg-zinc-200 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Content Area Skeleton */}
                <div className="flex-1 bg-white/50 backdrop-blur-3xl overflow-hidden flex flex-col p-6 md:p-8">
                    {/* Filter Bar Skeleton */}
                    <div className="flex gap-4 mb-8 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-14 w-32 bg-zinc-100 rounded-2xl border border-zinc-200 animate-pulse" />
                        ))}
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-[4/5] bg-zinc-50 rounded-[2.5rem] border border-zinc-100 animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
