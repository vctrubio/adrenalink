"use client";

import { ReactNode } from "react";

interface MasterAdminLayoutProps {
    controller: ReactNode;
    form: ReactNode;
}

export function MasterAdminLayout({ controller, form }: MasterAdminLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Layout */}
            <div className="lg:hidden">
                <div className="p-4 space-y-4">
                    <div className="bg-card p-6 space-y-6">{controller}</div>
                    <div className="space-y-4">{form}</div>
                    <div className="h-24" />
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-12 gap-8">
                        {/* Controller Sidebar */}
                        <div className="col-span-4">
                            <div className="sticky top-8">
                                <div className="bg-card p-6 space-y-6">{controller}</div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="col-span-8 space-y-8">
                            {form}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
