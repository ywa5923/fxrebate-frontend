import { Inter, Roboto } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  preload: true,
});

export const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["100", "300", "400", "500", "700", "900"],
  preload: true,
});

export const satoshi = localFont({
  fallback: ["sans-serif"],
  src: [
    {
      path: "./../../public/fonts/Satoshi-Black.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "./../../public/fonts/Satoshi-Bold.woff2",
      weight: "bold",
      style: "normal",
    },
    {
      path: "./../../public/fonts/Satoshi-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./../../public/fonts/Satoshi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./../../public/fonts/Satoshi-Regular.woff2",
      weight: "normal",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  preload: true,
});
