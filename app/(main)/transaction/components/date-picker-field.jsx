"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export default function DatePickerField({ value, onChange, isClient }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const dateObj = value ? new Date(value) : null;
  const isValidDate = dateObj && !isNaN(dateObj.getTime());

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
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full flex items-center justify-between border rounded-md px-3 py-2 text-muted-foreground">
        <span>Loading...</span>
        <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
      </div>
    );
  }

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
          {isValidDate ? format(dateObj, "PPP") : "Pick a date"}
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
                onChange(selected.toISOString());
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
}
