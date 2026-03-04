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
  TooltipItem,
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function MonthlyStats({
  monthlyPomodoros,
  subjects,
  monthlyBySubject,
  isLoading = false
}: MonthlyStatsProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Determine if we have subject data to show a stacked chart
  const hasSubjectData = subjects.length > 0 && Object.keys(monthlyBySubject).length > 0;

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    const el = tooltipRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
  }, []);

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
        callbacks: {
          title: (tooltipItems: TooltipItem<"bar">[]) => {
            return tooltipItems[0]?.label ?? "";
          },
          label: (context: TooltipItem<"bar">) => {
            const hours = context.parsed.y;
            if (hours === 0) return "";
            const datasetLabel = context.dataset.label || "";
            const pomodoros = Math.round((hours * 60) / 25);
            return `${datasetLabel}: ${hours} hrs (${pomodoros} pomos)`;
          },
          afterBody: (tooltipItems: TooltipItem<"bar">[]) => {
            if (!hasSubjectData) return "";
            const total = tooltipItems.reduce((sum, item) => sum + (item.parsed.y || 0), 0);
            if (total === 0) return "";
            const totalPomos = Math.round((total * 60) / 25);
            return `Total: ${total.toFixed(2)} hrs (${totalPomos} pomos)`;
          },
        },
        filter: (tooltipItem: TooltipItem<"bar">) => {
          return tooltipItem.parsed.y > 0;
        },
        external: (context: { chart: ChartJS; tooltip: TooltipModel<"bar"> }) => {
          const { chart, tooltip } = context;
          const tooltipEl = tooltipRef.current;
          const containerEl = containerRef.current;
          if (!tooltipEl || !containerEl) return;

          // Hide tooltip with delay so user can hover over it
          if (tooltip.opacity === 0) {
            hideTimeoutRef.current = setTimeout(() => {
              tooltipEl.style.opacity = "0";
              tooltipEl.style.pointerEvents = "none";
            }, 300);
            return;
          }

          // Cancel pending hide
          if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

          // Build HTML content
          let html = "";

          // Title
          if (tooltip.title?.length) {
            html += `<div style="font-weight:bold;font-size:14px;margin-bottom:8px;color:rgba(255,255,255,0.95);">${escapeHtml(tooltip.title[0])}</div>`;
          }

          // Body items with color swatches
          if (tooltip.body?.length) {
            tooltip.body.forEach((bodyItem: { before: string[]; lines: string[]; after: string[] }, i: number) => {
              const colors = tooltip.labelColors?.[i];
              bodyItem.lines.forEach((line: string) => {
                if (!line) return;
                const bg = colors ? (colors.backgroundColor as string) : "transparent";
                html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">`;
                html += `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${escapeHtml(bg)};flex-shrink:0;"></span>`;
                html += `<span>${escapeHtml(String(line))}</span>`;
                html += `</div>`;
              });
            });
          }

          // After body (totals)
          if (tooltip.afterBody?.length) {
            tooltip.afterBody.forEach((line: string) => {
              if (!line) return;
              html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.2);font-weight:600;">${escapeHtml(String(line).trim())}</div>`;
            });
          }

          tooltipEl.innerHTML = html;

          // Position relative to container
          const containerRect = containerEl.getBoundingClientRect();
          const canvasRect = chart.canvas.getBoundingClientRect();
          let left = canvasRect.left - containerRect.left + tooltip.caretX;
          let top = canvasRect.top - containerRect.top + tooltip.caretY;

          // Clamp so tooltip doesn't overflow container
          const tooltipWidth = tooltipEl.offsetWidth;
          const tooltipHeight = tooltipEl.offsetHeight;
          const maxLeft = containerRect.width - tooltipWidth - 8;
          const minLeft = 8;
          left = Math.max(minLeft, Math.min(left - tooltipWidth / 2, maxLeft));
          top = Math.max(8, top - tooltipHeight - 12);

          tooltipEl.style.left = left + "px";
          tooltipEl.style.top = top + "px";
          tooltipEl.style.opacity = "1";
          tooltipEl.style.pointerEvents = "auto";
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
          callback: (value: string | number) => `${value}`,
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
      <div
        ref={containerRef}
        className={`bg-white rounded-lg p-6 border relative ${isLoading ? "opacity-50" : ""}`}
      >
        <Bar data={monthlyData} options={options} />
        <div
          ref={tooltipRef}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            transition: "opacity 0.15s ease",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            color: "rgba(255, 255, 255, 0.9)",
            borderRadius: "8px",
            padding: "14px",
            border: "1px solid #555",
            fontSize: "13px",
            userSelect: "text",
            cursor: "text",
            zIndex: 50,
            maxWidth: "320px",
            whiteSpace: "nowrap",
          }}
        />
      </div>
    </div>
  );
}
