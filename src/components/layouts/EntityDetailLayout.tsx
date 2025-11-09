"use client";

import { ReactNode } from "react";

interface EntityDetailLayoutProps {
    leftColumn: ReactNode;
    rightColumn: ReactNode;
}

export function EntityDetailLayout({ leftColumn, rightColumn }: EntityDetailLayoutProps) {
    return (
        <div className="p-8">
            <div className="grid grid-cols-12 gap-8">
                {/* Left Column - Main Info */}
                <div className="col-span-4">
                    <div className="space-y-6">{leftColumn}</div>
                </div>

                {/* Right Column - Context/Actions */}
                <div className="col-span-8">
                    <div className="space-y-6 sticky top-8">{rightColumn}</div>
                </div>
            </div>
        </div>
    );
}
