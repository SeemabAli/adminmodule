import { z } from "zod";

export type TaxApplication = {
  id: string;
  name: string;
};

export const taxSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .nonempty("Tax name is required")
    .min(2, "Tax name must be at least 2 characters"),

  rateValue: z
    .number()
    .gte(0, "Rate value must be greater than 0")
    .lte(100000, "Rate value must be less than or equal to 100000"),
  applications: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  rateType: z.enum(["PERCENTAGE", "FIXED"]), // Fixed: Changed to array of strings, not nested arrays
});

export type Tax = z.infer<typeof taxSchema>;
