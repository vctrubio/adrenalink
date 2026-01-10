"use client";

interface TabItem {
    id: string;
    label: string;
}

interface TabNavbarProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
}

export default function TabNavbar({ tabs, activeTab, onTabChange, className = "" }: TabNavbarProps) {
    return (
        <div className={`flex items-center gap-2 bg-muted p-1 rounded-lg mb-8 w-fit ${className}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
