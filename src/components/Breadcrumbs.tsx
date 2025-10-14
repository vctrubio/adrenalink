"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  // Extract entity name from path (e.g., /students -> "students")
  const entityName = pathSegments[0];

  // Check if we're in a sub-route (forms, [id], etc.)
  const isSubRoute = pathSegments.length > 1;
  const subRoute = pathSegments[1];

  // Check if we're in form route
  const isFormRoute = subRoute === "form";

  // Check if we're in a dynamic route (ID)
  const isDynamicRoute = subRoute && !isFormRoute && !isNaN(Number(subRoute));

  if (!entityName) return null;

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isSubRoute && (
            <Link
              href={`/${entityName}`}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to {entityName}</span>
            </Link>
          )}

          {!isSubRoute && (
            <div className="text-foreground font-medium capitalize">{entityName}</div>
          )}

          {isFormRoute && (
            <div className="text-foreground font-medium">
              <span className="text-muted-foreground capitalize">{entityName}</span>
              <span className="mx-2">/</span>
              <span>New {entityName.slice(0, -1)}</span>
            </div>
          )}

          {isDynamicRoute && (
            <div className="text-foreground font-medium">
              <span className="text-muted-foreground capitalize">{entityName}</span>
              <span className="mx-2">/</span>
              <span>Details</span>
            </div>
          )}
        </div>

        {!isSubRoute && (
          <Link
            href={`/${entityName}/form`}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add {entityName.slice(0, -1)}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
