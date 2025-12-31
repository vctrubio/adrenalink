"use client";

import { useClassboardData } from "../../../../providers/classboard-provider";
import ClientClassboard from "../ClientClassboard";

export default function ClassBoardPage() {
    const data = useClassboardData();
    return (
        <div className="border h-full mx-auto max-w-[2699px]">
            <ClientClassboard data={data} />
        </div>
    );
}
