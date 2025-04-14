"use client"
import {createContext,useContext,ReactNode} from "react";

type NestedTranslations = { [key: string]: string };
type TranslationValue = string | ReactNode | { [key: string]: string | ReactNode };
export type Translations = Record<string, TranslationValue>;
export type NavbarTranslations = { [key: string]: string };

type TranslationProviderProps = {
    children: ReactNode;
    translations: Translations;
}

export const TranslationContext = createContext<Translations>({});

export const TranslationProvider:React.FC<TranslationProviderProps> = ({children, translations}) => {
    
    return(
        <TranslationContext.Provider value={translations}>
            {children}
        </TranslationContext.Provider>

    )
}

export const useTranslation = () => {
    const context = useContext(TranslationContext);
    if (!context) {
      throw new Error("useTranslation must be used within a TranslationProvider");
    }
    return context;
  };