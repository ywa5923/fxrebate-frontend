"use client"

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { FiMoon, FiSun } from "react-icons/fi";
import { useMounted } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { useTranslation } from '@/providers/translations';

interface NavbarTranslations {
  [key: string]: string;
  dark: string;
  light: string;
}

interface Translations {
  navbar: NavbarTranslations;
}

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme()
  const mounted = useMounted()
  const _t = useTranslation() as Translations;
  const navbar = _t.navbar;

  const handleToggle = (): void => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  const isLightTheme = resolvedTheme === "light";
  const buttonTextColor = isLightTheme ? "text-white" : "text-slate-300";
  const sunButtonTextColor = isLightTheme ? "text-black" : "text-white";
  const justifyContent = isLightTheme ? "justify-start" : "justify-end";

  if (!mounted) return null; 

  return (
    <div className="relative flex w-fit items-center rounded-full">
      {["dark", "light"].map((mode) => (
        <button
          key={mode}
          className={cn(
            "text-base font-bold capitalize cursor-pointer flex items-center gap-[9px] px-2.5 py-[5px] transition-colors relative z-10",
            mode === "dark" ? buttonTextColor : sunButtonTextColor
          )}
          onClick={handleToggle}
        >
          {mode === "dark" ? (
            <FiMoon className="relative z-10 text-lg md:text-sm" />
          ) : (
            <FiSun className="relative z-10 text-lg md:text-sm" />
          )}
          <span className="relative z-10 text-base font-bold capitalize">{navbar[mode]}</span>
        </button>
      ))}
      <div className={cn("absolute inset-0 z-0 flex", justifyContent)}>
        <motion.span
          layout
          transition={{ type: "tween", damping: 15 }}
          className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#006A3D] to-[#B38E36]"
        />
      </div>
    </div>
  );
};

export default ThemeToggle;