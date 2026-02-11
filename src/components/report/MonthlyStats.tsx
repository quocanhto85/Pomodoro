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
import { MonthlySubjectData, getSubjectColor } from "@/types/stats";

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
  subjects: string[];
  monthlyBySubject: MonthlySubjectData;
  isLoading?: boolean;
}

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function MonthlyStats({
  monthlyPomodoros,
  subjects,
  monthlyBySubject,
  isLoading = false
}: MonthlyStatsProps) {
  // Determine if we have subject data to show a stacked chart
  const hasSubjectData = subjects.length > 0 && Object.keys(monthlyBySubject).length > 0;

  // Build datasets
  const datasets = hasSubjectData
    ? subjects.map((subject, index) => {
        const monthlyData = monthlyBySubject[subject] || Array(12).fill(0);
        const monthlyHours = monthlyData.map(count =>
          Number(((count * 25) / 60).toFixed(2))
        );

        return {
          label: subject,
          data: monthlyHours,
          backgroundColor: getSubjectColor(index),
          hoverBackgroundColor: getSubjectColor(index),
          borderRadius: index === subjects.length - 1 ? 4 : 0,
          barThickness: "flex" as const,
          maxBarThickness: 60,
        };
      })
    : [
        {
          label: "Total Hours",
          data: monthlyPomodoros.map(count =>
            Number(((count * 25) / 60).toFixed(2))
          ),
          backgroundColor: "rgb(79, 70, 229)",
          hoverBackgroundColor: "rgb(99, 90, 255)",
          borderRadius: 6,
          barThickness: "flex" as const,
          maxBarThickness: 60,
        }
      ];

  const monthlyData = {
    labels: MONTH_LABELS,
    datasets,
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        display: hasSubjectData,
        position: "top" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "rectRounded",
          padding: 16,
          font: { size: 12 },
        },
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
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        titleColor: "rgba(255, 255, 255, 0.95)",
        bodyColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "#555",
        borderWidth: 1,
        padding: 14,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: "bold"
        },
        bodyFont: {
          size: 13
        },
        bodySpacing: 6,
        callbacks: {
          title: (tooltipItems: TooltipItem<"bar">[]) => {
            return tooltipItems[0]?.label ?? "";
          },
          label: (context) => {
            const hours = context.parsed.y;
            if (hours === 0) return "";
            const datasetLabel = context.dataset.label || "";
            const pomodoros = Math.round((hours * 60) / 25);
            return `  ${datasetLabel}: ${hours} hrs (${pomodoros} pomos)`;
          },
          afterBody: (tooltipItems: TooltipItem<"bar">[]) => {
            if (!hasSubjectData) return "";
            const total = tooltipItems.reduce((sum, item) => sum + (item.parsed.y || 0), 0);
            if (total === 0) return "";
            const totalPomos = Math.round((total * 60) / 25);
            return `\n  Total: ${total.toFixed(2)} hrs (${totalPomos} pomos)`;
          },
          labelColor: (context) => {
            return {
              borderColor: context.dataset.backgroundColor as string,
              backgroundColor: context.dataset.backgroundColor as string,
              borderWidth: 2,
              borderRadius: 2,
            };
          },
        },
        filter: (tooltipItem: TooltipItem<"bar">) => {
          return tooltipItem.parsed.y > 0;
        },
      }
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    hover: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        stacked: hasSubjectData,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)"
        }
      },
      y: {
        stacked: hasSubjectData,
        beginAtZero: true,
        title: {
          display: true,
          text: "Hours"
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)"
        },
        ticks: {
          callback: (value) => `${value}`,
          color: "#666"
        }
      }
    },
    animation: {
      duration: 500,
      easing: "easeOutQuart"
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
