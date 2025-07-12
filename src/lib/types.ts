import { AnimationProps } from "framer-motion";
import { ReactNode } from "react";

export interface ImageSlider {
  id: string;
  name: string;
  href: string;
  darkIcon?: string;
  lightIcon: string;
}

export interface IFadeIn {
  direction: string;
  type?: string;
  delay?: number;
  duration: number;
  value: number;
  ease?: string;
}

export type WindowSize = {
  width: number | undefined;
  height: number | undefined;
};

export type CardType = {
  id: string;
  title: string;
  description: string;
  className: string;
  tagContent?: string;
  button?: {
    text: string;
    iconImage: string;
    href: string;
  };
};

export type BeamType = {
  top: number;
  left: number;
  transition?: AnimationProps["transition"];
};

export interface StatProps {
  itemsCount: number;
  idx: number;
  num: number;
  prevSuffix?: string;
  nextSuffix: string;
  decimals?: number;
  subheading: string;
}

export interface LanguageItem {
  id: string;
  name?: string;
  flagIcon: string;
  code: string;
}

