import type { LanguageItem } from "@/lib/types";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const SITE_BROKER_TYPES = ["broker", "crypto", "prop_firm"] as const;

export const SITE_LANGUAGES: readonly LanguageItem[] = [
  { id: "en", code: "en", name: "English", countryCode: "gb" },
  { id: "fr", code: "fr", name: "French", countryCode: "fr" },
  { id: "gr", code: "gr", name: "Greek", countryCode: "gr" },
  { id: "ro", code: "ro", name: "Romanian", countryCode: "ro" },
];
