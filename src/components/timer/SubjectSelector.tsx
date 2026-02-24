"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BookOpen, Plus, X, Check, Pencil } from "lucide-react";
import { STORAGE_KEYS, DEFAULT_SUBJECT } from "@/helpers/constants";
import { pomodoroService } from "@/services/api/pomodoro";

/** Strip whitespace and lowercase for duplicate detection (e.g. "🧬AI" vs "🧬 AI"). */
const normalizeSubject = (s: string) => s.replace(/\s+/g, "").toLowerCase();

interface SubjectSelectorProps {
  activeSubject: string;
  onSubjectChange: (subject: string) => void;
}

export default function SubjectSelector({ activeSubject, onSubjectChange }: SubjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [savedSubjects, setSavedSubjects] = useState<string[]>([]);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Load saved subjects from localStorage and fetch from DB
  useEffect(() => {
    const loadSubjects = async () => {
      // First, load from localStorage for instant display
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_SUBJECTS);
      const localSubjects: string[] = stored ? JSON.parse(stored) : [];

      // Then fetch from DB to ensure we have the latest
      try {
        const response = await pomodoroService.getSubjects();
        const dbSubjects: string[] = response.data
          .map((s: { name: string }) => s.name)
          .filter((name: string) => name !== DEFAULT_SUBJECT);

        // Merge: deduplicate by normalized name (handles "🧬AI" vs "🧬 AI")
        const seen = new Map<string, string>();
        for (const s of [...localSubjects, ...dbSubjects]) {
          const key = normalizeSubject(s);
          if (!seen.has(key)) seen.set(key, s);
        }
        const merged = [...seen.values()];
        setSavedSubjects(merged);
        localStorage.setItem(STORAGE_KEYS.SAVED_SUBJECTS, JSON.stringify(merged));
      } catch {
        // Fallback to localStorage only
        setSavedSubjects(localSubjects);
      }
    };

    loadSubjects();
  }, []);

  // Focus input when popover opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingSubject) {
      setTimeout(() => editInputRef.current?.focus(), 50);
    }
  }, [editingSubject]);

  const addSubject = useCallback((subject: string) => {
    const trimmed = subject.trim();
    if (!trimmed || trimmed === DEFAULT_SUBJECT) return;

    // Add to saved subjects if not already there
    setSavedSubjects(prev => {
      const norm = normalizeSubject(trimmed);
      if (prev.some(s => normalizeSubject(s) === norm)) return prev;
      const updated = [trimmed, ...prev];
      localStorage.setItem(STORAGE_KEYS.SAVED_SUBJECTS, JSON.stringify(updated));
      return updated;
    });

    onSubjectChange(trimmed);
    setInputValue("");
    setIsOpen(false);
  }, [onSubjectChange]);

  const selectSubject = useCallback((subject: string) => {
    onSubjectChange(subject);
    setIsOpen(false);
  }, [onSubjectChange]);

  const removeSubject = useCallback((subject: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedSubjects(prev => {
      const updated = prev.filter(s => s !== subject);
      localStorage.setItem(STORAGE_KEYS.SAVED_SUBJECTS, JSON.stringify(updated));
      return updated;
    });
    // If the removed subject was active, reset to General
    if (activeSubject === subject) {
      onSubjectChange(DEFAULT_SUBJECT);
    }
  }, [activeSubject, onSubjectChange]);

  const startRename = useCallback((subject: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubject(subject);
    setEditValue(subject);
  }, []);

  const commitRename = useCallback(() => {
    if (!editingSubject) return;

    const trimmed = editValue.trim();
    if (!trimmed || trimmed === DEFAULT_SUBJECT) {
      // Invalid name — cancel
      setEditingSubject(null);
      return;
    }

    if (trimmed === editingSubject) {
      // No change
      setEditingSubject(null);
      return;
    }

    setSavedSubjects(prev => {
      // If the new name already exists (normalized), just remove the old one
      const norm = normalizeSubject(trimmed);
      if (prev.some(s => s !== editingSubject && normalizeSubject(s) === norm)) {
        const updated = prev.filter(s => s !== editingSubject);
        localStorage.setItem(STORAGE_KEYS.SAVED_SUBJECTS, JSON.stringify(updated));
        return updated;
      }
      // Replace old name with new name
      const updated = prev.map(s => s === editingSubject ? trimmed : s);
      localStorage.setItem(STORAGE_KEYS.SAVED_SUBJECTS, JSON.stringify(updated));
      return updated;
    });

    // If the renamed subject was active, update the active subject
    if (activeSubject === editingSubject) {
      onSubjectChange(trimmed);
    }

    setEditingSubject(null);
  }, [editingSubject, editValue, activeSubject, onSubjectChange]);

  const cancelRename = useCallback(() => {
    setEditingSubject(null);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addSubject(inputValue);
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      commitRename();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancelRename();
    }
  };

  const isCustomSubject = activeSubject !== DEFAULT_SUBJECT;

  return (
    <div className="flex justify-center mt-6">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl
              transition-all duration-200 ease-in-out
              ${isCustomSubject
                ? "bg-white/25 text-white border border-white/30 shadow-lg"
                : "bg-white/10 text-white/80 border border-white/15 hover:bg-white/20 hover:text-white"
              }
            `}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isCustomSubject ? activeSubject : "Select a study field"}
            </span>
            {isCustomSubject && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/30">
                <Check className="w-3 h-3" />
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-80 p-0 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
          sideOffset={8}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              What are you studying?
            </h3>
            <p className="text-xs text-gray-500">
              Choose a field or type a new one
            </p>
          </div>

          {/* Input */}
          <div className="px-4 pb-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Mathematics, AI, Work..."
                className="flex-1 h-9 px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg
                  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300
                  transition-all duration-150"
              />
              <button
                onClick={() => addSubject(inputValue)}
                disabled={!inputValue.trim()}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-rose-500 text-white
                  hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-150 shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* Subjects List */}
          <div className="px-4 py-3 max-h-52 overflow-y-auto">
            {/* General / No Subject option */}
            <button
              onClick={() => selectSubject(DEFAULT_SUBJECT)}
              className={`
                w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left
                transition-all duration-150 mb-1
                ${activeSubject === DEFAULT_SUBJECT
                  ? "bg-rose-50 text-rose-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <div className={`w-2 h-2 rounded-full ${activeSubject === DEFAULT_SUBJECT ? "bg-rose-500" : "bg-gray-300"}`} />
              <span>General</span>
              <span className="text-xs text-gray-400 ml-auto">(no specific field)</span>
            </button>

            {/* Saved Subjects */}
            {savedSubjects.length > 0 && (
              <div className="space-y-0.5">
                {savedSubjects.map((subject) => (
                  <div
                    key={subject}
                    role="button"
                    tabIndex={0}
                    onClick={() => editingSubject !== subject && selectSubject(subject)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") selectSubject(subject); }}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left group cursor-pointer
                      transition-all duration-150
                      ${activeSubject === subject
                        ? "bg-rose-50 text-rose-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${activeSubject === subject ? "bg-rose-500" : "bg-gray-300"}`} />

                    {/* Inline rename input or display name */}
                    {editingSubject === subject ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        onBlur={commitRename}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 h-7 px-2 text-sm bg-white border border-rose-300 rounded
                          focus:outline-none focus:ring-2 focus:ring-rose-200
                          transition-all duration-150 min-w-0"
                      />
                    ) : (
                      <span className="truncate">{subject}</span>
                    )}

                    {/* Action buttons */}
                    {editingSubject !== subject && (
                      <div className="ml-auto flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={(e) => startRename(subject, e)}
                          className="p-0.5 rounded opacity-0 group-hover:opacity-100
                            text-gray-400 hover:text-blue-500 hover:bg-blue-50
                            transition-all duration-150"
                          aria-label={`Rename ${subject}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => removeSubject(subject, e)}
                          className="p-0.5 rounded opacity-0 group-hover:opacity-100
                            text-gray-400 hover:text-red-500 hover:bg-red-50
                            transition-all duration-150"
                          aria-label={`Remove ${subject}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {savedSubjects.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-3">
                No saved subjects yet. Type one above to get started!
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
