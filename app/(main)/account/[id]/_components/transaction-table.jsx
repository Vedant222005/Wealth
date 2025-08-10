"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from "@/components/ui/checkbox";
import { format, set} from 'date-fns';
import { categoryColors} from '@/data/categories';
import { ChevronUp,ChevronDown, MoreHorizontal, RefreshCcw, Search, Trash, X} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Clock } from 'lucide-react';
import { Button } from "@/components/ui/button" 
import {Input} from "@/components/ui/input"
import {toast} from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useFetch from '@/hooks/use-fetch';
import { BulkDeleteTransaction } from '@/actions/account';
import { BarLoader } from 'react-spinners';



function TransactionTable({transactions}) {
    const router = useRouter();
   
    const[selectedIds,setSelectedIds]=useState([])
    const[sortedconfig,setSortedconfig]=useState({
      field:'date',
      direction:'desc',
    })
   const [searchTerm,setSearchTerm]=useState('')
   const [typeFilter,setTypeFilter]=useState('')
   const [RecurringFilter,setRecurringFilter]=useState('')
   
    const filterAndSortedTransaction = useMemo(()=>{
          let result=[...transactions]

          //Apply search filter
          if(searchTerm){
            const searchLower=searchTerm.toLowerCase()
            result=result.filter((transaction)=>
                    transaction.description?.toLowerCase().includes(searchLower)
            )
          }
          if(typeFilter){
            result=result.filter((transaction)=>
                    transaction.type===typeFilter
             )
           }
           if(RecurringFilter){
            result=result.filter((transaction)=>
              RecurringFilter==="recurring"?
                    transaction.isRecurring===true :
                    !transaction.isRecurring
             )
           }

           result.sort((a,b)=>{
              let comparison=0;
              switch(sortedconfig.field){
                case "date":
                  comparison=new Date(a.date)-new Date(b.date);
                  break;
                case "amount":
                  comparison=a.amount-b.amount;
                  break;
                case "category":
                  comparison=a.category.localeCompare(b.category);
                  break;
                default:
                  comparison=0;
              }
              return sortedconfig.direction==='asc'? comparison:-comparison;
           }
           )
          return result
    },[
      transactions,
      searchTerm,
      typeFilter,
      RecurringFilter,
      sortedconfig
    ])
    
    const {
      loading:deleteLoading,
      fn:deleteFn,
      data:deleted
    }=useFetch(BulkDeleteTransaction)

    const handleBulkDelete=async()=>{
      if(
        !window.confirm(
          `Are you sure want to delete ${selectedIds.length} selected transactions?`
        )){
          return
        }
      deleteFn(selectedIds);
    }

    useEffect(()=>{
      if(deleted&&!deleteLoading){
        toast.error("Transaction deleted successfully!")
      }
    },[deleted,deleteLoading])

    const handlesort = (field) => {
        setSortedconfig((current)=>({
          field,
          direction:
          current.field==field &&current.direction==='asc'? 'desc':'asc'
          }
        ))
      }

    const handleSelect=(id)=>{
          setSelectedIds((current)=>{
             return current.includes(id) ? current.filter((item)=> item!==id) : [...current,id]
          })
    }

    const handleSelectAll=()=>{
      setSelectedIds((current)=>{
             return (
             current.length===filterAndSortedTransaction.length?
              []:
              filterAndSortedTransaction.map((transaction)=>transaction.id)
             )
          })
    }

    const handleClearFilters=()=>{
      setSearchTerm(''); 
      setRecurringFilter('');
      setSelectedIds([])
      setTypeFilter('')
    }
    
  return (
   <div className="space-y-4">
      {deleteLoading&&
        <BarLoader className='mt-4' width={"100%"} color='#9333ea'></BarLoader> }
      
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 ">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-8 text-muted-foreground" />
          <Input
            placeholder="Search Transactions..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)} 
            className="pl-8"
          />
        </div>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value)}> 
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INCOME">INCOME</SelectItem>
            <SelectItem value="EXPENSE">EXPENSE</SelectItem>
          </SelectContent>
        </Select>

        {/* Recurring Filter */}
        <Select value={RecurringFilter} onValueChange={(value) => setRecurringFilter(value)}> 
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Recurring" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recurring">Recurring only</SelectItem>
            <SelectItem value="non-recurring">Non-Recurring only</SelectItem>
          </SelectContent>
        </Select>
 
       {selectedIds.length>0 &&
       <div className='flex item-center gap2'>
       <Button variant='destructive' onClick={handleBulkDelete}>
        <Trash className='h-4 w-4 '/>
          Delete({(selectedIds.length)})
       </Button>
       </div>
       }
       
       {(searchTerm || typeFilter || RecurringFilter)&&
         <Button variant="outline" size="icon" onClick={handleClearFilters}>
           <X className='h-4 w-5'/>
         </Button>


       }
      </div>

     <div className='rounded-md border '>
    <Table>
    <TableHeader>
    <TableRow>
      <TableHead className="w-[50px]">
       <Checkbox 
         onCheckedChange={handleSelectAll}
         checked={selectedIds.length === filterAndSortedTransaction.length && filterAndSortedTransaction.length > 0}
         className=" border border-gray-700" />
      </TableHead>
      <TableHead className='cursor-pointer'
        onClick={() => handlesort('date')}>
        <div className='flex items-center '>Date {sortedconfig.field=='date'&&(
          sortedconfig.direction=='asc'?<ChevronUp className='ml-1 h-4 w-4'/> :<ChevronDown className='ml-1 h-4 w-4'/>
        ) }</div>
      </TableHead>
      <TableHead>Description</TableHead>
      <TableHead className='cursor-pointer'
        onClick={() => handlesort('category')}>
        <div className='flex items-center'>Category {sortedconfig.field=='category'&&(
          sortedconfig.direction=='asc'?<ChevronUp className='ml-1 h-4 w-4'/> :<ChevronDown className='ml-1 h-4 w-4'/>
        ) }</div>
      </TableHead>
      <TableHead className='cursor-pointer'
        onClick={() => handlesort('amount')}>
        <div className='flex items-center justify-end'>Amount {sortedconfig.field=='amount'&&(
          sortedconfig.direction=='asc'?<ChevronUp className='ml-1 h-4 w-4'/> :<ChevronDown className='ml-1 h-4 w-4'/>
        ) }</div>
      </TableHead>
      <TableHead>Recurring</TableHead>
      <TableHead className="w-[50px]"></TableHead>
    </TableRow>
    </TableHeader>

    <TableBody>
        {filterAndSortedTransaction.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className='h-24 text-center'>
                        No transactions found.
                    </TableCell>
                </TableRow>
        ) : (
        filterAndSortedTransaction.map((transaction) => {  
        return (
      <TableRow key={transaction.id}>
      <TableCell>
             <Checkbox
                      checked={selectedIds.includes(transaction.id)}
                      onCheckedChange={() => handleSelect(transaction.id)}
            className=" border border-gray-700" />
      </TableCell>
      <TableCell>
        {format(new Date(transaction.date), "PP")}
      </TableCell>
      <TableCell>{transaction.description}</TableCell>
      <TableCell className="capitalize">
                    <span
                      style={{
                        background: categoryColors[transaction.category] ||"#22c55e"
                      }}
                      className="px-2 py-1 rounded text-white text-sm"
                    >
                      {transaction.category}
                    </span>
      </TableCell>
      <TableCell
      className={`${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'} text-right font-medium`}
      >
        {transaction.type === 'EXPENSE' ? '-' : '+'}
        ₹{parseFloat(transaction.amount).toFixed(2)}
      </TableCell>
      <TableCell>
        {transaction.isRecurring ? (
        <Tooltip>
        <TooltipTrigger>
            <Badge variant={'outline'} className='bg-purple-100 text-purple-700 hover:bg-purple-200'>
                <RefreshCcw className='w-3 h-3'/>
                {transaction.recurringInterval === 'DAILY' ? 'Daily': transaction.recurringInterval === 'WEEKLY' ? 'Weekly':
                 transaction.recurringInterval === 'MONTHLY' ? 'Monthly': 'Yearly'}
            </Badge>
        </TooltipTrigger>
        <TooltipContent>
        <div className='text-sm'>
          <div className="font-medium">Next Date:</div>
          <div>
            {format(new Date(transaction.nextRecurringDate),'PP')}
          </div>
        </div>
        </TooltipContent>
        </Tooltip>
    ) : (
      <Badge variant={'outline'} className='gap-1'>
        <Clock className='w-3 h-3'/>
        One-Time
      </Badge>
    )}
    </TableCell>
    <TableCell>
        <DropdownMenu>
            <DropdownMenuTrigger>
             <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
             </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end"  >
            <DropdownMenuItem
            onClick={()=>{
                router.push(`/transaction/create?edit=${transaction.id}`)
            }

            }
            >Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive"
               onClick={()=>deleteFn([transaction.id])}
            >Delete
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
                );
            })
        )}
    </TableBody>
     </Table>
    </div>
    </div>
  )
}

export default TransactionTable