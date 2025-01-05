import React from 'react';
import { format } from 'date-fns';

const dailyData = [
  { date: '2024-09-08', pomodoros: 9, hours: 3.75 },
  { date: '2024-09-09', pomodoros: 7, hours: 2.92 },
  { date: '2024-09-10', pomodoros: 6, hours: 2.50 },
  // ... add more data
];

export function DailyStats() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Daily Statistics</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pomodoros
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dailyData.map((day) => (
              <tr key={day.date} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(day.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {day.pomodoros}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {day.hours}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}