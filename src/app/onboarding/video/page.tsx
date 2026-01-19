"use client";

import MuxPlayer from "@mux/mux-player-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

const MUX_PLAYBACK_ID = process.env.NEXT_PUBLIC_MUX_ONBOARDING_PLAYBACK_ID || "I0157009OTGhwluo029qpc02ye020152p01J9xDZc1E1fobuxc";

export default function VideoPage() {
    const [error, setError] = useState<string | null>(null);

    // Validate playback ID format
    if (!MUX_PLAYBACK_ID || MUX_PLAYBACK_ID.trim() === "") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Video playback ID is not configured.</p>
                    <Link href="/onboarding" className="text-primary hover:underline mt-4 inline-block">
                        Back to Onboarding
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="w-full border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        href="/onboarding"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Onboarding</span>
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                        Onboarding - First Steps into Administration
                    </h1>
                </div>
            </div>

            {/* Video Player */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-6xl"
                >
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-border shadow-2xl bg-black">
                        <MuxPlayer
                            playbackId={MUX_PLAYBACK_ID}
                            streamType="on-demand"
                            metadata={{
                                video_title: "Onboarding - First Steps into Administration",
                            }}
                            autoPlay={false}
                            muted={false}
                            onError={(e: any) => {
                                console.error("Mux Player Error:", e);
                                setError("Failed to load video. Please check the playback ID or try again later.");
                            }}
                            style={{ width: "100%", height: "100%" }}
                        />
                    </div>
                    {error && (
                        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg pointer-events-auto">
                            <p className="text-sm text-destructive font-medium">Error loading video</p>
                            <p className="text-xs text-muted-foreground mt-1">{error}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Please verify the playback ID in your Mux dashboard. Make sure the video has finished processing.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
