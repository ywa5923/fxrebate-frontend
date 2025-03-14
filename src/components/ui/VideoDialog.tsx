/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaPlay, FaTimes } from "react-icons/fa";

import { cn } from "@/lib/utils";
type AnimationStyle =
  | "from-bottom"
  | "from-center"
  | "from-top"
  | "from-left"
  | "from-right"
  | "fade"
  | "top-in-bottom-out"
  | "left-in-right-out";

interface HeroVideoProps {
  animationStyle?: AnimationStyle;
  videoSrc: string;
  thumbnailSrc: string;
  thumbnailAlt?: string;
  containerClassName?: string;
  imageClassName?: string;
  wrapperClassName?: string;
}

const animationVariants = {
  "from-bottom": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "from-center": {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  "from-top": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  "from-left": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  "from-right": {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "top-in-bottom-out": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "left-in-right-out": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
};

export function VideoDialog({
  animationStyle = "top-in-bottom-out",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "Video thumbnail",
  containerClassName,
  wrapperClassName,
  imageClassName,
}: HeroVideoProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const selectedAnimation = animationVariants[animationStyle];

  return (
    <div className={cn("relative", containerClassName)}>
      <div className={cn("group relative", wrapperClassName)}>
        <Image
          src={thumbnailSrc}
          alt={thumbnailAlt}
          draggable={false}
          onLoad={() => setLoading(false)}
          loading="lazy"
          decoding="async"
          placeholder="blur" 
          blurDataURL={typeof thumbnailSrc === "string" ? thumbnailSrc : undefined}
          width={1440}
          height={720}
          className={cn(
            "transition duration-300 w-full h-full object-cover shadow-lg ease-out group-hover:brightness-[0.8]",
            isLoading ? "blur-sm" : "blur-0",
            imageClassName
          )}
        />
        <div className="absolute inset-0 flex scale-[0.9] items-center justify-center rounded-2xl transition-all duration-200 ease-out group-hover:scale-100">
          <button
            aria-label="Play video"
            onClick={() => setIsVideoOpen(true)}
            className="cursor-pointer flex size-20 xs:size-28 items-center justify-center rounded-full bg-primary/10 backdrop-blur-md"
          >
            <span className="relative flex size-16 xs:size-20 scale-100 items-center justify-center rounded-full shadow-md bg-white dark:bg-[#1d2724] transition-all duration-200 ease-out group-hover:scale-[1.2]">
              <FaPlay
                className="size-6 xs:size-8 scale-100 dark:fill-white dark:text-white fill-dark-green-200 text-dark-green-200 transition-transform duration-200 ease-out group-hover:scale-105"
                style={{
                  filter:
                    "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
                }}
              />
            </span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsVideoOpen(false)}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          >
            <motion.div
              {...selectedAnimation}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative mx-4 aspect-video w-full max-w-4xl md:mx-0 md:px-6"
            >
              <motion.button className="absolute -top-12 right-0 md:right-6 rounded-full bg-neutral-900/50 p-2 ring-1 ring-white/50 dark:ring-black/50 backdrop-blur-md dark:bg-white/50">
                <FaTimes className="size-5 text-xl text-white dark:text-black" />
              </motion.button>
              <div className="relative isolate z-[1] size-full overflow-hidden rounded-2xl border border-white/50 dark:border-dark-green-200">
                <iframe
                  src={videoSrc}
                  className="size-full rounded-2xl"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
