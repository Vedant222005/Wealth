"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

function AccountChart({ transactions }) {
  const [dateRange, setDateRange] = useState("1M");

  const filterData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    const filtered = transactions.filter(
      (t) =>
        new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
    );

    const grouped = filtered.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd"); // Display-friendly
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      if (transaction.type === "INCOME") {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expense += transaction.amount;
      }
      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [transactions, dateRange]);

  const totals = useMemo(() => {
  let income = 0;
  let expense = 0;

  filterData.forEach((entry) => {
    income += entry.income;
    expense += entry.expense;
  });

  const net = income - expense;
  return { income, expense, net };
}, [filterData]);


  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>Account Overview</CardTitle>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-[300px]">
        
              <div className="mb-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-sm text-muted-foreground">Total Income</div>
          <div className="text-green-600 font-semibold">₹{totals.income.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Total Expense</div>
          <div className="text-red-600 font-semibold">₹{totals.expense.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Net Balance</div>
          <div className="text-green-600 font-semibold">₹{totals.net.toFixed(2)}</div>
        </div>
      </div>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filterData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#4CAF50" activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="expense" stroke="#F44336" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default AccountChart;
