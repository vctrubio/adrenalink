"use client";

import { motion } from "framer-motion";

export function TableSkeleton() {
    return (
        <div className="space-y-6 w-full max-w-7xl mx-auto p-6">
            {/* Header Skeleton */}
            <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
                <div className="h-12 w-96 bg-muted/20 animate-pulse rounded-2xl" />
                <div className="h-10 w-64 bg-muted/20 animate-pulse rounded-xl" />
            </div>

            {/* Title Skeleton */}
            <div className="space-y-2">
                <div className="h-8 w-48 bg-muted/20 animate-pulse rounded-lg" />
                <div className="h-4 w-96 bg-muted/20 animate-pulse rounded-lg" />
            </div>

            {/* Table Skeleton */}
            <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
                <div className="h-10 bg-muted/10 border-b border-border" />
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex border-b border-border last:border-0 p-4 gap-4">
                        <div className="h-4 w-1/4 bg-muted/10 animate-pulse rounded" />
                        <div className="h-4 w-1/4 bg-muted/10 animate-pulse rounded" />
                        <div className="h-4 w-1/4 bg-muted/10 animate-pulse rounded" />
                        <div className="h-4 w-1/4 bg-muted/10 animate-pulse rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
