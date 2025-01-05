import { Clock, Calendar, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";

const stats = [
  { 
    icon: Clock,
    value: "382.92",
    label: "hours focused"
  },
  {
    icon: Calendar,
    value: "15.95",
    label: "days accessed"
  },
  {
    icon: Flame,
    value: "4",
    label: "day streak"
  }
];

export function ActivitySummary() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Activity Summary</h2>
      
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-rose-50">
            <div className="p-6 text-center">
              <div className="inline-block p-3 bg-white rounded-full mb-3">
                <stat.icon className="w-6 h-6 text-rose-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}