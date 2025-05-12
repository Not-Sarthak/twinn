"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/shadow-box";
import { cn } from "@/app/lib/utils";
import { Button } from "@/app/components/ui/form-elements";
import { Calendar } from "@/app/components/ui/calendar";
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  id?: string;
  dateRange: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  error?: any;
  minDate?: Date;
}

export function DatePicker({
  id,
  dateRange,
  onChange,
  placeholder = "Select date range",
  error,
  minDate,
}: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full flex items-center justify-start text-left font-normal",
            !dateRange && "text-muted-foreground",
            error && "border-red-500",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto bg-white p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={onChange}
          initialFocus
          disabled={(date) => (minDate ? date < minDate : false)}
          numberOfMonths={2}
          required={false}
        />
      </PopoverContent>
    </Popover>
  );
}
