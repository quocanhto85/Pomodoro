import { Clock, Calendar, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ActivitySummaryProps {
  totalPomodoros: number;
  isLoading?: boolean;
}

export function ActivitySummary({ totalPomodoros, isLoading }: ActivitySummaryProps) {
  // Convert pomodoros to hours (25 minutes per pomodoro)
  const totalHours = ((totalPomodoros * 25) / 60).toFixed(2);
  // Convert hours to days
  const totalDays = (Number(totalHours) / 24).toFixed(2);

  const stats = [
    { 
      icon: Flame,
      value: totalPomodoros.toString(),
      label: "pomodoros"
    },
    {
      icon: Clock,
      value: totalHours,
      label: "hours focused"
    },
    {
      icon: Calendar,
      value: totalDays,
      label: "days accessed"
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Activity Summary</h2>
      
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className={`bg-rose-50 relative ${isLoading ? "opacity-50" : ""}`}>
            <div className="p-3 sm:p-6 text-center">
              <div className="inline-block p-2 sm:p-3 bg-white rounded-full mb-2 sm:mb-3">
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-800 mb-1 break-words">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}