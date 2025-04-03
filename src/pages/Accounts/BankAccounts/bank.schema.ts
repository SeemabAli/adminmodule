import { z } from "zod";

// Define the ChequeStatus enum
const ChequeStatusEnum = z.enum(["USED", "AVAILABLE", "CANCELLED"]);

// Schema for Cheque
export const chequeSchema = z.object({
  id: z.string().optional(),
  number: z
    .number()
    .min(1, "Cheque number must be at least 1")
    .max(999999, "Cheque number must not exceed 999999"),
  status: ChequeStatusEnum,
  createdAt: z.string().optional(),
});

// Schema for Bank Account
export const bankAccountSchema = z.object({
  id: z.string().optional(),
  bankName: z.string().nonempty("Bank name is required"),
  accountTitle: z
    .string()
    .nonempty("Account title is required")
    .min(3, "Account title must be at least 3 characters")
    .max(50, "Account title must not exceed 50 characters"),
  accountNumber: z
    .string()
    .nonempty("Account number is required")
    .min(5, "Account number must be at least 5 characters")
    .max(30, "Account number must not exceed 30 characters"),
  openingBalance: z.number(),
  chequeCount: z.array(chequeSchema).optional(),
});

// Type definitions
export type ChequeStatus = z.infer<typeof ChequeStatusEnum>;
export type Cheque = z.infer<typeof chequeSchema>;
export type BankAccount = z.infer<typeof bankAccountSchema>;
