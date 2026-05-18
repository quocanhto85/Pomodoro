import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DailyRecord, getSubjectColor } from "@/types/stats";

interface StatsTableProps {
  data: DailyRecord[];
}

function SubjectDot({ index }: { index: number }) {
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
      style={{ backgroundColor: getSubjectColor(index) }}
    />
  );
}

export function StatsTable({ data }: StatsTableProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Build a global subject-to-color-index map for consistent colors across the table
  const allSubjects = new Map<string, number>();
  let colorIdx = 0;
  for (const record of data) {
    for (const sub of record.subjects) {
      if (!allSubjects.has(sub.subject)) {
        allSubjects.set(sub.subject, colorIdx++);
      }
    }
  }

  const toggleExpand = (date: string) => {
    setExpandedDates(prev => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const hasAnyExpandable = data.some(record =>
    record.subjects.length > 1 ||
    (record.subjects.length === 1 && record.subjects[0].subject !== "General")
  );

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="border-b">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky top-0 px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[40%]">
                Date
              </th>
              <th className="sticky top-0 px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[30%]">
                Pomodoros
              </th>
              <th className="sticky top-0 px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[30%]">
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
            {data.map((record) => {
              const isExpanded = expandedDates.has(record.date);
              const hasMultipleSubjects = record.subjects.length > 1;
              const isExpandable = hasMultipleSubjects || (record.subjects.length === 1 && record.subjects[0].subject !== "General");

              return (
                <tr key={record.date} className="group">
                  <td colSpan={3} className="p-0">
                    {/* Main Row */}
                    <div
                      className={`flex items-center hover:bg-gray-50 transition-colors ${isExpandable ? "cursor-pointer" : ""}`}
                      onClick={() => isExpandable && toggleExpand(record.date)}
                    >
                      <div className="px-6 py-4 text-sm text-gray-900 w-[40%] flex items-center gap-2">
                        {isExpandable && (
                          <span className="text-gray-400">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </span>
                        )}
                        {!isExpandable && hasAnyExpandable && (
                          <span className="w-4" /> /* Spacer for alignment */
                        )}
                        {format(new Date(record.date), "MMM dd, yyyy")}
                      </div>
                      <div className="stat-value px-6 py-4 text-sm text-gray-900 w-[30%] font-medium">
                        {record.pomodoros}
                      </div>
                      <div className="stat-value px-6 py-4 text-sm text-gray-900 w-[30%]">
                        {record.hours.toFixed(2)}
                      </div>
                    </div>

                    {/* Expanded Subject Rows */}
                    {isExpanded && record.subjects.map((sub) => {
                      const subjectColorIndex = allSubjects.get(sub.subject) ?? 0;
                      return (
                        <div
                          key={`${record.date}-${sub.subject}`}
                          className="flex items-center bg-gray-50/60 border-t border-gray-50"
                        >
                          <div className="px-6 py-2.5 text-sm text-gray-600 w-[40%] flex items-center gap-2">
                            {hasAnyExpandable && <span className="w-4" />}
                            <span className="pl-2 flex items-center gap-2">
                              <SubjectDot index={subjectColorIndex} />
                              {sub.subject}
                            </span>
                          </div>
                          <div className="px-6 py-2.5 text-sm text-gray-600 w-[30%]">
                            {sub.pomodoros}
                          </div>
                          <div className="px-6 py-2.5 text-sm text-gray-600 w-[30%]">
                            {sub.hours.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
