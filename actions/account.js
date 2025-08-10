"use server"
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";  
import { revalidatePath } from "next/cache";  


const serializedTransaction = (obj) => {
     const serialized ={...obj}

     if(obj.balance){
         serialized.balance = obj.balance.toNumber()
     }
     if(obj.amount){
         serialized.amount = obj.amount.toNumber()
     }
     return serialized
}

export async function updateDefaultAccount(accountId) {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error("User not authenticated");
        }
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        });
        if (!user) {
            throw new Error("User not found");
        }

        // Unset all other accounts as default
        await db.account.updateMany({
            where: {
                userId: user.id,
                isDefault: true
            },
            data: {
                isDefault: false
            }
        });

        // Set the specified account as default
        const updatedAccount = await db.account.update({
            where: {
                id: accountId
            },
            data: {
                isDefault: true
            }
        });

        const serializedAccount = serializedTransaction(updatedAccount)
        revalidatePath('/dashboard')
        return {success: true, data: serializedAccount}
    }
    catch(error){
        return { success: false, error: error.message };
    }
}

export async function getAccountWithTransactions(accountId){
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error("User not authenticated");
        }
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        });
        if (!user) {
            throw new Error("User not found");
        }

        const account = await db.account.findUnique({
            where: {
                id: accountId ,
                userId: user.id
            },
            include: {
                transactions:{
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count:{
                    select:{
                        transactions:true
                    }
                }

            }
        });

        if (!account) {
            throw new Error("Account not found");
        }
        return {
            ...serializedTransaction(account),
            transactions: account.transactions.map(serializedTransaction)
        };

    } catch (error) {
        throw error; // Let the page handle the error properly
    }
}
export async function BulkDeleteTransaction(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id
      }
    });

    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount
          : -transaction.amount;

      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions and update account balances atomically
    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id
        }
      });

      for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
        await tx.account.update({
          where: {
            id: accountId,
            userId: user.id
          },
          data: {
            balance: {
              increment: balanceChange
            }
          }
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
