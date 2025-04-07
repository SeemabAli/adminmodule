import { z } from "zod";

export const deliveryRouteSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .nonempty("Name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(70, "Company name must not exceed 70 characters"),
  code: z
    .string()
    .nonempty("Short Code is required")
    .max(20, "Company name must not exceed 20 characters"),
  toll: z
    .object({
      type: z.string().nullable(),
      amount: z.number().min(0).safe("Toll amount is too large").nullable(),
    })
    .optional(),
});

export type DeliveryRoute = z.infer<typeof deliveryRouteSchema>;
