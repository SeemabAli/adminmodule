import { z } from "zod";

export const companySchema = z.object({
  id: z.string().optional(),

  name: z
    .string()
    .nonempty("Company name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(70, "Company name must not exceed 70 characters"),

  address: z
    .string()
    .nonempty("Address is required")
    .min(2, "Address must be at least 2 characters")
    .max(250, "Address must not exceed 250 characters"),
});

// Type definition
export type Company = z.infer<typeof companySchema>;
