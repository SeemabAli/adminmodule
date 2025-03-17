import { z } from "zod";

export const companySchema = z.object({
  companyName: z
    .string()
    .nonempty("Company name is required")
    .min(2, "Company name must be at least 2 characters"),

  companyAddress: z
    .string()
    .nonempty("Address is required")
    .min(2, "Address must be at least 2 characters")
    .max(20, "Address must not exceed 10 characters"),
});

// Helper function for real-time validation
export const validateField = (
  fieldName: keyof z.infer<typeof companySchema>,
  value: unknown,
): string | null => {
  const fieldSchema = companySchema.shape[fieldName];
  try {
    fieldSchema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message ?? "Invalid input";
    }
    return "Validation error";
  }
};

// Type definition
export type CompanyFormData = z.infer<typeof companySchema>;
