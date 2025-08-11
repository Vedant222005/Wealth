import React from 'react'
import CreateAccountDrawer from '@/components/create-account-drawer'    
import { CardContent } from '@/components/ui/card'
import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'   
import { getUserAccounts } from '@/actions/dashboard'
import AccountCard from './_components/account-card'
import { BudgetProgress } from './_components/Budget-progress'
import { getCurrentBudget } from '@/actions/budget'
import { DashboardOverview } from './_components/transaction-overview'
import { getDashboardData } from '@/actions/dashboard'



 async function DashboardPage() {
    const [accounts, transactions] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
  ]);

  const defaultAccount = accounts?.find((account) => account.isDefault);

  // Get budget for default account
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }
  return (
    <div className="space-y-8">
        {/*budget progress*/}
          {defaultAccount && (
            <BudgetProgress
              initialBudget={budgetData?.budget}
              currentExpenses={budgetData?.currentExpenses ||0}
            />
          )}
        {/*overview*/}
            <DashboardOverview
        accounts={accounts}
        transactions={transactions || []}
      />

        {/*Account grid*/}
       <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
          <CreateAccountDrawer>
             <Card className="hover:shadow-md transition-shadow cursor-pointer border " >
                <CardContent className="flex flex-col items-center justify-center h-full p-4">
                   <Plus className="h-10 w-10 mb-4 text-gray-500"/>
                   <p className="text-sm font-medium text-gray-600">Add New Account</p>
                </CardContent>
             </Card>
          </CreateAccountDrawer>

          {accounts.map((account) => (
                <AccountCard key={account.id} account={account} />
            ))}
        </div>
    </div>
  )
}

export default DashboardPage

