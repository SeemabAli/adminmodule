import { z } from "zod";

export const truckInformationSchema = z.object({
  id: z.string().optional(),
  number: z
    .string()
    .nonempty("Truck number is required")
    .min(2, "Truck number must be at least 2 characters")
    .max(20, "Truck number must not exceed 20 characters"),

  driverId: z.string().nonempty("Driver is required"),

  // Add driver object to match API response structure
  driver: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),

  routeId: z.string().nonempty("Default route is required"),

  // Add route object to match API response structure
  route: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      code: z.string().optional(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
      deletedAt: z.string().nullable().optional(),
    })
    .optional(),

  sourcingType: z.enum(["INSOURCE", "OUTSOURCE"], {
    required_error: "Truck type is required",
    invalid_type_error: "Truck type must be either 'Insource' or 'Outsource'",
  }),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().nullable().optional(),
});

export type ITruckInformation = z.infer<typeof truckInformationSchema>;
