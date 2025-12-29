"use client";

import { useClassboardData } from "../ClassboardContext";
import ClientClassboardV2 from "./ClientClassboardV2";

export default function ClassBoardPage() {
    const data = useClassboardData();
    return (
        <div className="h-full mx-auto max-w-[2699px]">
            <ClientClassboardV2 data={data} />
        </div>
    );
}
