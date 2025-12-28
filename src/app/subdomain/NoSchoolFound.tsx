"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WindToggle } from "@/src/components/themes/WindToggle";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

interface School {
    id: string;
    name: string;
    // iconUrl....
}

interface NoSchoolFoundProps {
    schools: //make type
}

export function NoSchoolFound({ schools }: NoSchoolFoundProps) {
    return (<> cards of all schools in rows</>)
}
