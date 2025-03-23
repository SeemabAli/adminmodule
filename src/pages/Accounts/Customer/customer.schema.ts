import { z } from "zod";

export const customerSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .nonempty("Customer name is required")
    .min(3, "Customer name must be at least 2 characters")
    .max(30, "Customer name must not exceed 30 characters"),
  address: z
    .string()
    .nonempty("Address is required")
    .min(3, "Address must be at least 2 characters")
    .max(50, "Address must not exceed 50 characters"),
  phone: z
    .string()
    .nonempty("Phone number is required")
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number must not exceed 15 characters"),
  email: z.string().email("Invalid email address"),
});

// Type definition
export type Customer = z.infer<typeof customerSchema>;
