"use client";

import { useEffect } from "react";
import { TIMER_MODES, TimerMode, PAUSED_ICON_COLOR } from "@/helpers/constants";

interface FaviconUpdaterProps {
  mode: TimerMode;
  isRunning: boolean;
}

export default function FaviconUpdater({ mode, isRunning }: FaviconUpdaterProps) {
  useEffect(() => {
    const color = isRunning ? TIMER_MODES[mode].iconColor : PAUSED_ICON_COLOR;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
        <circle cx="16" cy="16" r="14" fill="${color}"/>
        <path d="M14 10l8 6-8 6z" fill="white"/>
      </svg>
    `;
    
    const favicon = document.querySelector('link[rel="icon"]') || document.createElement("link");
    favicon.setAttribute("rel", "icon");
    favicon.setAttribute("type", "image/svg+xml");
    favicon.setAttribute("href", `data:image/svg+xml;base64,${btoa(svg)}`);
    
    if (!document.querySelector('link[rel="icon"]')) {
      document.head.appendChild(favicon);
    }
  }, [mode, isRunning]);

  return null;
}