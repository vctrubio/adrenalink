import { ReactNode } from "react";

interface EntityIdLayoutProps {
    header: ReactNode;
    leftColumn: ReactNode;
    rightColumn: ReactNode | null;
}

export function EntityIdLayout({ header, leftColumn, rightColumn }: EntityIdLayoutProps) {
    return (
        <div className="space-y-8">
            {header}
            
            {/* Mobile Layout */}
            <div className="lg:hidden space-y-6">
                <div className="bg-card p-6 space-y-6">
                    {leftColumn}
                </div>
                <div className="space-y-4">
                    {rightColumn}
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="col-span-4">
                        <div className="sticky top-8">
                            <div className="bg-card p-6 space-y-6">
                                {leftColumn}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-span-8 space-y-4">
                        {rightColumn}
                    </div>
                </div>
            </div>
        </div>
    );
}

