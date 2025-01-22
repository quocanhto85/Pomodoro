import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyStatsProps {
  monthlyPomodoros: number[];
}

export function MonthlyStats({ monthlyPomodoros }: MonthlyStatsProps) {
  // Convert pomodoros to hours for each month
  const monthlyHours = monthlyPomodoros.map(count => 
    Number(((count * 25) / 60).toFixed(2))
  );

  const monthlyData = {
    labels: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ],
    datasets: [
      {
        label: "Total Hours",
        data: monthlyHours,
        backgroundColor: "rgb(79, 70, 229)",
        borderRadius: 6,
      }
    ]
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Monthly Focus Hours",
        font: {
          size: 16,
          weight: "bold"
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const hours = context.parsed.y;
            return `${hours} hours`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Hours"
        },
        ticks: {
          callback: (value) => `${value}`
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Focus Hours</h2>
      <div className="bg-white rounded-lg p-6 border">
        <Bar data={monthlyData} options={options} />
      </div>
    </div>
  );
}