export function getCountryCode(value?: string): string {
  if (!value) return "";

  const trimmed = value.trim();
  if (trimmed.includes("-")) {
    return trimmed.split("-").pop()?.trim() ?? "";
  }

  return trimmed;
}
