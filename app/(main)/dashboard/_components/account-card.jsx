"use client"
import React, { useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'        
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import useFetch from '@/hooks/use-fetch';
import { updateDefaultAccount } from '@/actions/account';
import { toast } from 'sonner';

function AccountCard({ account }) {     
    const {name,balance,type,id,isDefault} = account;
    
    const {
       data: updatedAccount,
       loading: updateDefaultLoading,
       fn: updateAccountFn,
       error,
    } = useFetch(updateDefaultAccount)

    const handleDefaultChange = async (event) => {
        event.preventDefault();
        event.stopPropagation(); // CRITICAL: Prevent Link navigation
        
        if(isDefault){
            toast.error("You need atleast one default account");
            return; //toggling off default is not allowed
        }
        await updateAccountFn(id);
    }

    useEffect(() => {
        if(updatedAccount?.success && !updateDefaultLoading){
          toast.success('Default account updated successfully');
        }
    }, [updatedAccount, updateDefaultLoading])

    useEffect(() => {
        if(error){
          toast.error(error.message || 'Failed to update default account');
        }
    }, [error])
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer border">
     <Link href={`/account/${id}`}>
     <CardHeader>
     <div className="flex items-center justify-between">
       <CardTitle>{name}</CardTitle>
       <Switch 
       checked={isDefault}
       onClick={handleDefaultChange} 
       disabled={updateDefaultLoading} 
       />
     </div>
    </CardHeader>
    <CardContent>
     <p className="text-xl font-bold">₹{parseFloat(balance).toFixed(2)}</p>
     <p className="text-sm text-gray-500 capitalize">{type.charAt(0) + type.slice(1).toLowerCase()} Account</p>
    </CardContent>
    <CardFooter className="flex justify-between">
     <div className="flex items-center gap-1">
        <ArrowUpRight className="h-4 w-4 text-green-500" />
        <span className="text-sm">Income</span>
    </div>
    <div className="flex items-center gap-1">
        <ArrowDownLeft className="h-4 w-4 text-red-500" />
        <span className="text-sm">Expense</span>
     </div>
    </CardFooter>
    </Link>
   </Card>
   
  )
}

export default AccountCard