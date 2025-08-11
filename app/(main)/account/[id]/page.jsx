import { getAccountWithTransactions } from '@/actions/account';
import NotFound from '@/app/not-found';
import TransactionTable from './_components/transaction-table';
import React from 'react'
import { BarLoader } from 'react-spinners'
import { Suspense } from 'react';           
import AccountChart from './_components/Account-chart';

async function AccountPage({params}) {
    try {
        const accountData = await getAccountWithTransactions(params.id);
        
        if(!accountData) {
            return <NotFound />;
        }
        
        return (
            <div className=" mt-20 space-y-8 px-5 ">
                <div className=" gap-4 item-end justify-between flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold gradient-title text-4xl">{accountData.name}</h1>
                        <p className="text-gray-600 capitalize">
                            {accountData.type.charAt(0) + accountData.type.slice(1).toLowerCase()} Account
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">₹{parseFloat(accountData.balance).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                            {accountData.transactions?.length || 0} transactions
                        </p>
                    </div>
                </div>

                {/*chart section*/}
                <Suspense 
                    fallback={<BarLoader className="mx-auto" color="#36d7b7" width={"100%"} />}>
                        <AccountChart transactions={accountData.transactions}/>
                </Suspense>
                {/* transactions table */}
                <Suspense 
                    fallback={<BarLoader className="mx-auto" color="#36d7b7" width={"100%"} />}>
                        <TransactionTable transactions={accountData.transactions}/>
                </Suspense>
                

            </div>
        );
    } catch (error) {
        return <NotFound />;
    }
}

export default AccountPage