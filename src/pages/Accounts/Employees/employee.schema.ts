import { z } from "zod";

export const employeeSchema = z.object({
  id: z.string().optional(),

  name: z
    .string()
    .nonempty("Employee name is required")
    .min(3, "Employee name must be at least 2 characters")
    .max(30, "Employee name must not exceed 30 characters"),

  phone: z
    .string()
    .nonempty("Phone number is required")
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number must not exceed 15 characters"),

  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),

  cnic: z.number().refine((value) => value !== null && value !== undefined, {
    message: "CNIC is required",
  }),

  designation: z.string().nonempty("Designation is required"),

  department: z.string().optional(),

  salary: z.number().refine((value) => value !== null && value !== undefined, {
    message: "Salary is required",
  }),

  documents: z.any().optional().nullable(),
  documentUrl: z.string().optional(),
  role: z.string().nullable().optional(),
});

// Type definition
export type Employee = z.infer<typeof employeeSchema>;
