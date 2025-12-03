export function flattenObject(obj: Record<string, any>, skipEmpty: boolean = false): Record<string, any> {
  const flattened: Record<string, any> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      Object.assign(flattened, flattenObject(value));
   // } else if ( value !==null && value!==undefined && value!=='') {
   } else if (!skipEmpty || (value !==null && value!==undefined && value!=='')) {
      flattened[key] = value;
    }
  });
  return flattened;
}

