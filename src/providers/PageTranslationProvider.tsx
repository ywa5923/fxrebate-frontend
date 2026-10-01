"use client";

import { useMemo, type ReactNode } from "react";
import { useParams, usePathname } from "next/navigation";
import { TranslationProvider, useTranslation } from "@/providers/translations";
import { prepareTranslations, type TranslationContextInfo } from "@/lib/translations";

type Props = {
  translations: Record<string, string>;
  children: ReactNode;
  context?: TranslationContextInfo;
};

const EMPTY_CONTEXT: TranslationContextInfo = {};

export default function PageTranslationProvider({ translations, children, context = EMPTY_CONTEXT }: Props) {
  const page = usePathname();
  const { locale } = useParams<{ locale?: string }>();
  const { translations: layoutTranslations } = useTranslation();
  const routeMaps = layoutTranslations["route-maps"];
  const value = useMemo(() => ({
    ...prepareTranslations(translations, { ...context, page: page ?? context.page, locale: locale ?? context.locale }),
    "route-maps": routeMaps ?? {},
  }), [translations, routeMaps, context, page, locale]);

  return <TranslationProvider translations={value} context={context}>{children}</TranslationProvider>;
}
