/**
 * Formats a number using the Indian/Pakistani number system (lakhs, crores)
 * @param num - The number to format
 * @returns Formatted string with commas (e.g., 1,23,45,678)
 */
export function formatIndianNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "-";

  // Convert to string and handle negative numbers
  const isNegative = num < 0;
  const numStr = Math.abs(num).toString();

  // For numbers less than 1000, no special formatting is needed
  if (numStr.length <= 3) {
    return isNegative ? `-${numStr}` : numStr;
  }

  // Extract the last 3 digits
  let result = numStr.substring(numStr.length - 3);

  // Process the remaining digits in groups of 2
  let remainingDigits = numStr.substring(0, numStr.length - 3);

  while (remainingDigits.length > 0) {
    // Take up to 2 digits from the right
    const group = remainingDigits.substring(
      Math.max(0, remainingDigits.length - 2),
    );
    result = `${group},${result}`;

    // Remove the processed digits
    remainingDigits = remainingDigits.substring(
      0,
      Math.max(0, remainingDigits.length - 2),
    );
  }

  return isNegative ? `-${result}` : result;
}

/**
 * Converts a comma-separated string formatted in Indian/Pakistani style back to a number
 * @param formattedStr - The formatted string (e.g., "1,23,45,678")
 * @returns The number value
 */
export function parseIndianNumber(
  formattedStr: string | null | undefined,
): number {
  if (!formattedStr) return 0;

  // Remove all commas and convert to number
  const numberStr = formattedStr.replace(/,/g, "");
  return Number(numberStr);
}

/**
 * Legacy function name for backward compatibility
 * @param num - The number to format
 * @returns Formatted string with commas
 */
export function convertNumberIntoLocalString(
  num: number | null | undefined,
): string {
  return formatIndianNumber(num);
}
