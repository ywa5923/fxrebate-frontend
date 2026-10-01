"use client"
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useParams, usePathname } from "next/navigation";
import { withTranslationContext, type TranslationContextInfo } from "@/lib/translations";
import { createTranslator } from "@/lib/createTranslator";

type TranslationValue = string | ReactNode | { [key: string]: string | ReactNode };
export type Translations = Record<string, TranslationValue>;
export type NavbarTranslations = { [key: string]: string };

type TranslationProviderProps = {
    children: ReactNode;
    translations: Translations;
    context?: TranslationContextInfo;
}

const EMPTY_CONTEXT: TranslationContextInfo = {};

export const TranslationContext = createContext<Translations | null>(null);

export const TranslationProvider:React.FC<TranslationProviderProps> = ({children, translations, context = EMPTY_CONTEXT}) => {
    const page = usePathname();
    const { locale } = useParams<{ locale?: string }>();
    const value = useMemo(() => withTranslationContext(translations, {
      ...context,
      page: page ?? context.page,
      locale: locale ?? context.locale,
    }), [translations, context, page, locale]);

    return(
        <TranslationContext.Provider value={value}>
            {children}
        </TranslationContext.Provider>

    )
}

export const useTranslation = (section?: string) => {
    const context = useContext(TranslationContext);
    const page = usePathname();
    const { locale } = useParams<{ locale?: string }>();
    return useMemo(() => {
      if (!context) {
        throw new Error("useTranslation must be used within a TranslationProvider");
      }
      const value = section ? context[section] : context;
      const dictionary = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : withTranslationContext({}, { page: page ?? undefined, locale, section });
      return { t: createTranslator(dictionary), translations: context };
    }, [context, section, page, locale]);
  };
