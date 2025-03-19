import { z } from "zod";

export const taxSchema = z.object({
  taxName: z
    .string()
    .nonempty("Tax name is required")
    .min(2, "Tax name must be at least 2 characters"),

  taxRate: z
    .number()
    .positive("Tax rate must be a positive number")
    .or(z.string().regex(/^\d+$/).transform(Number))
    .refine((val) => val > 0, "Tax rate must be greater than 0"),
});

// Type definition
export type TaxFormData = z.infer<typeof taxSchema>;
