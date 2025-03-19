import { z } from "zod";

export const deliveryRouteSchema = z.object({
  name: z.string().nonempty("Name is required"),
  code: z.string().nonempty("Short Code is required"),
  haveToll: z.string(),
  tollType: z.string().optional(),
  tollAmount: z.number().optional(),
});

export type DeliveryRoute = z.infer<typeof deliveryRouteSchema> & {
  tollType?: string;
  tollAmount?: number;
};
