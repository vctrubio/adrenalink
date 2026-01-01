"use client";

import { useState, useEffect } from "react";
import { TeacherSortOrder } from "@/backend/TeacherSortOrder";

let sortOrderInstance: TeacherSortOrder | null = null;

function getSortOrderInstance(): TeacherSortOrder {
  if (!sortOrderInstance) {
    sortOrderInstance = new TeacherSortOrder("teacher-sort-priority");
  }
  return sortOrderInstance;
}

/**
 * Hook to get and listen to teacher sort order changes from localStorage
 * Automatically updates when the order is saved in other components
 */
export function useTeacherSortOrder() {
  const [order, setOrder] = useState<string[]>([]);

  useEffect(() => {
    const instance = getSortOrderInstance();
    setOrder(instance.getOrder());

    // Subscribe to changes
    const unsubscribe = instance.subscribe((newOrder) => {
      setOrder(newOrder);
    });

    return unsubscribe;
  }, []);

  return order;
}

/**
 * Update the global teacher sort order
 * This ensures the update is made to the singleton instance
 * and triggers subscriptions in all listening components
 */
export function updateTeacherSortOrder(ids: string[]) {
  const instance = getSortOrderInstance();
  instance.setOrder(ids);
}
