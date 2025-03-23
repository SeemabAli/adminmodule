import { z } from "zod";

// Define schema for Phone
export const phoneSchema = z.object({
  number: z
    .string()
    .nonempty("Phone number is required")
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number must not exceed 15 characters"),
  status: z.enum(["Ptcl", "Mobile", "Whatsapp"]),
});

export type Phone = z.infer<typeof phoneSchema>;

// Define schema for PostDatedCheque
const postDatedChequeSchema = z.object({
  dueDate: z.string().nonempty("Due date is required"),
  details: z.string().nonempty("Cheque details are required"),
  image: z.string().optional(),
});

// Define schema for Signature
const signatureSchema = z.object({
  image: z.string().nonempty("Signature image is required"),
});

// Define schema for Address
const addressSchema = z.object({
  text: z
    .string()
    .nonempty("Address text is required")
    .min(3, "Address text must be at least 3 characters")
    .max(100, "Address text must not exceed 100 characters"),
  map: z.string().optional(),
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
  customerName: z
    .string()
    .nonempty("Customer name is required")
    .min(3, "Customer name must be at least 3 characters")
    .max(50, "Customer name must not exceed 50 characters"),
  acTitle: z
    .string()
    .nonempty("Account title is required")
    .min(3, "Account title must be at least 3 characters")
    .max(50, "Account title must not exceed 50 characters"),
  dealingPerson: z.string().optional(),
  reference: z.string().optional(),
  cnicFront: z.string().optional(),
  cnicBack: z.string().optional(),
  ntn: z.string().optional(),
  phones: z
    .array(phoneSchema)
    .nonempty("At least one phone number is required"),
  addresses: z
    .array(addressSchema)
    .nonempty("At least one address is required"),
  route: z
    .string()
    .nonempty("Route is required")
    .min(3, "Route must be at least 3 characters")
    .max(50, "Route must not exceed 50 characters"),
  creditLimit: z.number().min(0, "Credit limit must be a positive number"),
  postDatedCheques: z.array(postDatedChequeSchema).optional(),
  ledgerDetails: z.string().optional(),
  ledgerNumber: z.number().min(0, "Ledger number must be a positive number"),
  signatures: z.array(signatureSchema).optional(),
  otherImages: z.array(z.string()).optional(),
  smsPattern: smsPatternSchema.optional(),
});

// Type definition
export type Customer = z.infer<typeof customerSchema>;
