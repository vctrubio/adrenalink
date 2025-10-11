"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ToggleTheme() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex gap-2"><div className="px-4 py-2 bg-gray-200 rounded">Light</div><div className="px-4 py-2 bg-gray-200 rounded">Dark</div></div>;
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setTheme("light")}
        className={`px-4 py-2 rounded ${theme === "light" ? "border-2 border-black" : ""}`}
      >
        Light
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`px-4 py-2 rounded ${theme === "dark" ? "border-2 border-black dark:border-white" : ""}`}
      >
        Dark
      </button>
    </div>
  );
}
