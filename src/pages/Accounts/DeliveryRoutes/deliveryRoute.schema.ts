import { z } from "zod";

export const deliveryRouteSchema = z
  .object({
    name: z.string().nonempty("Name is required"),
    code: z.string().nonempty("Short Code is required"),
    haveToll: z.string(),
    tollType: z.string().nullable(),
    tollAmount: z.number().nullable(),
  })
  .refine(
    (data) => {
      // If haveToll is Yes, ensure tollType and tollAmount are provided
      if (data.haveToll === "Yes") {
        return !!data.tollType && data.tollAmount !== null;
      }
      return true;
    },
    {
      message: "Toll type and amount are required when toll is enabled",
      path: ["tollAmount"],
    },
  );

export type DeliveryRoute = z.infer<typeof deliveryRouteSchema>;
