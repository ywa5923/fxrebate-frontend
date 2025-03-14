"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowSmRight, HiArrowSmLeft } from "react-icons/hi";

import { cn } from "@/lib/utils";
import { fadeIn } from "@/lib/motions";
import { useMounted, useWindowSize } from "@/lib/hooks";

import { VideoDialog } from "./ui/VideoDialog";
import InViewContainer from "./InViewContainer";

type Testimonial = {
  id: string;
  quote: string;
  name: string;
  userImage: string;
  date: string;
  rating: string;
  videoSrc: string;
};

const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
}) => {
  const mounted = useMounted();

  const { width } = useWindowSize();
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  if (!mounted) return null;

  return (
    <InViewContainer amount={0.1} className="max-w-6xl mx-auto antialiased font-sans px-6 lg:px-10 py-20 overflow-x-hidden">
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-20">
        <motion.div
          variants={fadeIn({ direction: "right", delay: 0.25, duration: 1, value: 75, ease: "easeInOut" })}
          className="relative h-80 sm:h-[470px] w-full"
        >
          <AnimatePresence>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  z: -100,
                  rotate: randomRotateY(),
                }}
                animate={{
                  opacity: isActive(index) ? 1 : 0.7,
                  scale: isActive(index)
                    ? 1
                    : width && width < 768
                      ? 0.88
                      : 0.95,
                  z: isActive(index) ? 0 : -100,
                  rotate: isActive(index) ? 0 : randomRotateY(),
                  zIndex: isActive(index)
                    ? 999
                    : testimonials.length + 2 - index,
                  y: isActive(index) ? [0, -80, 0] : 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  z: 100,
                  rotate: randomRotateY(),
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 origin-bottom"
              >
                <VideoDialog
                  thumbnailSrc={testimonials[active].userImage}
                  videoSrc={testimonials[active].videoSrc}
                  thumbnailAlt={testimonials[active].name}
                  animationStyle="top-in-bottom-out"
                  containerClassName="h-80 sm:h-[470px]"
                  wrapperClassName="h-full"
                  imageClassName="h-full w-full rounded-3xl object-cover object-center"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        <motion.div
          variants={fadeIn({ direction: "left", delay: 0.25, duration: 1, value: 75, ease: "easeInOut" })}
          className="flex flex-col py-4"
        >
          <motion.div
            key={active}
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            <div className="w-full flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2.5 lg:gap-5">
                <Image
                  src={testimonials[active].userImage}
                  alt={testimonials[active].name}
                  width={80}
                  height={80}
                  className="w-14 h-14 lg:w-20 lg:h-20 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-2xl font-medium dark:text-white/50 text-black/50">
                    {testimonials[active].name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/assets/icons/stars.png"
                      alt="stars"
                      width={72}
                      height={15}
                      className="w-18 h-auto object-cover"
                    />
                    <p className="dark:text-white/60 text-black/60 text-xs font-medium capitalize underline">
                      {testimonials[active].rating}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm dark:text-white/50 text-black/50 font-medium">
                {testimonials[active].date}
              </p>
            </div>
            <motion.p
              initial={{
                filter: "blur(10px)",
                opacity: 0,
                y: 5,
              }}
              animate={{
                filter: "blur(0px)",
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
              className="text-lg font-medium capitalize text-black dark:text-white mt-14"
            >
              {testimonials[active].quote}
            </motion.p>
          </motion.div>
          <div className="flex gap-2 pt-24">
            <button
              aria-label="Previous testimonial"
              onClick={handlePrev}
              className={cn(
                "p-2.5 rounded-sm flex items-center justify-center group/button",
                active > 0 ? "cursor-pointer bg-accent" : "bg-white-200 dark:bg-dark-gray-200"
              )}
              disabled={active === 0}
            >
              <HiArrowSmLeft className={cn(
                "h-5 w-5 group-hover/button:rotate-12 transition-transform duration-300",
                active > 0 ? "text-white" : ""
              )}
              />
            </button>
            <button
              aria-label="Next testimonial"
              onClick={handleNext}
              className={cn(
                "p-2.5 rounded-sm flex items-center justify-center group/button",
                active < testimonials.length - 1
                  ? "cursor-pointer bg-accent"
                  : "bg-white-200 dark:bg-dark-gray-200"
              )}
              disabled={active === testimonials.length - 1}
            >
              <HiArrowSmRight className={cn(
                "h-5 w-5 group-hover/button:-rotate-12 transition-transform duration-300",
                active < testimonials.length - 1 ? "text-white" : ""
              )}
              />
            </button>
          </div>
        </motion.div>
      </div>
    </InViewContainer>
  );
};

export default AnimatedTestimonials;
