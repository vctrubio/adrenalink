"use client";

import { createContext, ReactNode, useContext } from "react";
import type { DataboardController } from "@/types/databoard";

const DataboardContext = createContext<DataboardController | null>(null);

export function DataboardProvider({ controller, children }: { controller: DataboardController; children: ReactNode }) {
	return (
		<DataboardContext.Provider value={controller}>
			{children}
		</DataboardContext.Provider>
	);
}

export function useDataboardController() {
	const context = useContext(DataboardContext);
	if (!context) {
		throw new Error("useDataboardController must be used within DataboardProvider");
	}
	return context;
}
