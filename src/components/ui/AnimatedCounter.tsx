"use client";

import { useEffect, useRef, useState } from "react";
import { useSpring, motion, useTransform } from "framer-motion";
import { getCompactNumber } from "@/getters/integer-getter";

interface AnimatedCounterProps {
    value: number | string;
    formatter?: (num: number) => string;
}

export function AnimatedCounter({ value, formatter = getCompactNumber }: AnimatedCounterProps) {
    // If it's not a number (e.g. currency string "12.50" or text), try to parse it
    const numericValue = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
    const isNumber = !isNaN(numericValue);

    // Spring for smooth animation
    const spring = useSpring(isNumber ? numericValue : 0, { mass: 0.8, stiffness: 75, damping: 15 });
    const displayValue = useTransform(spring, (current) => {
        if (!isNumber) return value;
        if (formatter) return formatter(Math.round(current));
        return Math.round(current).toLocaleString();
    });

    useEffect(() => {
        if (isNumber) {
            spring.set(numericValue);
        }
    }, [numericValue, spring, isNumber]);

    if (!isNumber) {
        return <span>{value}</span>;
    }

    return <motion.span>{displayValue}</motion.span>;
}
