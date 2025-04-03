import { z } from "zod";

// Define schema for Phone
export const phoneNumberSchema = z.object({
  number: z.string().nonempty("Phone number is required"),
  type: z.enum(["MOBILE", "PTCL", "WHATSAPP"], {
    required_error: "Phone type is required",
  }),
});

export type Phone = z.infer<typeof phoneNumberSchema>;

// Define schema for PostDatedCheque
export const postDatedChequeSchema = z.object({
  status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional(),
  date: z.string().optional(),
  amount: z.number().optional(),
  details: z.string().optional(),
  number: z.number().optional(),
  image: z.string().optional(),
});

// Define schema for Signature
const signatureSchema = z.object({
  image: z.string().nonempty("Signature image is required"),
});

// Define schema for Address
export const addressSchema = z.object({
  currentAddress: z.string().optional(),
});

// Define schema for SMS Pattern
const smsPatternSchema = z.object({
  enabled: z.boolean(),
  frequency: z.enum(["Daily", "Weekly", "Monthly", "Yearly"]),
  via: z.string(),
});

// Define the main customer schema
export const customerSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().nonempty("Full name is required"),
  accountTitle: z.string().nonempty("Account title is required"),
  routeId: z.string().nonempty("Route is required"),
  dealingPerson: z.string().optional(),
  reference: z.string().optional(),
  ntnNumber: z.string().optional(),
  creditLimit: z.number().optional(),
  creditDetail: z.string().optional(),
  ledgerDetails: z.string().optional(),
  ledgerNumber: z.number().optional(),
  phoneNumbers: z.array(phoneNumberSchema).optional(),
  cnicBackImage: z.string().optional(),
  cnicFrontImage: z.string().optional(),
  addresses: z.array(addressSchema).optional(),
  notificationPreference: z
    .object({
      frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"], {
        required_error: "Notification frequency is required",
      }),
      channel: z.enum(["SMS", "WHATSAPP", "EMAIL", "PUSH"], {
        required_error: "Notification channel is required",
      }),
    })
    .optional(),
  postDatedCheques: z.array(postDatedChequeSchema).optional(),
  signatures: z.array(signatureSchema).optional(),
  otherImages: z.array(z.string()).optional(),
  smsPattern: smsPatternSchema.optional(),
});

// Type definition
export type ICustomer = z.infer<typeof customerSchema>;
export type Address = z.infer<typeof addressSchema>;
export type NotificationPreference = z.infer<
  typeof customerSchema.shape.notificationPreference
>;
export type PostDatedCheque = z.infer<typeof postDatedChequeSchema>;
