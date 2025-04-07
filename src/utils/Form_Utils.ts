/* eslint-disable @typescript-eslint/no-unused-vars */
export function removeEmptyFields<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== "" && value !== null),
  ) as Partial<T>;
}
