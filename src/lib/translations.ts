import logger from "./logger";

export type TranslationParams = Readonly<Record<string, string | number>>;

export type TranslateOptions = {
  params?: TranslationParams;
  fallback?: string;
};

export type Translator = (key: string, options?: TranslateOptions) => string;

export type TranslationContextInfo = {
  page?: string;
  locale?: string;
  resource?: string;
  section?: string;
  zone?: string | null;
};

type TranslationOptions = {
  fallback?: string;
  context?: TranslationContextInfo;
};

const log = logger.child("lib/translations");
const metadata = new WeakMap<object, {
  context: TranslationContextInfo;
  reportedKeys: Set<string>;
}>();

function isDictionary(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function hasText(translations: Readonly<Record<string, unknown>>): boolean {
  return Object.values(translations).some((value) => typeof value === "string" && value.trim().length > 0);
}

function resolveContext(context: TranslationContextInfo): TranslationContextInfo {
  return {
    ...context,
    page: typeof window !== "undefined" ? window.location.pathname : context.page ?? "unknown",
  };
}

// Keep diagnostic context off the serialized dictionary, isolated per request/provider.
export function withTranslationContext<T extends Readonly<Record<string, unknown>>>(
  translations: T,
  context: TranslationContextInfo,
): T {
  const value = Object.fromEntries(Object.entries(translations).map(([key, entry]) => [
    key,
    isDictionary(entry) && !("$$typeof" in entry)
      ? withTranslationContext(entry, {
          ...context,
          section: context.section ? `${context.section}.${key}` : key,
        })
      : entry,
  ])) as T;
  metadata.set(value, { context: { ...context }, reportedKeys: new Set() });
  return value;
}

export function prepareTranslations(
  value: unknown,
  context: TranslationContextInfo,
): Record<string, string> {
  if (!isDictionary(value) || !hasText(value)) {
    log.error("No usable translations were returned for this page", {
      event: "translations_unavailable",
      description: "The translation section is missing, malformed or contains no non-empty text values.",
      ...resolveContext(context),
    });
    throw new Error(`No valid translations found for ${context.resource ?? "page"} (${context.section ?? "client"})`);
  }

  const texts = Object.fromEntries(Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  ));
  return withTranslationContext(texts, context);
}

/** Reads a text and replaces named placeholders; unspecified parameters stay intact. */
export function t(
  translations: Readonly<Record<string, unknown>>,
  key: string,
  params?: TranslationParams,
  options: TranslationOptions = {},
): string {
  const value = Object.hasOwn(translations, key) ? translations[key] : undefined;
  let template: string;

  if (typeof value === "string" && value.trim().length > 0) {
    template = value;
  } else {
    let state = metadata.get(translations);
    if (!state) {
      state = { context: {}, reportedKeys: new Set() };
      metadata.set(translations, state);
    }
    const context = resolveContext({ ...state.context, ...options.context });
    const empty = !hasText(translations);
    const event = empty ? "translations_unavailable" : "missing_translation";
    const reportKey = JSON.stringify([context, event, empty ? null : key]);

    if (!state.reportedKeys.has(reportKey)) {
      state.reportedKeys.add(reportKey);
      log.error(empty ? "No usable translations are available for this page" : "Translation key is unavailable", {
        event,
        description: empty
          ? "The translation dictionary contains no non-empty text values. Rendering was stopped."
          : `Translation "${key}" is missing, empty or not a string. A fallback is displayed.`,
        ...context,
        translationKey: key,
        reason: value === undefined ? "missing" : typeof value === "string" ? "empty" : "invalid_type",
        hasExplicitFallback: options.fallback !== undefined,
      });
    }

    if (empty) {
      throw new Error(`No valid translations found for ${context.resource ?? "page"}`);
    }
    template = options.fallback ?? key;
  }

  if (!params) return template;

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (placeholder, name: string) => {
    return Object.hasOwn(params, name) ? String(params[name]) : placeholder;
  });
}

/** Bind the dictionary once so callers only provide a key and optional options. */
export function createTranslator(translations: Readonly<Record<string, unknown>>): Translator {
  return (key: string, options: TranslateOptions = {}) =>
    t(translations, key, options.params, options);
}
