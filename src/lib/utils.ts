import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function generateRandomId() {
  return Math.random().toString(36).substring(2, 11);
}

// Dictionary for translated routes
export const pathTranslations: { [key: string]: { [lang: string]: string } }  = {
  dashboard: {
    en: 'dashboard',
    es: 'panel',
    fr: 'tableau-de-bord',
    de: 'dashboard'
  },
  users: {
    en: 'users',
    es: 'usuarios',
    fr: 'utilisateurs',
    de: 'benutzer'
  },
  analytics: {
    en: 'analytics',
    es: 'analitica',
    fr: 'analytique',
    de: 'analytik'
  },
  settings: {
    en: 'settings',
    es: 'ajustes',
    fr: 'parametres',
    de: 'einstellungen'
  }
};

// Create path mapper functions
export function getLocalizedPath(key: string, lang: string) {
  return pathTranslations[key]?.[lang] || key;
}

export function getOriginalPath(translatedPath: string, lang: string) {
  // Find the original key for a translated path
  for (const [key, translations] of Object.entries(pathTranslations)) {
    if (translations[lang] === translatedPath) {
      return key;
    }
  }
  return translatedPath; // Return as is if no translation found
}