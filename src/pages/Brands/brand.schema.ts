import { z } from "zod";

export const brandSchema = z.object({
  id: z.string().optional(),
  brandName: z
    .string()
    .nonempty("Brand name is required")
    .min(2, "Brand name must be at least 2 characters"),

  brandShortCode: z
    .string()
    .nonempty("Short code is required")
    .min(2, "Short code must be at least 2 characters")
    .max(10, "Short code must not exceed 10 characters"),

  weight: z
    .number()
    .positive("Weight must be a positive number")
    .or(z.string().regex(/^\d+$/).transform(Number))
    .refine((val) => val > 0, "Weight must be greater than 0"),

  commission: z
    .number()
    .positive("Commission must be a positive number")
    .or(z.string().regex(/^\d+$/).transform(Number))
    .refine((val) => val > 0, "Commission must be greater than 0"),
});

// Type definition
export type BrandFormData = z.infer<typeof brandSchema>;
