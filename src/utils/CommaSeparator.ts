export const convertNumberIntoLocalString = (num: number | string) => {
  if (!num) return "0"; // Handle empty input gracefully

  const number =
    typeof num === "string" ? parseFloat(num.replace(/,/g, "")) : num;

  if (isNaN(number)) return "0"; // Prevent NaN errors

  return number.toLocaleString("en-IN"); // Indian numbering system (used in Pakistan)
};

export const convertLocalStringIntoNumber = (num: string) => {
  return parseInt(num.replaceAll(",", ""), 10);
};
