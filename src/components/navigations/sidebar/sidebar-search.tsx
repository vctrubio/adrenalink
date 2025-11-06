"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useSidebar } from "./sidebar";
import { ENTITY_DATA } from "../../../../config/entities";

type SearchEntityType = "student" | "teacher";

export function SidebarSearch() {
    const { collapsed } = useSidebar();
    const [searchQuery, setSearchQuery] = useState("");
    const [entityType, setEntityType] = useState<SearchEntityType>("student");

    if (collapsed) return null;

    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");

    const StudentIcon = studentEntity?.icon;
    const TeacherIcon = teacherEntity?.icon;

    const toggleEntityType = () => {
        setEntityType(entityType === "student" ? "teacher" : "student");
    };

    return (
        <div className="px-4 pb-4">
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${entityType}...`}
                    className={`w-full h-10 pl-10 pr-12 border-b border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-transparent transition-colors ${entityType === "student" ? "focus:ring-yellow-500" : "focus:ring-green-500"
                        }`}
                />
                <button onClick={toggleEntityType} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted/70 transition-colors cursor-pointer" title={`Switch to ${entityType === "student" ? "teacher" : "student"}`}>
                    {entityType === "student" && StudentIcon && <StudentIcon className="w-5 h-5 text-yellow-500" />}
                    {entityType === "teacher" && TeacherIcon && <TeacherIcon className="w-5 h-5 text-green-500" />}
                </button>
            </div>
        </div>
    );
}
