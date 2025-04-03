import { z } from "zod";

export const truckOtherExpensesSchema = z.object({
  id: z.string().optional(),

  name: z
    .string()
    .nonempty("Expense name is required")
    .min(3, "Expense name must be at least 3 characters")
    .max(50, "Expense name must not exceed 50 characters"),

  firstTrip: z.number().optional(),

  secondTrip: z.number().optional(),

  thirdTrip: z.number().optional(),
});

// Type definitions
export type TruckOtherExpenses = z.infer<typeof truckOtherExpensesSchema>;
