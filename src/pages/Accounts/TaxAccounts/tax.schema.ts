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
    .positive("Tax rate must be a positive number")
    .or(z.string().regex(/^\d+$/).transform(Number))
    .refine((val) => val > 0, "Tax rate must be greater than 0"),
  applications: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  rateType: z.enum(["percentage", "fixed"]), // Fixed: Changed to array of strings, not nested arrays
});

export type Tax = z.infer<typeof taxSchema>;
