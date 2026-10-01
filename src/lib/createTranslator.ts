import { t as translateText, type TranslationParams } from "./translations";

export type TranslateOptions = {
  params?: TranslationParams;
  fallback?: string;
};

export type Translator = (key: string, options?: TranslateOptions) => string;

/** Bind the dictionary once so callers only provide a key and optional options. */
export function createTranslator(translations: Readonly<Record<string, unknown>>): Translator {
  return (key: string, options: TranslateOptions = {}) =>
    translateText(translations, key, options.params, options);
}
