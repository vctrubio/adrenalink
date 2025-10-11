"use client";

import { Home, Code } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-8">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                pathname === "/" ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>

            <Link
              href="/dev"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                pathname === "/dev" ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              <Code size={18} />
              <span>Dev</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
