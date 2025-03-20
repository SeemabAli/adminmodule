import { z } from "zod";

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
});

// Type definition
export type TaxFormData = z.infer<typeof taxSchema>;
