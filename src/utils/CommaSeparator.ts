export const formatNumberWithCommas = (num: number | string) => {
    if (num === "" || num === null || num === undefined) return "0"; // Handle empty input gracefully

    const number = typeof num === "string" ? parseFloat(num.replace(/,/g, "")) : num;

    if (isNaN(number)) return "0"; // Prevent NaN errors

    return number.toLocaleString("en-IN"); // Indian numbering system (used in Pakistan)
};
