"use client";

import { ReactNode } from "react";

interface DataboardLayoutProps {
    controller: ReactNode;
    children: ReactNode;
}

export function DataboardLayout({ controller, children }: DataboardLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Layout */}
            <div className="lg:hidden">
                <div className="p-4 space-y-4">
                    {controller}
                    <div className="space-y-4">
                        {children}
                    </div>
                    <div className="h-24" />
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-12 gap-8">
                        {/* Controller Sidebar */}
                        <div className="col-span-3">
                            <div className="sticky top-8">{controller}</div>
                        </div>

                        {/* Content Area */}
                        <div className="col-span-9">
                            <div className="space-y-6">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
