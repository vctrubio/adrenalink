"use client";

import { ReactNode } from "react";

interface RegisterFormLayoutProps {
    controller: ReactNode;
    form: ReactNode;
}

export function RegisterFormLayout({ controller, form }: RegisterFormLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Layout */}
            <div className="lg:hidden">
                <div className="p-4 space-y-4">
                    {controller}
                    <div className="bg-card rounded-lg border border-border shadow-sm">
                        <div className="p-6">{form}</div>
                    </div>
                    <div className="h-24" />
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-12 gap-8">
                        {/* Controller Sidebar */}
                        <div className="col-span-4">
                            <div className="sticky top-8">{controller}</div>
                        </div>

                        {/* Form Content */}
                        <div className="col-span-8">
                            <div className="bg-card rounded-xl border border-border shadow-lg">
                                <div className="p-8">{form}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
