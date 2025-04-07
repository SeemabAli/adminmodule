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
    .min(10, "Invalid phone number")
    .max(15, "Invalid phone number"),

  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),

  cnic: z.string().nonempty("CNIC is required"),

  designation: z.string().nonempty("Designation is required"),

  department: z.string().optional(),

  salary: z
    .number()
    .min(1, "Salary must be greater than 0")
    .refine((value) => value !== null && value !== undefined, {
      message: "Salary is required",
    }),

  document: z.any().optional().nullable(),
  role: z.string().nullable().optional(),
});

// Type definition
export type Employee = z.infer<typeof employeeSchema>;
