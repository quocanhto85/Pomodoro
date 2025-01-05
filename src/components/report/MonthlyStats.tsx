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

const monthlyData = {
  labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  datasets: [
    {
      label: "Total Hours",
      data: [74.17, 135.00, 148.75, 25.00, 74.17, 135.00, 148.75, 25.00, 148.75, 25.00],
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
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Hours"
        }
      }
    }
  };

export function MonthlyStats() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Focus Hours</h2>
      <div className="bg-white rounded-lg p-6 border">
        <Bar data={monthlyData} options={options} />
      </div>
    </div>
  );
}