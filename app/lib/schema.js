
import { z } from "zod";

export const AccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.string().min(1, "Initial balance is required"),
  isDefault: z.boolean().default(false),
});

export const transactionSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"]),
  amount: z.string().min(1, "Amount must be a positive number"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  accountId: z.string().min(1, "Account ID is required"),
  isRecurring: z.boolean().default(false),
  category: z.string().min(1, "Category is required"),
  recurringInterval: z.enum(
    ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
  ).optional()
}).superRefine((data, ctx) => {
  if (data.isRecurring && !data.recurringInterval) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Recurring interval is required for recurring transactions",
      path: ["recurringInterval"],
    });
  }
})
  


