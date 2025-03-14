import { IFadeIn } from "./types";

export const fadeIn = ({
  direction,
  type,
  delay,
  duration,
  value,
  ease,
}: IFadeIn) => ({
  hidden: {
    x: direction === "left" ? value : direction === "right" ? -value : 0,
    y: direction === "up" ? value : direction === "down" ? -value : 0,
    opacity: 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type,
      delay,
      duration,
      ease,
    },
  },
});

export const opacityAnimation = ({
  delay,
  duration,
}: {
  delay: number;
  duration: number;
}) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      type: "spring",
      delay: delay,
      duration: duration,
      ease: "easeOut",
    },
  },
});