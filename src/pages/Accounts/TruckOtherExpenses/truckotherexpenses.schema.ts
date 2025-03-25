import { z } from "zod";

export const truckOtherExpensesSchema = z.object({
  id: z.string().optional(),

  name: z
    .string()
    .nonempty("Expense name is required")
    .min(3, "Expense name must be at least 3 characters")
    .max(50, "Expense name must not exceed 50 characters"),

  firstTrip: z
    .number()
    .min(0, "Amount must be positive")
    .optional()
    .transform((val) => val ?? null),

  secondTrip: z
    .number()
    .min(0, "Amount must be positive")
    .optional()
    .transform((val) => val ?? null),

  thirdTrip: z
    .number()
    .min(0, "Amount must be positive")
    .optional()
    .transform((val) => val ?? null),

  date: z
    .string()
    .nonempty("Date is required")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
});

// Type definitions
export type TruckOtherExpenses = z.infer<typeof truckOtherExpensesSchema>;
