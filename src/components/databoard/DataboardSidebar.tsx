"use client";

import { usePathname, useRouter } from "next/navigation";
import { ENTITY_DATA } from "@/config/entities";
import { useState } from "react";

export const DataboardSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extract current entity from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentSegment = pathSegments[0];

  const entityMap: Record<string, string> = {
    "students": "student",
    "teachers": "teacher",
    "bookings": "booking",
    "packages": "schoolPackage",
    "equipments": "equipment",
    "events": "event",
    "rentals": "rental",
    "referrals": "referral",
    "requests": "studentPackage",
    "lessons": "lesson",
    "commissions": "commission",
    "payments": "payment",
    "feedback": "student_lesson_feedback",
    "users": "userWallet",
    "repairs": "repairs",
  };

  const currentEntityId = entityMap[currentSegment];

  // Filter entities to show only those with databoard pages
  const databoardEntities = ENTITY_DATA.filter((entity) =>
    ["student", "teacher", "booking", "schoolPackage", "equipment", "event", "rental", "referral", "studentPackage"].includes(entity.id)
  );

  const handleNavigate = (link: string) => {
    router.push(link);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed bottom-4 left-4 z-50 p-3 bg-background border border-border/50 rounded-full shadow-lg hover:shadow-xl transition-all"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isCollapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-background border-r border-border/50
          transition-all duration-300 ease-in-out z-40
          ${isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 w-72 lg:w-80"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            {!isCollapsed && (
              <h2 className="text-lg font-bold text-foreground">Navigation</h2>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 hover:bg-muted/30 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
            <div className="space-y-1">
              {databoardEntities.map((entity) => {
                const Icon = entity.icon;
                const isActive = currentEntityId === entity.id;
                const link = entity.link;

                return (
                  <button
                    key={entity.id}
                    onClick={() => handleNavigate(link)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-lg
                      transition-all duration-200 group
                      ${isActive
                        ? "bg-muted/30"
                        : "hover:bg-muted/20"
                      }
                      ${isCollapsed ? "justify-center" : ""}
                    `}
                  >
                    {/* Icon Container */}
                    <div
                      className={`
                        flex-shrink-0 p-2 rounded-lg transition-all
                        ${isActive ? "scale-105" : "group-hover:scale-105"}
                      `}
                      style={{
                        backgroundColor: isActive ? `${entity.color}25` : `${entity.color}15`,
                        color: entity.color,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Text */}
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span
                          className={`
                            font-medium truncate
                            ${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}
                          `}
                        >
                          {entity.name}
                        </span>

                        {/* Active Indicator */}
                        {isActive && (
                          <div
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: entity.color }}
                          />
                        )}
                      </div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm font-medium rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                        {entity.name}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Footer - Collapse/Expand Hint */}
          {!isCollapsed && (
            <div className="p-4 border-t border-border/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Click arrows to collapse</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </>
  );
};
