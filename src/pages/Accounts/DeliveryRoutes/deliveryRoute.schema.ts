import { z } from "zod";

export const deliveryRouteSchema = z.object({
  routeName: z.string().nonempty("Route Name is required"),
  shortCode: z.string().nonempty("Short Code is required"),
  haveToll: z.string().nonempty("Have Toll is required"),
  tollType: z.string().default(""),
  tollAmount: z.string().default(""),
});
