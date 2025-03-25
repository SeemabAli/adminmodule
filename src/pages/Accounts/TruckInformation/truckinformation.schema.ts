import { z } from "zod";

export const truckInformationSchema = z.object({
  id: z.string().optional(),

  truckNumber: z
    .string()
    .nonempty("Truck number is required")
    .min(2, "Truck number must be at least 2 characters")
    .max(20, "Truck number must not exceed 20 characters"),

  driverName: z
    .string()
    .nonempty("Driver name is required")
    .min(3, "Driver name must be at least 3 characters")
    .max(50, "Driver name must not exceed 50 characters"),

  defaultRoute: z.string().nonempty("Default route is required"),

  truckType: z.enum(["MBnCO", "Outsource"], {
    required_error: "Truck type is required",
    invalid_type_error: "Truck type must be either 'MBnCO' or 'Outsource'",
  }),
});

export type TruckInformation = z.infer<typeof truckInformationSchema>;
