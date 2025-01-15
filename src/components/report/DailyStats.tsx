import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { CalendarPicker } from "./CalendarPicker";
import { StatsTable } from "./StatsTable";
import { AppDispatch, RootState } from "../../store/store";
import { fetchDailyStats } from "../../store/statsSlice";

export function DailyStats() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dispatch = useDispatch<AppDispatch>();
  const { dailyStats, loading, error } = useSelector((state: RootState) => state.stats);

  useEffect(() => {
    dispatch(fetchDailyStats(currentMonth));
  }, [currentMonth, dispatch]);

  const filteredData = dailyStats.filter(record => {
    const recordDate = new Date(record.date);
    return isWithinInterval(recordDate, {
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    });
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Daily Statistics</h2>
      
      <div className="grid md:grid-cols-[300px,1fr] gap-6">
        <CalendarPicker 
          selectedMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : filteredData.length > 0 ? (
            <StatsTable data={filteredData} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              No data available for this month
            </div>
          )}
        </div>
      </div>
    </div>
  );
}