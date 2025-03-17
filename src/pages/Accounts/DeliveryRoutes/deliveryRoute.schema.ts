import { z } from "zod";

export const deliveryRouteSchema = z.object({
  routeName: z
    .string()
    .nonempty("Route name is required")
    .min(2, "Route name must be at least 2 characters"),

  routeShortCode: z
    .string()
    .nonempty("Description is required")
    .min(2, "Description must be at least 2 characters")
    .max(20, "Description must not exceed 10 characters"),

  tollAmount: z
    .number()
    .positive("Toll amount must be a positive number")
    .or(z.string().regex(/^\d+$/).transform(Number))
    .refine((val) => val > 0, "Toll amount must be greater than 0"),
});

// Helper function for real-time validation
export const validateField = (
  fieldName: keyof z.infer<typeof deliveryRouteSchema>,
  value: unknown,
): string | null => {
  const fieldSchema = deliveryRouteSchema.shape[fieldName];
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
export type DeliveryRouteFormData = z.infer<typeof deliveryRouteSchema>;
