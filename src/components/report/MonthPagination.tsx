import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface MonthPaginationProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthPagination({ currentMonth, onMonthChange }: MonthPaginationProps) {
  const goToPreviousMonth = () => {
    const previousMonth = new Date(currentMonth.setMonth(currentMonth.getMonth() - 1));
    onMonthChange(previousMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth.setMonth(currentMonth.getMonth() + 1));
    onMonthChange(nextMonth);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={goToPreviousMonth}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      
      <h2 className="text-lg font-semibold">
        {format(currentMonth, "MMMM yyyy")}
      </h2>
      
      <button
        onClick={goToNextMonth}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}