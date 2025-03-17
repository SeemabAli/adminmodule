import { z } from "zod";

const baseSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Email address is invalid")
    .or(z.literal("")),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be between 8 and 20 characters")
    .max(20)
    .or(z.literal("")),
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

// types
export type RegisterUserData = z.infer<typeof registerUserSchema>;
export type SignInUserData = z.infer<typeof signInUserSchema>;
