import { z } from "zod";

const expenseTypeEnum = z.enum([
  "Fixed Amount",
  "Fixed/Ton",
  "Percent/Ton",
  "Range Ton From",
]);
const expenseCategoryEnum = z.enum(["General", "Specific Product"]);

export const rangeTonValuesSchema = z
  .record(z.string(), z.number().min(0, "Value must be positive"))
  .optional();

export const factoryExpensesSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .nonempty("Expense name is required")
    .min(3, "Expense name must be at least 3 characters")
    .max(50, "Expense name must not exceed 50 characters"),
  date: z.string().nonempty("Date is required"),
  type: expenseCategoryEnum,
  expenseType: expenseTypeEnum,
  fixedAmount: z.number().min(0, "Amount must be positive").optional(),
  fixedPerTon: z.number().min(0, "Amount must be positive").optional(),
  percentPerTon: z
    .number()
    .min(0, "Percentage must be positive")
    .max(100, "Percentage cannot exceed 100")
    .optional(),
  rangeTonFrom: z.string().optional(),
  rangeTonValues: rangeTonValuesSchema,
  extraCharge: z.number().min(0, "Extra charge must be positive"),
});

// Type definitions
export type ExpenseType = z.infer<typeof expenseTypeEnum>;
export type ExpenseCategory = z.infer<typeof expenseCategoryEnum>;
export type RangeTonValues = z.infer<typeof rangeTonValuesSchema>;
export type IFactoryExpenses = z.infer<typeof factoryExpensesSchema>;
