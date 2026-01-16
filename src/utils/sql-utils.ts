/**
 * Utility function to safely convert undefined values to null for SQL operations
 * This prevents the "Bind parameters must not contain undefined" error
 */
export function sqlSafe<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

/**
 * Alternative function to handle both undefined and null values consistently
 */
export function sqlSafeNullable<T>(value: T | null | undefined): T | null {
  return value === undefined ? null : value;
}