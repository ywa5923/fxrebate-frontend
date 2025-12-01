export function flattenObject(obj: Record<string, any>): Record<string, any> {
  const flattened: Record<string, any> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      Object.assign(flattened, flattenObject(value));
    } else {
      flattened[key] = value;
    }
  });
  return flattened;
}

