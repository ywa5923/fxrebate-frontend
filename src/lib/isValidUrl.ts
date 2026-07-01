export function isValidUrl(value: string): boolean {
    const trimmed = value.trim();
    if (!/^https?:\/\//i.test(trimmed)) return false;
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }