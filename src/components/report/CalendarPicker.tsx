import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

interface CalendarPickerProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function CalendarPicker({ selectedMonth, onMonthChange }: CalendarPickerProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <DayPicker
        mode="single"
        month={selectedMonth}
        onMonthChange={onMonthChange}
        showOutsideDays
        classNames={{
          months: "flex flex-col",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "text-center text-sm relative p-0 hover:bg-gray-100 rounded-md",
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          day_selected: "bg-rose-500 text-white hover:bg-rose-600 hover:text-white focus:bg-rose-500 focus:text-white",
          day_today: "bg-gray-100",
          day_outside: "text-gray-400 opacity-50",
          day_disabled: "text-gray-400 opacity-50",
        }}
      />
    </div>
  );
}