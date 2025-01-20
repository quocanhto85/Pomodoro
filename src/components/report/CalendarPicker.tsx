import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarPickerProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function CalendarPicker({ selectedMonth, onMonthChange }: CalendarPickerProps) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const currentYear = selectedMonth.getFullYear();
  const currentMonth = selectedMonth.getMonth();

  return (
    <div className="bg-white rounded-lg shadow p-6 w-[300px]">
      {/* Year Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(new Date(currentYear - 1, currentMonth))}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-lg font-medium">{currentYear}</span>
        <button
          onClick={() => onMonthChange(new Date(currentYear + 1, currentMonth))}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Months Grid */}
      <div className="grid grid-cols-3 gap-2">
        {months.map((month, index) => (
          <button
            key={month}
            onClick={() => onMonthChange(new Date(currentYear, index))}
            className={`
              p-2 rounded text-sm transition-colors
              ${currentMonth === index 
                ? "bg-rose-500 text-white" 
                : "hover:bg-gray-100 text-gray-700"}
            `}
          >
            {month}
          </button>
        ))}
      </div>
    </div>
  );
}