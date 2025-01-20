import { format } from "date-fns";

interface DailyRecord {
  date: string;
  pomodoros: number;
  hours: number;
}

interface StatsTableProps {
  data: DailyRecord[];
}

export function StatsTable({ data }: StatsTableProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="border-b">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky top-0 px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/3">
                Date
              </th>
              <th className="sticky top-0 px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/3">
                Pomodoros
              </th>
              <th className="sticky top-0 px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/3">
                Hours
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full">
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((record) => (
              <tr key={record.date} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900 w-1/3">
                  {format(new Date(record.date), "MMM dd, yyyy")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 w-1/3">
                  {record.pomodoros}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 w-1/3">
                  {record.hours.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}