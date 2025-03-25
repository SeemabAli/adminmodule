import { z } from "zod";

export const truckRouteSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .nonempty("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(30, "Name must not exceed 30 characters"),
  shortCode: z
    .string()
    .nonempty("Short code is required")
    .min(2, "Short code must be at least 2 characters")
    .max(10, "Short code must not exceed 10 characters"),
});

export type TruckRoute = z.infer<typeof truckRouteSchema>;
