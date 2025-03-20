import { z } from "zod";

export const deliveryRouteSchema = z.object({
  name: z.string().nonempty("Name is required"),
  code: z.string().nonempty("Short Code is required"),
  toll: z
    .object({
      type: z.string().nullable(),
      amount: z.number().nullable(),
    })
    .optional(),
});

export type DeliveryRoute = z.infer<typeof deliveryRouteSchema>;
