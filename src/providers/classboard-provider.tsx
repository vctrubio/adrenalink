"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useMemo } from "react";
import type { ClassboardModel, ClassboardData } from "@/backend/models/ClassboardModel";
import type { ControllerSettings } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import { getTodayDateString } from "@/getters/date-getter";
import { DEFAULT_DURATION_CAP_ONE, DEFAULT_DURATION_CAP_TWO, DEFAULT_DURATION_CAP_THREE } from "@/getters/duration-getter";
import { isDateInRange } from "@/getters/date-getter";

const STORAGE_KEY_DATE = "classboard-selected-date";
const STORAGE_KEY_CONTROLLER = "classboard-controller-settings";

const DEFAULT_CONTROLLER: ControllerSettings = {
    submitTime: "09:00",
    location: "Beach",
    durationCapOne: DEFAULT_DURATION_CAP_ONE,
    durationCapTwo: DEFAULT_DURATION_CAP_TWO,
    durationCapThree: DEFAULT_DURATION_CAP_THREE,
    gapMinutes: 0,
    stepDuration: 30,
    minDuration: 60,
    maxDuration: 180,
};

interface ClassboardContextType {
    classboardModel: ClassboardModel;
    setClassboardModel: (model: ClassboardModel) => void;
    bookingsForSelectedDate: ClassboardData[];
    mounted: boolean;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    controller: ControllerSettings;
    setController: (controller: ControllerSettings) => void;
}

const ClassboardContext = createContext<ClassboardContextType | undefined>(undefined);

interface ClassboardProviderProps {
    children: ReactNode;
    initialClassboardModel: ClassboardModel;
}

export function ClassboardProvider({ children, initialClassboardModel }: ClassboardProviderProps) {
    const [mounted, setMounted] = useState(false);
    const [classboardModel, setClassboardModel] = useState<ClassboardModel>(initialClassboardModel);
    const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
    const [controller, setController] = useState<ControllerSettings>(DEFAULT_CONTROLLER);

    // Filter bookings by selected date - single source of truth
    const bookingsForSelectedDate = useMemo(() => {
        return Object.values(classboardModel).filter((booking) =>
            isDateInRange(selectedDate, booking.booking.dateStart, booking.booking.dateEnd)
        );
    }, [classboardModel, selectedDate]);

    // Initialize from localStorage on mount
    useEffect(() => {
        const storedDate = localStorage.getItem(STORAGE_KEY_DATE);
        if (storedDate) {
            setSelectedDate(storedDate);
        }

        const storedController = localStorage.getItem(STORAGE_KEY_CONTROLLER);
        if (storedController) {
            try {
                const parsed = JSON.parse(storedController) as ControllerSettings;
                setController(parsed);
            } catch (error) {
                console.error("❌ [ClassboardProvider] Failed to parse controller settings:", error);
            }
        }

        setMounted(true);
    }, []);

    // Persist selectedDate to localStorage
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem(STORAGE_KEY_DATE, selectedDate);
    }, [selectedDate, mounted]);

    // Persist controller to localStorage
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem(STORAGE_KEY_CONTROLLER, JSON.stringify(controller));
    }, [controller, mounted]);

    return (
        <ClassboardContext.Provider
            value={{
                classboardModel,
                setClassboardModel,
                bookingsForSelectedDate,
                mounted,
                selectedDate,
                setSelectedDate,
                controller,
                setController,
            }}
        >
            {children}
        </ClassboardContext.Provider>
    );
}

export function useClassboardContext(): ClassboardContextType {
    const context = useContext(ClassboardContext);
    if (!context) {
        throw new Error("useClassboardContext must be used within ClassboardProvider");
    }
    return context;
}
