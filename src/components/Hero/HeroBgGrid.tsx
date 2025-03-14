import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useMounted } from "@/lib/hooks";

export const HeroBgGrid = () => {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted()
  
  if (!mounted) return null;

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 2.5,
        ease: "easeInOut",
      }}
      className="absolute inset-0 z-0 h-full -top-60 md:-top-88"
    >
      <div
        style={{
          backgroundImage: resolvedTheme === "dark" ?
            `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='rgb(31, 24, 24)' %3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`
            : `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='rgb(249, 249, 249)' %3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }}
        className="absolute inset-0 z-0 -top-60 md:-top-88"
      />
      <div className="absolute z-10 bottom-0 h-2 w-full bg-[#FFF] dark:bg-black" />
    </motion.div>
  );
};
