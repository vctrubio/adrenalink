import React from "react";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import KiteIcon from "@/public/appSvgs/Equipments/KiteIcon";
import WingIcon from "@/public/appSvgs/Equipments/WingIcon";
import WindsurfIcon from "@/public/appSvgs/Equipments/WindsurfIcon";

export const CSV_DATA = {
    school: {
        title: "Schools",
        icon: AdminIcon,
        description: "Manage your administration with precision. Example data structure for registry.",
        colorClass: "bg-indigo-100",
        iconColorClass: "text-indigo-600",
        headers: ["Name", "Currency", "Country", "Website", "Phone", "Instagram"],
        rows: [
            [
                "Feelviana",
                "EUR",
                "Portugal",
                "feelviana.com",
                "+351258000000",
                <span key="1">
                    <span className="text-secondary">@</span>feelviana
                </span>,
            ],
            [
                "Tarifa Kite",
                "EUR",
                "Spain",
                "tarifakite.es",
                "+34611111111",
                <span key="2">
                    <span className="text-secondary">@</span>tarifakite
                </span>,
            ],
            [
                "Windy City",
                "ZAR",
                "South Africa",
                "windycity.sa",
                "+27210000000",
                <span key="3">
                    <span className="text-secondary">@</span>windy_city
                </span>,
            ],
        ],
        indexData: [
            { col: "Name", type: "String", desc: "Legal entity name", allowed: "Max 255 chars" },
            { col: "Currency", type: "Enum", desc: "Operational currency", allowed: "USD, EUR, CHF" },
            { col: "Country", type: "String", desc: "Physical location", allowed: "Full Country Name" },
            { col: "Website", type: "String", desc: "Online presence", allowed: "URL format (e.g. school.com)" },
            { col: "Phone", type: "String", desc: "Contact number", allowed: "+[Country Code][Number] (No spaces)" },
            { col: "Instagram", type: "String", desc: "Social handle", allowed: "@username" },
        ],
    },
    packages: {
        title: "Packages",
        icon: PackageIcon,
        description: "Flexible pricing. Structure for service offerings.",
        colorClass: "bg-orange-100",
        iconColorClass: "text-orange-600",
        headers: [
            "Type",
            "Name",
            "Equipment",
            "Cap. Equip",
            "Cap. Student",
            <span key="dur">
                Duration <span className="font-normal text-slate-400 normal-case">(Minutes)</span>
            </span>,
            <span key="price">
                Price <span className="font-normal text-slate-400 normal-case">(Currency)</span>
            </span>,
        ],
        rows: [
            ["Lessons", "Kite Beginner", "Kite", 1, 2, 120, 150],
            ["Lessons", "Wing Intro", "Wing", 1, 1, 60, 90],
            ["Lessons", "Pro Session", "Kite", 2, 4, 180, 200],
        ],
        indexData: [
            { col: "Type", type: "Enum", desc: "Service classification", allowed: "lessons, rental" },
            { col: "Name", type: "String", desc: "Public marketing title", allowed: "Max 255 chars" },
            { col: "Equipment", type: "Enum", desc: "Category of gear provided", allowed: "kite, wing, windsurf" },
            { col: "Cap. Equip", type: "Integer", desc: "Required inventory units", allowed: ">= 1" },
            { col: "Cap. Student", type: "Integer", desc: "Max students per session", allowed: ">= 1" },
            { col: "Duration", type: "Integer", desc: "Session length", allowed: "Minutes (e.g. 60, 120)" },
            { col: "Price", type: "Integer", desc: "Cost per student", allowed: "Numeric value (no symbol)" },
        ],
    },
    equipments: {
        title: "Equipments",
        icon: EquipmentIcon,
        description: "Track inventory and assets. Standardized data format.",
        colorClass: "bg-purple-100",
        iconColorClass: "text-purple-600",
        headers: ["Type", "Brand", "Model", "Size", "Color", "SKU"],
        rows: [
            [
                <div key="k1" className="flex items-center gap-2">
                    <KiteIcon size={20} className="text-purple-600" /> Kite
                </div>,
                "North",
                "Orbit",
                9,
                "Red",
                "NTH-ORB-09",
            ],
            [
                <div key="k2" className="flex items-center gap-2">
                    <KiteIcon size={20} className="text-purple-600" /> Kite
                </div>,
                "North",
                "Reach",
                12,
                "Green",
                "NTH-RCH-12",
            ],
            [
                <div key="w1" className="flex items-center gap-2">
                    <WingIcon size={20} className="text-purple-600" /> Wing
                </div>,
                "North",
                "Nova",
                4.7,
                "Blue",
                "NTH-NOV-47",
            ],
            [
                <div key="w2" className="flex items-center gap-2">
                    <WingIcon size={20} className="text-purple-600" /> Wing
                </div>,
                "North",
                "Mode",
                5.3,
                "Black",
                "NTH-MOD-53",
            ],
            [
                <div key="ws1" className="flex items-center gap-2">
                    <WindsurfIcon size={20} className="text-purple-600" /> Windsurf
                </div>,
                "North",
                "Wave",
                3.7,
                "Red",
                "NTH-WAV-37",
            ],
        ],
        indexData: [
            { col: "Type", type: "Enum", desc: "Equipment Category", allowed: "kite, wing, windsurf" },
            { col: "Brand", type: "String", desc: "Manufacturer", allowed: "Max 100 chars" },
            { col: "Model", type: "String", desc: "Product line", allowed: "Max 255 chars" },
            { col: "Size", type: "Float", desc: "Dimensions", allowed: "Meters (Kites/Wings) or CM (Boards)" },
            { col: "Color", type: "String", desc: "Visual identifier", allowed: "Max 100 chars" },
            { col: "SKU", type: "String", desc: "Stock Keeping Unit", allowed: "Unique Identifier" },
        ],
    },
    students: {
        title: "Students",
        icon: HelmetIcon,
        description: "Client database management, for bookings and communication.",
        colorClass: "bg-yellow-100",
        iconColorClass: "text-yellow-600",
        headers: ["First Name", "Last Name", "Passport", "Country", "Phone", "Languages", "Email"],
        rows: [
            ["John", "Doe", "A12345678", "Germany", "+49 123 456 7890", "German, English", "john.doe@example.com"],
            ["Alice", "Smith", "987654321", "UK", "+44 20 1234 5678", "English, French", "alice.smith@example.com"],
        ],
        indexData: [
            { col: "First Name", type: "String", desc: "Student given name", allowed: "Max 255 chars" },
            { col: "Last Name", type: "String", desc: "Student family name", allowed: "Max 255 chars" },
            { col: "Passport", type: "String", desc: "ID / Passport Number", allowed: "Alphanumeric" },
            { col: "Country", type: "String", desc: "Nationality/Residence", allowed: "Full Country Name" },
            { col: "Phone", type: "String", desc: "Contact number", allowed: "+[Country Code] [Number]" },
            { col: "Languages", type: "Array", desc: "Spoken languages", allowed: "Full words (e.g. English, Spanish)" },
            { col: "Email", type: "String", desc: "Links to User Account", allowed: "Valid Email Address" },
        ],
    },
    teachers: {
        title: "Teachers",
        icon: HeadsetIcon,
        description: "Instructor profiles, for payrolls and scheduling.",
        colorClass: "bg-green-100",
        iconColorClass: "text-green-600",
        headers: ["Username", "First Name", "Last Name", "Passport", "Country", "Phone", "Languages", "Email"],
        rows: [
            ["Max", "Max", "Mustermann", "AT9876543", "Austria", "+43 1 2345678", "German, English", "max@instructor.com"],
            ["Sarah", "Sarah", "Connor", "US1234567", "USA", "+1 555 0199", "English", "sarah@instructor.com"],
        ],
        indexData: [
            { col: "Username", type: "String", desc: "System handle", allowed: "Unique identifier (often First Name)" },
            { col: "First Name", type: "String", desc: "Teacher given name", allowed: "Max 255 chars" },
            { col: "Last Name", type: "String", desc: "Teacher family name", allowed: "Max 255 chars" },
            { col: "Passport", type: "String", desc: "ID / Passport Number", allowed: "Alphanumeric" },
            { col: "Country", type: "String", desc: "Nationality/Residence", allowed: "Full Country Name" },
            { col: "Phone", type: "String", desc: "Contact number", allowed: "+[Country Code] [Number]" },
            { col: "Languages", type: "Array", desc: "Spoken languages", allowed: "Full words (e.g. English, Spanish)" },
            { col: "Email", type: "String", desc: "Links to User Account", allowed: "Valid Email Address" },
        ],
    },
};
