import { z } from "zod";

export const companySchema = z.object({
  name: z
    .string()
    .nonempty("Company name is required")
    .min(3, "Company name must be at least 2 characters")
    .max(20, "Company name must not exceed 20 characters"),

  address: z
    .string()
    .nonempty("Address is required")
    .min(3, "Address must be at least 2 characters")
    .max(50, "Address must not exceed 50 characters"),
});

// Type definition
export type Company = z.infer<typeof companySchema>;
