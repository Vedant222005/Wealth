"use client"
import React, {  useState, useEffect } from 'react'
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle ,DrawerClose } from '@/components/ui/drawer'
import { AccountSchema } from '@/app/lib/schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch' 
import useFetch from '@/hooks/use-fetch'
import { createAccount } from '@/actions/dashboard'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function CreateAccountDrawer({children}) {
     const [open ,setopen] = useState(false)
     const{register,handleSubmit,formState:{errors},watch,setValue,reset}=useForm({
         resolver:zodResolver(AccountSchema),
         defaultValues: {
             name: '',
             type: 'CURRENT',
             balance: '',
             isDefault: false,
         },
     } )

     const {
        data:newAccount
        ,error,
        fn:createAccountFn,
        loading:createAccountLoading
                }=useFetch(createAccount)

    useEffect(() => {
        if (newAccount&&!createAccountLoading) {
            toast.success('Account created successfully');
            reset();
            setopen(false); 
        }
    },[newAccount,createAccountLoading])

    useEffect(()=>{
        if(error){
            toast.error(error.message || 'An error occurred while creating the account');
        }
    },[error])

     const onSubmit = async (data) => {
         await createAccountFn(data)
     }
     
  return (
    <Drawer open={open} onOpenChange={setopen}>
         <DrawerTrigger asChild>{children}</DrawerTrigger>
         <DrawerContent>
         <DrawerHeader>
         <DrawerTitle>Create New Account</DrawerTitle>
         </DrawerHeader>
         <div>
            <form onSubmit={handleSubmit(onSubmit)}  className="space-y-4 px-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="name">
                      Account Name
                    </label>
                    <Input
                      id="name"
                      placeholder="e.g. Main cheking"
                      {...register('name')}
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="Type">
                      Account Type
                    </label>
                       <Select
                          onValueChange={(value) => setValue('type', value)}
                          defaultValue ={watch('type')}
                        >
                        <SelectTrigger id="Type" >
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CURRENT">CURRENT</SelectItem>
                            <SelectItem value="SAVINGS">SAVINGS</SelectItem>
                        </SelectContent>
                        </Select>
                    {errors.type&& <p className="text-red-500 text-sm">{errors.type.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="balance">
                      Initial Balance
                    </label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('balance', {
                        setValueAs: (value) => value === '' ? '' : String(value)
                      })}
                    />
                    {errors.balance && <p className="text-red-500 text-sm">{errors.balance.message}</p>}
                </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                <label
                  htmlFor="isDefault"
                  className="text-base font-medium cursor-pointer"
                >
                  Set as Default
                </label>
                <p className="text-sm text-muted-foreground">
                  This account will be selected by default for transactions
                </p>
                </div>
                 <Switch
                id="isDefault"
                checked={watch("isDefault")}
                onCheckedChange={(checked) => setValue("isDefault", checked)}
              />
              </div>

            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button type="submit" className="flex-1" disabled={createAccountLoading}>
                {createAccountLoading ? (
                    <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                     Creating...
                    </>
                ) : 'Create Account'}
              </Button>
            </div>
            </form>
         </div>
         </DrawerContent>
    </Drawer>

  )
}

export default CreateAccountDrawer