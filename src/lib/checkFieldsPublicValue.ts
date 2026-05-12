/**
 * Fields whose public_* value is unset but the broker field has a value —
 * 
 */
export function checkFieldsPublicValue<
  T extends Record<string, unknown>,
  K extends keyof T & string,
>(row: T, fields: readonly K[]): Set<K> {
  const shouldBeUpdated = new Set<K>();
  for (const field of fields) {
    const publicKey = `public_${field}` as keyof T;
    const pub = row[publicKey];
    const broker = row[field];
    if (
      (pub == null || pub === "") &&
      broker != null &&
      broker !== ""
    ) {
      shouldBeUpdated.add(field);
    }
  }
  return shouldBeUpdated;
}
