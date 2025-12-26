"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { TeacherSortOrder } from "@/backend/TeacherSortOrder";

interface TeacherSortOrderContextType {
  order: string[];
  setOrder: (order: string[]) => void;
}

const TeacherSortOrderContext = createContext<TeacherSortOrderContextType | undefined>(undefined);

let sortOrderInstance: TeacherSortOrder | null = null;

function getSortOrderInstance(): TeacherSortOrder {
  if (!sortOrderInstance) {
    sortOrderInstance = new TeacherSortOrder("teacher-sort-priority");
  }
  return sortOrderInstance;
}

export function TeacherSortOrderProvider({ children }: { children: ReactNode }) {
  const [order, setOrderState] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const instance = getSortOrderInstance();
    setOrderState(instance.getOrder());
    setIsInitialized(true);

    const unsubscribe = instance.subscribe((newOrder) => {
      setOrderState(newOrder);
    });

    return unsubscribe;
  }, []);

  const setOrder = (newOrder: string[]) => {
    const instance = getSortOrderInstance();
    instance.setOrder(newOrder);
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <TeacherSortOrderContext.Provider value={{ order, setOrder }}>
      {children}
    </TeacherSortOrderContext.Provider>
  );
}

export function useTeacherSortOrder() {
  const context = useContext(TeacherSortOrderContext);
  if (!context) {
    throw new Error("useTeacherSortOrder must be used within TeacherSortOrderProvider");
  }
  return context;
}
