/**
 * Validates that a value is a proper ID for API/database usage.
 *
 * @param id - The value to validate (can be number or null).
 * @param options - Validation options:
 *    - allowZero: if true, accepts 0 as a valid ID (default: false).
 *    - nullable: if true, allows null to pass through (default: false).
 * 
 * @returns The validated number, or null if nullable is true and id === null.
 *
 * @throws Error if the value is invalid (not an integer, negative, or 0 when not allowed).
 *
 * 
 * Examples:
 * validateId(5)                // returns 5
 * validateId(0, {allowZero:true}) // returns 0
 * validateId(null, {nullable:true}) // returns null
 *
 * Examples that throw Errors:
 * validateId("5")              // Error: not an integer
 * validateId(-1)               // Error: must be > 0
 * validateId(0)                // Error: must be > 0 (unless allowZero:true)
 */
export function validateId(
    id: unknown,
    { allowZero = false, nullable = false } = {}
  ): number | null {
    // Handle nullable case
    if (id === null && nullable) {
      return null;
    }
  
    // Ensure the value is an integer (excludes floats, strings, NaN, etc.)
    if (!Number.isInteger(id)) {
      throw new Error(`Invalid ID: must be an integer (got ${id})`);
    }
  
    const num = id as number;
  
    // Ensure the ID is positive (or zero if explicitly allowed)
    if (!allowZero && num <= 0) {
      throw new Error(`Invalid ID: must be > 0 (got ${num})`);
    }
  
    return num;
  }
  