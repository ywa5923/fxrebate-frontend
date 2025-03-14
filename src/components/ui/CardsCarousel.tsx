"use client";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import Image, { ImageProps } from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { FaXmark } from "react-icons/fa6";
import { HiArrowSmLeft, HiArrowSmRight } from "react-icons/hi";

import { cn } from "@/lib/utils";
import { useOutsideClick, useWindowSize } from "@/lib/hooks";
import InViewContainer from "../InViewContainer";
import { fadeIn, opacityAnimation } from "@/lib/motions";

interface CarouselProps {
  items: React.ReactNode[];
  initialScroll?: number;
}

type Card = {
  id: string;
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => { },
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const gap = 16;
  const [cardWidth, setCardWidth] = useState<number>(0);

  const { width } = useWindowSize();

  useEffect(() => {
    if (carouselRef.current && width) {
      const updatedCardWidth =
        width && width < 400 ? 270 : width && width < 768 ? 288 : 384;
      setCardWidth(updatedCardWidth);
    }
  }, [carouselRef.current, width]);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: -cardWidth - gap,
        behavior: "smooth",
      });
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: cardWidth + gap,
        behavior: "smooth",
      });
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth =
        width && width < 400 ? 270 : width && width < 768 ? 288 : 384;
      const gap = 16;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <InViewContainer amount={0.1} className="relative max-w-8xl mx-auto px-6 lg:px-10 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-7">
          <motion.h2
            variants={fadeIn({ direction: "up", delay: 0.25, duration: 1, value: 25, ease: "easeInOut" })}
            className="max-w-3xl section-title md:!text-left leading-[115%]"
          >
            Would you like to know more about trading?
          </motion.h2>
          <motion.div
            variants={opacityAnimation({ delay: 0.25, duration: 1.25 })}
            className="flex gap-2"
          >
            <button
              aria-label="Previous card"
              className={cn(
                "p-2.5 rounded-sm flex items-center justify-center group/button",
                canScrollLeft
                  ? "cursor-pointer bg-accent"
                  : "bg-white-200 dark:bg-dark-gray-200"
              )}
              onClick={scrollLeft}
              disabled={!canScrollLeft}
            >
              <HiArrowSmLeft
                className={cn(
                  "h-5 w-5 group-hover/button:rotate-12 transition-transform duration-300",
                  canScrollLeft ? "text-white" : ""
                )}
              />
            </button>
            <button
              aria-label="Next card"
              className={cn(
                "p-2.5 rounded-sm flex items-center justify-center group/button",
                canScrollRight
                  ? "cursor-pointer bg-accent"
                  : "bg-white-200 dark:bg-dark-gray-200"
              )}
              onClick={scrollRight}
              disabled={!canScrollRight}
            >
              <HiArrowSmRight
                className={cn(
                  "h-5 w-5 group-hover/button:-rotate-12 transition-transform duration-300",
                  canScrollRight ? "text-white" : ""
                )}
              />
            </button>
          </motion.div>
        </div>
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto py-10 md:py-20 scroll-smooth [scrollbar-width:none]"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div className="flex flex-row justify-start gap-4">
            {items.map((item, idx) => (
              <motion.div
                variants={fadeIn({ direction: "up", delay: 0.2 * idx, duration: 1, value: 50, ease: "easeOut" })}
                key={"card" + idx}
                className="rounded-3xl"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </InViewContainer>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: Card;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  const lightGreenGradient = "linear-gradient(180deg, #006A3D 0%, rgba(0, 106, 61, 0.00) 100%)"
  const darkGreenGradient = "linear-gradient(180deg, #004217 0%, rgba(0, 66, 23, 0.00) 100%)"
  const orangeGreenGradient = "linear-gradient(180deg, #B38E36 0%, rgba(179, 142, 54, 0.00) 100%)"

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useOutsideClick(containerRef as React.RefObject<HTMLDivElement>, () =>
    handleClose()
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 h-screen z-[99999] overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-black/80 backdrop-blur-lg h-full w-full fixed inset-0"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="max-w-5xl mx-auto bg-white dark:bg-neutral-900 h-fit z-[60] my-10 p-4 md:p-10 rounded-3xl relative"
            >
              <button
                className="sticky top-4 h-8 w-8 right-0 ml-auto bg-black dark:bg-white rounded-full flex items-center justify-center"
                onClick={handleClose}
              >
                <FaXmark className="h-6 w-6 text-neutral-100 dark:text-neutral-900" />
              </button>
              <motion.p
                layoutId={layout ? `category-${card.title}` : undefined}
                className="text-base font-medium text-black dark:text-white"
              >
                {card.category}
              </motion.p>
              <motion.p
                layoutId={layout ? `title-${card.title}` : undefined}
                className="text-2xl md:text-5xl font-semibold text-neutral-700 mt-4 dark:text-white"
              >
                {card.title}
              </motion.p>
              <div className="py-10">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="cursor-pointer group rounded-[10.5px] bg-gray-100 dark:bg-neutral-900 w-[270px] xxs:w-2xs h-[420px] md:h-[40rem] md:w-96 overflow-hidden flex flex-col items-start justify-start relative z-10"
      >
        <div
          style={{
            background: index % 6 === 0 ? lightGreenGradient
              : index % 6 === 1 ? orangeGreenGradient
                : index % 6 === 2 ? darkGreenGradient
                  : index % 6 === 3 ? lightGreenGradient
                    : index % 6 === 4 ? orangeGreenGradient
                      : darkGreenGradient
          }}
          className="absolute top-0 left-0 h-full w-full z-50"
        />
        <motion.span
          layoutId={layout ? `title-${card.title}` : undefined}
          className="relative z-50 p-8 text-white text-xl md:text-[40px] font-semibold text-left [text-wrap:balance]"
        >
          {card.title}
        </motion.span>
        <BlurImage
          id={card.id}
          src={card.src}
          alt={card.title}
          fill
          className="group-hover:scale-110 transition-all duration-300 object-cover absolute z-10 inset-0"
        />
      </motion.button>
    </>
  );
};

export const BlurImage = ({
  id,
  src,
  className,
  alt,
  ...rest
}: ImageProps) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <Image
      className={cn(
        "transition duration-300",
        isLoading ? "blur-sm" : "blur-0",
        className
      )}
      onLoad={() => setLoading(false)}
      src={src}
      loading="lazy"
      decoding="async"
      blurDataURL={typeof src === "string" ? src : undefined}
      alt={alt + "-" + id}
      {...rest}
    />
  );
};
