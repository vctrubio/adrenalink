/**
 * Rainbow Entities - Single source of truth from @docs/manual.md
 * Defines all entities with their rainbow shades, descriptions, schema, and colors
 */

import type { EntityConfig } from "@/types/rainbow-types";
import AdminIcon from "../public/appSvgs/AdminIcon.jsx";
import LinkIcon from "../public/appSvgs/LinkIcon.jsx";
import HelmetIcon from "../public/appSvgs/HelmetIcon.jsx";
import PackageIcon from "../public/appSvgs/PackageIcon.jsx";
import RequestIcon from "../public/appSvgs/RequestIcon.jsx";
import HeadsetIcon from "../public/appSvgs/HeadsetIcon.jsx";
import HandshakeIcon from "../public/appSvgs/HandshakeIcon.jsx";
import BookingIcon from "../public/appSvgs/BookingIcon.jsx";
import LessonIcon from "../public/appSvgs/LessonIcon.jsx";
import FlagIcon from "../public/appSvgs/FlagIcon.jsx";
import EquipmentIcon from "../public/appSvgs/EquipmentIcon.jsx";
import RepairIcon from "../public/appSvgs/RepairIcon.jsx";

export const RAINBOW_COLORS: Record<string, { fill: string; hoverFill: string }> = {
  "purple-1": { fill: "#a855f7", hoverFill: "#d946ef" },
  "purple-2": { fill: "#c084fc", hoverFill: "#e879f9" },
  "blue-1": { fill: "#3b82f6", hoverFill: "#1d4ed8" },
  "blue-2": { fill: "#60a5fa", hoverFill: "#93c5fd" },
  "blue-3": { fill: "#93c5fd", hoverFill: "#3b82f6" },
  "green-1": { fill: "#22c55e", hoverFill: "#16a34a" },
  "green-2": { fill: "#4ade80", hoverFill: "#22c55e" },
  "yellow-1": { fill: "#eab308", hoverFill: "#ca8a04" },
  "orange-1": { fill: "#f97316", hoverFill: "#ea580c" },
  "orange-2": { fill: "#fb923c", hoverFill: "#f97316" },
  "red-0": { fill: "#ef4444", hoverFill: "#dc2626" },
  "grey-1": { fill: "#6b7280", hoverFill: "#4b5563" },
  "grey-2": { fill: "#9ca3af", hoverFill: "#6b7280" },
};

export const RAINBOW_ENTITIES: EntityConfig[] = [
  // Grey entities
  {
    id: "school",
    name: "Schools",
    shadeId: "grey-1",
    icon: AdminIcon,
    info: {
      description: "Sign up via the Welcome Form. Register your Instagram, website, contact details and googlePlaceId so we can boost your X. We provide you with a subdomain within us, where you will have your own personal space. Make sure to add an Icon and Banner for style. Usernames, or subdomains, are unique, so first come first serve.",
      schema: {
        username: "string",
        name: "string",
        country: "string",
        currency: "string",
        phone: "string",
        googlePlaceId: "string",
        instagram: "string",
        website: "string",
      },
      rows: [["hostel", "Tarifa Kite Hostel", "Spain", "EUR", "+34 723 828 282", "abcshdd888", "@myfitskitetarifa", "tkhhostel.com"]],
    },
  },
  {
    id: "referral",
    name: "Referrals",
    shadeId: "grey-2",
    icon: LinkIcon,
    info: {
      description: "Start by adding referrals - this is anyone that has permission/access to give discounts, or simply point someone your way. Wouldn't it be nice that by the end of the year, you know how hard or soft someone has worked? Give someone a code so they can share, and decide how much percentage discount the student receives.",
      schema: {
        codeHexa: "string",
        description: "string",
        commission: "string",
      },
      rows: [["WATERMAN69", "Early pack discount for semi private lessons", "10% off"]],
    },
  },

  // Red entities
  {
    id: "rental",
    name: "Rentals",
    shadeId: "red-0",
    icon: HelmetIcon,
    info: {
      description: "Rentals can be new users looking to rent, or students who been marked safe for independent riding. Either way, you trust them to make reservations to your equipment, while we track everything. The price per hour (pph) is defined in your package.",
      schema: {
        name: "string",
        date: "string",
        duration: "string",
        equipmentId: "string",
        pph: "string",
      },
      rows: [["Jose", "Nov 14 16:00", "2h", "Reach12", "45"]],
    },
  },

  // Orange entities
  {
    id: "schoolPackage",
    name: "Packages",
    shadeId: "orange-1",
    icon: PackageIcon,
    info: {
      description: "Here is your priceboard, where we configure what courses you want to sell, or what rental equipment you have to offer. You decide if you want the public to see, or if it's only for internal view. Either way, this is the entry to creating a booking.",
      schema: {
        description: "string",
        duration: "string",
        pricePerStudent: "string",
        capacity: "string",
        equipmentCapacity: "string",
        public: "string",
      },
      rows: [["Zero to Hero", "8h", "450", "2", "1 Kite", "Yes"]],
    },
  },
  {
    id: "studentPackage",
    name: "Requests",
    shadeId: "orange-2",
    icon: RequestIcon,
    info: {
      description: "As users browse your site, they can make a request for one of your package offers. Lets say Miguel liked your Zero to Hero, and wants to start learning how to kite, he would simply click and apply. You would now receive data inside your dashboard.",
      schema: {
        name: "string",
        date: "string",
        package: "string",
      },
      rows: [["Miguel", "24-12-2025 to 28-12-2025", "Zero to Hero"]],
    },
  },

  // Yellow entities
  {
    id: "student",
    name: "Students",
    shadeId: "yellow-1",
    icon: HelmetIcon,
    info: {
      description: "Miguel got lucky, he's ready to start on christmas eve. All students fill out a welcome form, where they provide you with personal details, and receive an invitation to the app.",
      schema: {
        fullName: "string",
        country: "string",
        passport: "string",
        languages: "string",
        email: "string",
      },
      rows: [["Miguel Hernansanz", "Spain", "ABC834712", "Spanish & French", "miguelon@gmail.com"]],
    },
  },

  // Green entities
  {
    id: "teacher",
    name: "Teachers",
    shadeId: "green-2",
    icon: HeadsetIcon,
    info: {
      description: "Create teachers and manage their profiles. Teachers are assigned to lessons and earn commissions based on their rates.",
      schema: {
        fullName: "string",
        username: "string",
        languages: "string",
      },
      rows: [["Titor Rito", "titor", "Spanish, French, English"]],
    },
  },
  {
    id: "commission",
    name: "Commissions",
    shadeId: "green-1",
    icon: HandshakeIcon,
    info: {
      description: "You assign a commission rate to a teacher in their profile. A commission consists of a value, with a type: percentage based or fixed based salary. Together they define how much a teacher will earn through each lesson plan.",
      schema: {
        username: "string",
        commission: "string",
        description: "string",
      },
      rows: [["lila", "25%", "Commission based"]],
    },
  },

  // Blue entities
  {
    id: "booking",
    name: "Bookings",
    shadeId: "blue-3",
    icon: BookingIcon,
    info: {
      description: "Bookings are the centerpiece of this application. A booking shows the total hours, the number of students, what equipment they will use, how many days they have to complete, and which teacher should we assign.",
      schema: {
        dates: "string",
        students: "string",
        package: "string",
        referralCode: "string",
      },
      rows: [["24-12-2025 +4 days", "Miguel", "Zero to Hero", "WATERMAN69"]],
    },
  },
  {
    id: "lesson",
    name: "Lessons",
    shadeId: "blue-1",
    icon: LessonIcon,
    info: {
      description: "Assign a teacher to a booking and create a lesson plan. This notifies both the student and teacher that a lesson plan has been created.",
      schema: {
        teacher: "string",
        commission: "string",
        bookingId: "string",
      },
      rows: [["Isabel", "21%", "bcd456"]],
    },
  },
  {
    id: "event",
    name: "Events",
    shadeId: "blue-2",
    icon: FlagIcon,
    info: {
      description: "When we want to do the actual lesson planning, this is the core of our operations. The classboard component allows setting and creating classes at ease. We have a controller to orchestrate the time, duration, location of selected dates.",
      schema: {
        date: "string",
        duration: "string",
        students: "string",
        teacher: "string",
        equipment: "string",
        status: "string",
      },
      rows: [["Dec 24 16:00", "2h", "Miguelon", "titor", "Reach 8m", "Completed"]],
    },
  },

  // Purple entities
  {
    id: "equipment",
    name: "Equipment",
    shadeId: "purple-2",
    icon: EquipmentIcon,
    info: {
      description: "Register your stock, then track its activity or injuries. Equipment are attached to packages, and they define what booking, lesson and event was used. Equipment can be for rental, linked to a teacher, free of use, or ready to sell.",
      schema: {
        name: "string",
        type: "string",
        status: "string",
        condition: "string",
      },
      rows: [["Reach 12m", "Kite", "Active", "Good"]],
    },
  },
  {
    id: "repairs",
    name: "Repairs",
    shadeId: "purple-1",
    icon: RepairIcon,
    info: {
      description: "Specifically linked to each equipment id. When something needs repairing, mark the check in, check out, and price. This way, you can see the history, and together with the flight time, it's easy to spot when something needs replacing.",
      schema: {
        date: "string",
        price: "string",
        description: "string",
      },
      rows: [["Dec 25", "75", "Leading edge repair"]],
    },
  },
];
