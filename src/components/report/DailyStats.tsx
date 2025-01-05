import { useState } from "react";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { MonthPagination } from "./MonthPagination";
import { StatsTable } from "./StatsTable";

// This would typically come from your data source
const dailyData = [
  { date: "2024-09-08", pomodoros: 9, hours: 3.75 },
  { date: "2024-09-09", pomodoros: 7, hours: 2.92 },
  { date: "2024-09-10", pomodoros: 6, hours: 2.50 },
  // Add more data as needed
];

export function DailyStats() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const filteredData = dailyData.filter(record => {
    const recordDate = new Date(record.date);
    return isWithinInterval(recordDate, {
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    });
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Daily Statistics</h2>
      
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <MonthPagination 
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
        
        {filteredData.length > 0 ? (
          <StatsTable data={filteredData} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            No data available for this month
          </div>
        )}
      </div>
    </div>
  );
}