"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { cn } from "@/lib/utils";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./recipt-scanner";

export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [isClient, setIsClient] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date).toISOString(),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date().toISOString(), // Set default date immediately
            isRecurring: false,
          },
  });

  // Client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const onSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        amount: parseFloat(data.amount),
        // Ensure recurringInterval is null if not recurring
        recurringInterval: data.isRecurring ? data.recurringInterval : null,
      };

      if (editMode) {
        await transactionFn(editId, formData);
      } else {
        await transactionFn(formData);
      }
    } catch (error) {
      toast.error("Failed to save transaction. Please try again.");
    }
  };

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      if (scannedData.date) {
        // scannedData.date is already an ISO string from the server action
        setValue("date", scannedData.date);
      }
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
      toast.success("Receipt scanned successfully");
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      );
      
      const accountId = transactionResult?.data?.accountId;
      if (accountId) {
        // Small delay to ensure toast is visible before redirect
        setTimeout(() => {
          router.push(`/account/${accountId}`);
        }, 500);
      }
      
      // Reset form after redirect is initiated
      setTimeout(() => {
        reset();
      }, 100);
    }
  }, [transactionResult, transactionLoading, editMode, reset, router]);

  const type = watch("type");
  const isRecurring = watch("isRecurring");

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading form...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Receipt Scanner - Only show in create mode */}
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Controller
          control={control}
          name="type"
          rules={{ required: "Type is required" }}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      {/* Amount and Account */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Controller
            control={control}
            name="accountId"
            rules={{ required: "Account is required" }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} (₹{parseFloat(account.balance).toFixed(2)})
                    </SelectItem>
                  ))}
                  <CreateAccountDrawer>
                    <div
                      className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    >
                      Create Account
                    </div>
                  </CreateAccountDrawer>
                </SelectContent>
              </Select>
            )}
          />
          {errors.accountId && (
            <p className="text-sm text-red-500">{errors.accountId.message}</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Controller
          control={control}
          name="category"
          rules={{ required: "Category is required" }}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2 relative">
        <label className="text-sm font-medium">Date</label>
        <Controller
          control={control}
          name="date"
          rules={{ required: "Date is required" }}
          render={({ field }) => {
            const raw = field.value; // ISO string or undefined
            const dateObj = raw ? new Date(raw) : null;
            const isValidDate = dateObj && !isNaN(dateObj.getTime());
            const [open, setOpen] = useState(false);
            const containerRef = useRef(null);

            // Prevent hydration mismatch by only showing formatted date on client
            if (!isClient) {
              return (
                <div className="w-full flex items-center justify-between border rounded-md px-3 py-2 text-left font-normal text-muted-foreground">
                  <span>Loading...</span>
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
                </div>
              );
            }

            useEffect(() => {
              const onOutside = (e) => {
                if (
                  containerRef.current &&
                  !containerRef.current.contains(e.target)
                ) {
                  setOpen(false);
                }
              };
              document.addEventListener("mousedown", onOutside);
              return () =>
                document.removeEventListener("mousedown", onOutside);
            }, []);

            return (
              <div ref={containerRef} className="relative">
                <button
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  className={cn(
                    "w-full flex items-center justify-between border rounded-md px-3 py-2 text-left font-normal",
                    !isValidDate && "text-muted-foreground"
                  )}
                >
                  <div>
                    {isValidDate ? format(dateObj, "PPP") : <span>Pick a date</span>}
                  </div>
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
                </button>

                {open && (
                  <div className="absolute z-50 mt-2 bg-white border rounded-md shadow-lg p-2">
                    <DayPicker
                      mode="single"
                      selected={isValidDate ? dateObj : undefined}
                      onSelect={(selected) => {
                        if (selected) {
                          field.onChange(selected.toISOString());
                        }
                        setOpen(false);
                      }}
                      disabled={(d) =>
                        d > new Date() || d < new Date("1900-01-01")
                      }
                    />
                  </div>
                )}
              </div>
            );
          }}
        />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input placeholder="Enter description" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Recurring Toggle */}
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <label className="text-base font-medium">Recurring Transaction</label>
          <div className="text-sm text-muted-foreground">
            Set up a recurring schedule for this transaction
          </div>
        </div>
        <Controller
          control={control}
          name="isRecurring"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                if (!checked) {
                  setValue("recurringInterval", undefined);
                }
              }}
            />
          )}
        />
      </div>

      {/* Recurring Interval */}
      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Controller
            control={control}
            name="recurringInterval"
            rules={{ required: isRecurring ? "Recurring interval is required" : false }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button
          type="button"
          variant="outline"
          className="w-1/2"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" className="w-1/2" disabled={transactionLoading}>
          {transactionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  );
}
