import { z } from "zod";

// Enum for applies to
const appliestoEnum = z.enum(["GENERAL", "SPECIFIC_PRODUCT"]);

// Enum for rate type
const rateTypeEnum = z.enum([
  "FIXED_AMOUNT",
  "FIXED_PER_TON",
  "PERCENTAGE_PER_TON",
  "RANGE",
]);

// Tiered prices schema
const tieredPriceSchema = z.object({
  rangeId: z.string(),
  price: z.number().min(0, "Price must be positive"),
});

// Main factory expenses schema
export const factoryExpensesSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .nonempty("Expense name is required")
    .min(3, "Expense name must be at least 3 characters")
    .max(50, "Expense name must not exceed 50 characters"),
  // Make these optional since they're mapped later
  appliesTo: appliestoEnum.optional(),
  rateType: rateTypeEnum.optional(),
  // These fields directly match your form
  expenseType: z.string().nonempty("Expense type is required"),
  type: z.string().nonempty("Type is required"),

  fixedPerTonRate: z
    .number()
    .min(0, "Fixed per ton rate must be positive")
    .optional(),
  fixedAmountRate: z
    .number()
    .min(0, "Fixed amount rate must be positive")
    .optional(),
  percentagePerTonRate: z
    .number()
    .min(0, "Percentage must be positive")
    .max(100, "Percentage cannot exceed 100")
    .optional(),
  tieredPrices: z.array(tieredPriceSchema).optional(),
  extraChargeIfBrandChanges: z
    .number()
    .min(0, "Extra charge must be positive")
    .optional(),
});

// Convenience types
export type AppliesTo = z.infer<typeof appliestoEnum>;
export type RateType = z.infer<typeof rateTypeEnum>;
export type TieredPrice = z.infer<typeof tieredPriceSchema>;
export type IFactoryExpenses = z.infer<typeof factoryExpensesSchema>;
