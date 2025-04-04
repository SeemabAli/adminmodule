import { z } from "zod";

const baseSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Email address is invalid")
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must include uppercase, lowercase, number and special character",
    ),
});

export const registerUserSchema = baseSchema
  .extend({
    name: z.string().or(z.literal("")),
    confirmPassword: z
      .string({ required_error: "Confirm Password is required" })
      .min(6, "Password must be between 6 and 20 characters.")
      .max(20)
      .or(z.literal("")),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const signInUserSchema = baseSchema;

export const setPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must include uppercase, lowercase, number and special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// types
export type RegisterUserData = z.infer<typeof registerUserSchema>;
export type SignInUserData = z.infer<typeof signInUserSchema>;
export type setPasswordData = z.infer<typeof setPasswordSchema>;
