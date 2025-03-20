import { z } from "zod";

// Define the ChequeStatus enum
const ChequeStatusEnum = z.enum(["active", "completed", "cancelled"]);

// Schema for Cheque
export const chequeSchema = z.object({
  id: z.string().optional(),
  chequeFrom: z
    .string()
    .nonempty("Cheque number is required")
    .regex(/^\d+$/, "Cheque number must be a valid number"),
  chequeTo: z
    .string()
    .regex(/^\d+$/, "Cheque number must be a valid number")
    .refine((val) => val !== "", {
      message: "Cheque To is required",
      path: ["chequeTo"],
    }),
  dateAdded: z.string().optional(),
  status: ChequeStatusEnum,
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
  openingBalance: z.string().nonempty("Opening balance is required"),
  cheques: z.array(chequeSchema).optional(),
});

// Type definitions
export type ChequeStatus = z.infer<typeof ChequeStatusEnum>;
export type Cheque = z.infer<typeof chequeSchema>;
export type BankAccount = z.infer<typeof bankAccountSchema>;
