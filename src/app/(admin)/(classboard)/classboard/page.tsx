"use client";

import { useClassboardData } from "../ClassboardContext";
import ClientClassboard from "./ClientClassboard";

export default function ClassBoardPage() {
    const data = useClassboardData();
    return <ClientClassboard data={data} />;
}
