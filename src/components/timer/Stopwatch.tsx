"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { formatTime } from "@/helpers/time";
import { MINUTES_PER_POMODORO } from "@/helpers/constants";
import { pomodoroService } from "@/services/api/pomodoro";
import Button from "@/components/common/Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StopwatchProps {
  activeSubject: string;
}

const DEFAULT_TITLE = "Pomodoro - Boost your productivity";

/** Elapsed seconds -> pomodoros (1 pomodoro = 25 min), kept to 2 decimals. */
const toPomodoros = (seconds: number) =>
  Math.round((seconds / 60 / MINUTES_PER_POMODORO) * 100) / 100;

export default function Stopwatch({ activeSubject }: StopwatchProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // baseRef = seconds banked from finished run segments (before any active one).
  // startRef = timestamp the current run segment began, or null when not running.
  const baseRef = useRef(0);
  const startRef = useRef<number | null>(null);

  const readElapsed = useCallback(
    () =>
      baseRef.current +
      (startRef.current != null ? (Date.now() - startRef.current) / 1000 : 0),
    []
  );

  // Tick once per second while running; resync when the tab regains focus.
  useEffect(() => {
    if (!isRunning) return;
    const tick = () => setElapsed(Math.floor(readElapsed()));
    tick();
    const interval = setInterval(tick, 1000);
    const onVisible = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isRunning, readElapsed]);

  const isPaused = !isRunning && elapsed > 0;
  const isIdle = !isRunning && !isPaused;

  // Show the live elapsed time in the browser tab title.
  useEffect(() => {
    document.title = isIdle
      ? "Stopwatch - Pomodoro"
      : `${formatTime(elapsed)} - ${isRunning ? "Focusing" : "Paused"}`;
  }, [elapsed, isRunning, isIdle]);

  // Restore the default title when leaving the stopwatch.
  useEffect(() => {
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  const start = useCallback(() => {
    baseRef.current = 0;
    startRef.current = Date.now();
    setElapsed(0);
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    baseRef.current = readElapsed();
    startRef.current = null;
    setElapsed(Math.floor(baseRef.current));
    setIsRunning(false);
  }, [readElapsed]);

  const resume = useCallback(() => {
    startRef.current = Date.now();
    setIsRunning(true);
  }, []);

  // Stop freezes the count immediately, then opens the save dialog.
  const requestStop = useCallback(() => {
    if (startRef.current != null) {
      baseRef.current = readElapsed();
      startRef.current = null;
      setElapsed(Math.floor(baseRef.current));
      setIsRunning(false);
    }
    setConfirmOpen(true);
  }, [readElapsed]);

  const confirmStop = useCallback(async () => {
    const count = toPomodoros(readElapsed());

    baseRef.current = 0;
    startRef.current = null;
    setIsRunning(false);
    setConfirmOpen(false);
    setElapsed(0);

    if (count <= 0) {
      toast.error("Session too short to record — nothing was saved.");
      return;
    }

    setSaving(true);
    try {
      await pomodoroService.incrementSession(activeSubject, count);
      toast.success(
        `Saved ${count} pomodoro${count === 1 ? "" : "s"} to ${activeSubject}.`
      );
    } catch {
      toast.error("Couldn't save your session. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [readElapsed, activeSubject]);

  const previewPomodoros = toPomodoros(elapsed);
  const previewHours = Math.round((elapsed / 3600) * 100) / 100;
  const actionButtonClass = "hud-action bg-pomodoro w-32 sm:w-40 py-3 text-xl font-bold";

  return (
    <div className="text-center">
      <div className="hud-timer text-[72px] sm:text-[96px] md:text-[120px] font-bold text-white leading-tight mb-6">
        {formatTime(elapsed)}
      </div>

      <div className="flex justify-center items-center gap-3 sm:gap-4">
        {isIdle && (
          <Button
            variant="secondary"
            className="hud-action bg-pomodoro w-44 sm:w-52 py-3 text-xl font-bold"
            onClick={start}
            disabled={saving}
          >
            START
          </Button>
        )}
        {isRunning && (
          <Button variant="secondary" className={actionButtonClass} onClick={pause}>
            PAUSE
          </Button>
        )}
        {isPaused && (
          <Button variant="secondary" className={actionButtonClass} onClick={resume}>
            RESUME
          </Button>
        )}
        {!isIdle && (
          <Button
            variant="secondary"
            className={actionButtonClass}
            onClick={requestStop}
          >
            STOP
          </Button>
        )}
      </div>

      <p className="mt-6 text-sm text-white/85">
        Count-up timer &mdash; pause anytime; your focused time is saved as pomodoros
        when you stop.
      </p>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="hud-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Save this focus session?</AlertDialogTitle>
            <AlertDialogDescription>
              The timer is stopped at {formatTime(elapsed)} on &quot;{activeSubject}
              &quot;. Saving will record{" "}
              <strong>
                {previewPomodoros} pomodoro{previewPomodoros === 1 ? "" : "s"}
              </strong>{" "}
              ({previewHours} h) to your stats and reset the timer to zero. Choose
              &quot;Cancel&quot; to keep the time paused.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hud-action">Cancel</AlertDialogCancel>
            <AlertDialogAction className="hud-action" onClick={confirmStop}>
              Save session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
