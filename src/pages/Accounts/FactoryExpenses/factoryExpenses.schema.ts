import { z } from "zod";

export const factoryExpensesSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .nonempty("Name is required")
    .min(3, "Name must be at least 2 characters")
    .max(30, "Name must not exceed 30 characters"),
  date: z.string().nonempty("Date is required"),
});

// Type definition
export type FactoryExpenses = z.infer<typeof factoryExpensesSchema>;
