"use client";
import { useState } from "react";
import LeftNavigation from "@/src/components/navigations/LeftNavigation";
import { WindToggle } from "@/src/components/themes/WindToggle";
import { InstructionDevPage } from "./InstructionDevPage";
import { SchoolDevPage } from "./SchoolDevPage";
import { StudentDevPage } from "./StudentDevPage";
import { TeachersDevPage } from "./TeachersDevPage";
import { EquipmentDevPage } from "./EquipmentDevPage";
import OpenBookIcon from "@/public/appSvgs/OpenBookIcon.jsx";
import AdminIcon from "@/public/appSvgs/AdminIcon.jsx";
import HelmetIcon from "@/public/appSvgs/HelmetIcon.jsx";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon.jsx";
import { BookmarkIcon } from "lucide-react";

export default function DevPage() {
    const [activePage, setActivePage] = useState("instructions");

    const navigationItems = [
        { id: "instructions", label: "Instructions", icon: <OpenBookIcon className="w-7 h-7" size={28} />, color: "text-blue-500", bgColor: "bg-blue-100" },
        { id: "schools", label: "Schools", icon: <AdminIcon className="w-7 h-7" size={28} />, color: "text-indigo-500", bgColor: "bg-indigo-100" },
        { id: "packages", label: "Packages", icon: <BookmarkIcon className="w-7 h-7" size={28} />, color: "text-orange-400", bgColor: "bg-orange-200" },
        { id: "teachers", label: "Teachers", icon: <HeadsetIcon className="w-7 h-7" size={28} />, color: "text-green-500", bgColor: "bg-green-100" },
        { id: "students", label: "Students", icon: <HelmetIcon className="w-7 h-7" size={28} />, color: "text-yellow-500", bgColor: "bg-yellow-100" },
        { id: "equipment", label: "Equipment", icon: <EquipmentIcon className="w-7 h-7" size={28} />, color: "text-purple-500", bgColor: "bg-purple-100" },
    ];

    const renderPage = () => {
        switch (activePage) {
            case "instructions":
                return <InstructionDevPage />;
            case "schools":
                return <SchoolDevPage />;
            case "students":
                return <StudentDevPage />;
            case "teachers":
                return <TeachersDevPage />;
            case "equipment":
                return <EquipmentDevPage />;
            default:
                return <InstructionDevPage />;
        }
    };

    return (
        <div className="">
            <div className="mx-auto p-8 flex gap-6 justify-center">
                <aside className="w-[28rem] flex-shrink-0 sticky top-8 self-start">
                    <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-6 shadow-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Meet the Team</h2>
                            <WindToggle />
                        </div>
                        <LeftNavigation items={navigationItems} activeItem={activePage} onItemClick={setActivePage} />
                    </div>
                </aside>

                <main className="flex-1 max-w-7xl">{renderPage()}</main>
            </div>
        </div>
    );
}
