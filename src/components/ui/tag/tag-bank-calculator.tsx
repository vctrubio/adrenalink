"use client";

import { type ReactNode } from "react";
import { Tag } from "./tag";

interface BankCalculatorTagProps {
    icon: ReactNode;
    moneyIn: number;
    moneyOut: number;
    bgColor: string;
    color: string;
}

export const BankCalculatorTag = ({ icon, moneyIn, moneyOut, bgColor, color }: BankCalculatorTagProps) => {
    const netAmount = moneyIn - moneyOut;
    const formattedAmount = netAmount >= 0 ? `+${netAmount}` : `${netAmount}`;

    return <Tag icon={icon} name={formattedAmount} bgColor={bgColor} borderColorHex={bgColor} color={color} />;
};
