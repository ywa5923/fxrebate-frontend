

export function flattenObject(obj: Record<string, any>, skipEmpty = false): Record<string, any> {
  const flattened: Record<string, any> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // keep arrays as-is
      if (!skipEmpty || value.length > 0) flattened[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(flattened, flattenObject(value, skipEmpty));
    } else if (!skipEmpty || (value !== null && value !== undefined && value !== '')) {
      flattened[key] = value;
    }
  });
  return flattened;
}