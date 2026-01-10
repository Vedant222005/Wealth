import { inngest } from "./client";
import { db } from "@/lib/prisma";
import EmailTemplate from "@/emails/template";
import { sendEmail } from "@/actions/send-email";


// 1. Recurring Transaction Processing with Throttling
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    throttle: {
      limit: 10,
      period: "1m",
      key: "event.data.userId",
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    if (!event?.data?.transactionId || !event?.data?.userId) {
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: { account: true },
      });

      if (!transaction || !isTransactionDue(transaction)) return;

      await db.$transaction(async (tx) => {
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });

        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });

        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });
      });
    });
  }
);

// Trigger recurring transactions
export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () =>
        db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null },
              { nextRecurringDate: { lte: new Date() } },
            ],
          },
        })
    );

    if (recurringTransactions.length > 0) {
      await inngest.send(
        recurringTransactions.map((t) => ({
          name: "transaction.recurring.process",
          data: { transactionId: t.id, userId: t.userId },
        }))
      );
    }

    return { triggered: recurringTransactions.length };
  }
);

// 2. Monthly Report Insights (₹ applied)
async function generateFinancialInsights(stats, month) {
  if (!stats?.byCategory || Object.keys(stats.byCategory).length === 0) {
    return [
      "You did not record expenses by category this month.",
      "Adding categories will help you understand where your money goes.",
      "Once categories are added, you will get clearer monthly insights.",
    ];
  }

  const prompt = `
You are helping a regular Indian customer understand their monthly spending.

Use SIMPLE, friendly language.
Avoid technical or financial terms.

Return ONLY a valid JSON array of exactly 3 insights.

Monthly summary for ${month}:
Income: ₹${stats.totalIncome}
Expenses: ₹${stats.totalExpenses}
Remaining money: ₹${stats.totalIncome - stats.totalExpenses}

Spending by category:
${Object.entries(stats.byCategory)
  .map(([c, a]) => `${c}: ₹${a}`)
  .join("\n")}

Return format:
["insight 1", "insight 2", "insight 3"]
`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 1.2 },
        }),
      }
    );

    const json = await res.json();
    if (!res.ok) throw new Error("Gemini failed");

    const text =
      json.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start === -1 || end === -1) throw new Error("Invalid JSON");

    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return [
      `You earned ₹${stats.totalIncome} and spent ₹${stats.totalExpenses} this month.`,
      `Most of your spending came from one or two categories.`,
      `Watching these expenses can help you save more money.`,
    ];
  }
}

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports-v2",
    name: "Generate Monthly Reports v2",
  },
  { cron: "0 0 1 * *" },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () =>
      db.user.findMany({ include: { accounts: true } })
    );

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user.id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        const insights = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data: { stats, month: monthName, insights },
          }),
        });
      });
    }

    return { processed: users.length };
  }
);

// Utility helpers
function isNewMonth(a, b) {
  return a.getMonth() !== b.getMonth() || a.getFullYear() !== b.getFullYear();
}

function isTransactionDue(transaction) {
  if (!transaction.lastProcessed) return true;
  return new Date(transaction.nextRecurringDate) <= new Date();
}

function calculateNextRecurringDate(date, interval) {
  const next = new Date(date);
  if (interval === "DAILY") next.setDate(next.getDate() + 1);
  if (interval === "WEEKLY") next.setDate(next.getDate() + 7);
  if (interval === "MONTHLY") next.setMonth(next.getMonth() + 1);
  if (interval === "YEARLY") next.setFullYear(next.getFullYear() + 1);
  return next;
}

async function getMonthlyStats(userId, month) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await db.transaction.findMany({
    where: { userId, date: { gte: start, lte: end } },
  });

  return transactions.reduce(
    (s, t) => {
      const amt = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        s.totalExpenses += amt;
        s.byCategory[t.category] =
          (s.byCategory[t.category] || 0) + amt;
      } else {
        s.totalIncome += amt;
      }
      return s;
    },
    { totalIncome: 0, totalExpenses: 0, byCategory: {} }
  );
}
