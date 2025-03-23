import { z } from "zod";
//TODO: Add validation for the purchase schema
export const purchaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  date: z.string(),
});

export type Purchase = z.infer<typeof purchaseSchema>;
