"use client";

import { useMemo, type ReactNode } from "react";
import { TranslationProvider, useTranslation } from "@/providers/translations";

type Props = {
  translations: Record<string, string>;
  children: ReactNode;
};

export default function PageTranslationProvider({ translations, children }: Props) {
  const layoutTranslations = useTranslation();
  const routeMaps = layoutTranslations["route-maps"];
  const value = useMemo(() => ({
    ...translations,
    "route-maps": routeMaps ?? {},
  }), [translations, routeMaps]);

  return <TranslationProvider translations={value}>{children}</TranslationProvider>;
}
