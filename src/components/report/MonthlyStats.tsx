import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem
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
  isLoading?: boolean;
}

export function MonthlyStats({ monthlyPomodoros, isLoading = false }: MonthlyStatsProps) {
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
        hoverBackgroundColor: "rgb(99, 90, 255)",
        barThickness: "flex" as const,
        maxBarThickness: 60
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
        enabled: true,
        mode: "index", // This makes the tooltip trigger across the entire x-axis at that index
        intersect: false, // This makes the tooltip show when hovering anywhere in the bar's x-axis range
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "rgba(255, 255, 255, 0.9)",
        bodyColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "#555",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 4,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: "bold"
        },
        bodyFont: {
          size: 14
        },
        callbacks: {
          title: (tooltipItems: TooltipItem<"bar">[]) => {
            return tooltipItems[0].label;
          },
          label: (context) => {
            const hours = context.parsed.y;
            return `${hours} hours`;
          },
          labelTextColor: () => {
            return "#fff";
          }
        }
      }
    },
    interaction: {
      mode: 'index', // Matches the tooltip mode
      intersect: false, // Makes interaction work across the entire column area
    },
    hover: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Hours"
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: (value) => `${value}`,
          color: '#666'
        }
      }
    },
    animation: {
      duration: 500,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Focus Hours</h2>
      <div className={`bg-white rounded-lg p-6 border relative ${isLoading ? "opacity-50" : ""}`}>
        <Bar data={monthlyData} options={options} />
      </div>
    </div>
  );
}