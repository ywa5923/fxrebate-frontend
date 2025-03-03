"use client"
import {createContext,useContext,ReactNode} from "react";

export const TranslationContext = createContext({});

export type Translations = Record<string, string>;
type TranslationProviderProps = {
    children: ReactNode;
    translations: Translations;

}
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