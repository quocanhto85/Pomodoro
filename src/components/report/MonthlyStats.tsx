import React, { useRef, useCallback, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipModel
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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMouseOnTooltipRef = useRef(false);
  const lastTooltipHtmlRef = useRef("");

  // Determine if we have subject data to show a stacked chart
  const hasSubjectData = subjects.length > 0 && Object.keys(monthlyBySubject).length > 0;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const hideTooltip = useCallback((el: HTMLDivElement) => {
    cancelHide();
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    hideTimeoutRef.current = setTimeout(() => {
      el.style.display = "none";
    }, 150);
  }, [cancelHide]);

  const externalTooltipHandler = useCallback(
    (context: { chart: ChartJS; tooltip: TooltipModel<"bar"> }) => {
      const { chart, tooltip } = context;
      const container = chartContainerRef.current;
      if (!container) return;

      // Get or create tooltip element
      let tooltipEl = tooltipRef.current;
      if (!tooltipEl) {
        tooltipEl = document.createElement("div");
        tooltipEl.style.cssText = [
          "position:absolute",
          "pointer-events:none",
          "user-select:text",
          "-webkit-user-select:text",
          "background:rgba(0,0,0,0.85)",
          "color:rgba(255,255,255,0.9)",
          "border:1px solid #555",
          "border-radius:8px",
          "padding:14px",
          "font-family:system-ui,-apple-system,sans-serif",
          "font-size:13px",
          "z-index:50",
          "transition:opacity 0.15s ease",
          "cursor:text",
          "max-width:350px",
          "display:none",
          "opacity:0",
        ].join(";");

        const el = tooltipEl;
        el.addEventListener("mouseenter", () => {
          isMouseOnTooltipRef.current = true;
          cancelHide();
        });
        el.addEventListener("mouseleave", () => {
          isMouseOnTooltipRef.current = false;
          hideTooltip(el);
        });

        container.appendChild(tooltipEl);
        tooltipRef.current = tooltipEl;
      }

      // If mouse is on the tooltip, don't let Chart.js interfere at all
      if (isMouseOnTooltipRef.current) {
        return;
      }

      // Chart.js says hide (mouse left the bars)
      if (tooltip.opacity === 0) {
        hideTooltip(tooltipEl);
        return;
      }

      // Mouse is on a bar — cancel any pending hide
      cancelHide();

      // Build tooltip content from dataPoints
      const dataPoints = tooltip.dataPoints || [];
      const nonZeroItems = dataPoints.filter((item) => item.parsed.y > 0);

      if (nonZeroItems.length === 0) {
        tooltipEl.style.opacity = "0";
        tooltipEl.style.pointerEvents = "none";
        tooltipEl.style.display = "none";
        return;
      }

      const titleLines = tooltip.title || [];
      let html = "";

      // Title (month name)
      if (titleLines.length > 0) {
        html += `<div style="font-size:14px;font-weight:bold;color:rgba(255,255,255,0.95);margin-bottom:8px">${titleLines[0]}</div>`;
      }

      // Each subject line
      nonZeroItems.forEach((item) => {
        const hours = item.parsed.y;
        const datasetLabel = item.dataset.label || "";
        const pomodoros = Math.round((hours * 60) / 25);
        const color = item.dataset.backgroundColor as string;

        html += `<div style="display:flex;align-items:center;gap:6px;padding:2px 0">`;
        html += `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color};flex-shrink:0"></span>`;
        html += `<span>${datasetLabel}: ${hours} hrs (${pomodoros} pomos)</span>`;
        html += `</div>`;
      });

      // Total line when multiple subjects
      if (hasSubjectData && nonZeroItems.length > 1) {
        const total = nonZeroItems.reduce((sum, item) => sum + (item.parsed.y || 0), 0);
        const totalPomos = Math.round((total * 60) / 25);
        html += `<div style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.2);font-weight:bold;color:rgba(255,255,255,0.95)">`;
        html += `Total: ${total.toFixed(2)} hrs (${totalPomos} pomos)`;
        html += `</div>`;
      }

      // Only update innerHTML if content changed (preserve text selection)
      if (lastTooltipHtmlRef.current !== html) {
        tooltipEl.innerHTML = html;
        lastTooltipHtmlRef.current = html;
      }

      // Position relative to chart container
      const canvasRect = chart.canvas.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const left = canvasRect.left - containerRect.left + tooltip.caretX;
      const top = canvasRect.top - containerRect.top + tooltip.caretY;

      tooltipEl.style.display = "block";
      tooltipEl.style.opacity = "1";
      tooltipEl.style.left = `${left}px`;
      tooltipEl.style.top = `${top}px`;
      tooltipEl.style.transform = "translate(-50%, -110%)";

      // Enable pointer-events so the user can hover onto the tooltip to select text.
      // We use a small delay so it doesn't immediately steal the mouse from the canvas.
      tooltipEl.style.pointerEvents = "auto";
    },
    [hasSubjectData, cancelHide, hideTooltip]
  );

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
        enabled: false,
        mode: "index",
        intersect: false,
        external: externalTooltipHandler,
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
      <div ref={chartContainerRef} className={`bg-white rounded-lg p-6 border relative ${isLoading ? "opacity-50" : ""}`}>
        <Bar data={monthlyData} options={options} />
      </div>
    </div>
  );
}
