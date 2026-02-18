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
      <div className="flex items-center h-9 w-[140px] rounded-lg border border-gray-200 dark:border-gray-700 p-1">
        <div className="flex-1 h-full rounded-md" />
        <div className="flex-1 h-full rounded-md" />
      </div>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <div className="relative flex items-center h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-[#ffffff] dark:bg-gray-900 p-1 cursor-pointer select-none">
      <button onClick={() => setTheme("light")} className={`relative z-10 flex items-center gap-1.5 px-3 h-full rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${!isDark ? "text-gray-900" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"}`}>
        <Sun className={`h-3.5 w-3.5 ${!isDark ? "text-amber-500" : ""}`} /><span>Light</span>
      </button>
      <button onClick={() => setTheme("dark")} className={`relative z-10 flex items-center gap-1.5 px-3 h-full rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${isDark ? "text-white" : "text-gray-400 hover:text-gray-600"}`}>
        <Moon className={`h-3.5 w-3.5 ${isDark ? "text-blue-400" : ""}`} /><span>Dark</span>
      </button>
      <div className={`absolute top-1 h-[calc(100%-8px)] rounded-md transition-all duration-300 ease-in-out ${isDark ? "left-[calc(50%+2px)] w-[calc(50%-6px)] bg-slate-800 shadow-md" : "left-1 w-[calc(50%-2px)] bg-gray-100 shadow-sm"}`} />
    </div>
  )
}
