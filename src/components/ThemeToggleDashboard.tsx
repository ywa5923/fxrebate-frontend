"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export default function ThemeToggleDashboard() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="flex items-center h-8 w-[130px] rounded-full bg-gray-200 dark:bg-gray-700 p-0.5">
        <div className="flex-1 h-full rounded-full" />
        <div className="flex-1 h-full rounded-full" />
      </div>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <div className="relative flex items-center h-8 rounded-full bg-gray-200 dark:bg-gray-800 p-0.5 cursor-pointer select-none">
      {/* Light option */}
      <button
        onClick={() => setTheme("light")}
        className={`relative z-10 flex items-center gap-1.5 px-3 h-full rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer ${
          !isDark
            ? "text-amber-700"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        <Sun className="h-3.5 w-3.5" />
        <span>Light</span>
      </button>

      {/* Dark option */}
      <button
        onClick={() => setTheme("dark")}
        className={`relative z-10 flex items-center gap-1.5 px-3 h-full rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer ${
          isDark
            ? "text-indigo-300"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <Moon className="h-3.5 w-3.5" />
        <span>Dark</span>
      </button>

      {/* Sliding indicator */}
      <div
        className={`absolute top-0.5 h-[calc(100%-4px)] rounded-full transition-all duration-300 ease-in-out shadow-sm ${
          isDark
            ? "left-[calc(50%+1px)] w-[calc(50%-3px)] bg-gray-700"
            : "left-0.5 w-[calc(50%-1px)] bg-white"
        }`}
      />
    </div>
  )
}
